import { normalizeSeverity, type SeverityLevel } from '@/lib/severity';

/**
 * Parses the markdown-like report Gemini returns (bold or # headings, bullets, numbered
 * lists, pipe tables) into plain data. No HTML is ever produced, so model output can't
 * inject markup.
 */
export interface Inline {
  text: string;
  bold?: boolean;
}

export type Block =
  | { kind: 'paragraph'; content: Inline[] }
  | { kind: 'list'; ordered: boolean; items: Inline[][] }
  | { kind: 'table'; header: Inline[][]; rows: Inline[][][] };

export interface ReportSection {
  title: string | null;
  blocks: Block[];
}

export interface ParsedReport {
  sections: ReportSection[];
  /** The "اردو خلاصہ" section. The API stores it only inside the report text. */
  urdu: string | null;
  /** Severity as written in the report's own SEVERITY line. */
  statedSeverity: SeverityLevel | null;
  /** Confidence only when the report states it; the API invents one otherwise. */
  statedConfidence: number | null;
}

const ARABIC = /[؀-ۿ]/;
const URDU_HEADING = /اردو|\burdu\b/i;

export const hasArabicScript = (text: string) => ARABIC.test(text);

/** Mostly Arabic-script text should be laid out right to left. */
export function isMostlyArabic(text: string) {
  const arabic = (text.match(/[؀-ۿ]/g) ?? []).length;
  const latin = (text.match(/[A-Za-z]/g) ?? []).length;
  return arabic > latin;
}

const stripMarks = (text: string) => text.replace(/[*_`#]/g, '').trim();

export function parseInline(text: string): Inline[] {
  let source = text;
  if ((source.match(/\*\*/g) ?? []).length % 2 === 1) {
    const last = source.lastIndexOf('**');
    source = source.slice(0, last) + source.slice(last + 2);
  }
  const out: Inline[] = [];
  source.split('**').forEach((part, i) => {
    const clean = part.replace(/\*/g, '').replace(/`/g, '').replace(/\s+/g, ' ');
    if (!clean) return;
    out.push(i % 2 === 1 ? { text: clean, bold: true } : { text: clean });
  });
  return out;
}

export const inlineText = (content: Inline[]) => content.map((c) => c.text).join('').trim();

function headingOf(line: string): { title: string; rest: string } | null {
  const markdown = line.match(/^#{1,6}\s+(.+?)\s*#*$/);
  if (markdown) return { title: stripMarks(markdown[1]).replace(/:$/, ''), rest: '' };

  // "**FINDINGS**: text" (or "**FINDINGS:**"); capitals or Urdu mark a section, mixed case is an inline label.
  const bold = line.match(/^\*\*([^*]+?)\*\*\s*:?\s*(.*)$/);
  if (bold) {
    const title = bold[1].replace(/:\s*$/, '').trim();
    if (!/[a-z]/.test(title) && /[A-Z؀-ۿ]/.test(title)) return { title, rest: bold[2].trim() };
    return null;
  }

  const plain = line.match(/^([A-Z][A-Z0-9 &/(),'-]{2,}):\s*(.*)$/);
  if (plain) return { title: plain[1].trim(), rest: plain[2].trim() };
  return null;
}

const cellsOf = (line: string) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => parseInline(cell.trim()));

const isTableSeparator = (line: string) => /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line.trim());

function valueAfterLabel(lines: string[], label: RegExp): string | null {
  for (let i = 0; i < lines.length; i++) {
    const line = stripMarks(lines[i]);
    const match = line.match(new RegExp(`^${label.source}\\s*(?:[:：\\-–—]\\s*(.*))?$`, 'i'));
    if (!match) continue;
    if (match[1]?.trim()) return match[1].trim();
    const next = lines.slice(i + 1).find((l) => l.trim());
    if (next) return stripMarks(next);
  }
  return null;
}

export function findStatedSeverity(lines: string[]): SeverityLevel | null {
  const value = valueAfterLabel(lines, /severity(?:\s+level)?/);
  const word = value?.match(/\b(normal|mild|moderate|severe|critical)\b/i)?.[1];
  return normalizeSeverity(word);
}

export function findStatedConfidence(lines: string[]): number | null {
  const value = valueAfterLabel(lines, /confidence(?:\s+(?:level|score))?/);
  const number = value?.match(/(\d{1,3}(?:\.\d+)?)\s*%/)?.[1];
  if (!number) return null;
  const parsed = Math.round(Number(number));
  return parsed >= 0 && parsed <= 100 ? parsed : null;
}

export function parseReport(report: string | null | undefined): ParsedReport {
  const lines = (report ?? '').replace(/\r\n?/g, '\n').split('\n');
  const sections: ReportSection[] = [];
  const englishLines: string[] = [];
  const urduLines: string[] = [];
  let current: ReportSection = { title: null, blocks: [] };
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: Inline[][] } | null = null;
  let table: string[] = [];
  let inUrdu = false;

  const flushParagraph = () => {
    if (paragraph.length) current.blocks.push({ kind: 'paragraph', content: parseInline(paragraph.join(' ')) });
    paragraph = [];
  };
  const flushList = () => {
    if (list?.items.length) current.blocks.push({ kind: 'list', ...list });
    list = null;
  };
  const flushTable = () => {
    const rows = table.filter((row) => !isTableSeparator(row)).map(cellsOf);
    if (rows.length) current.blocks.push({ kind: 'table', header: rows[0], rows: rows.slice(1) });
    table = [];
  };
  const flushAll = () => {
    flushParagraph();
    flushList();
    flushTable();
  };
  const startSection = (title: string | null) => {
    flushAll();
    if (current.title || current.blocks.length) sections.push(current);
    current = { title, blocks: [] };
  };

  for (const raw of lines) {
    const line = raw.trim();
    const heading = line ? headingOf(line) : null;

    if (heading && URDU_HEADING.test(heading.title)) {
      flushAll();
      inUrdu = true;
      if (heading.rest) urduLines.push(stripMarks(heading.rest));
      continue;
    }
    if (inUrdu) {
      // A Latin-only heading after the Urdu summary returns to the English report.
      if (heading && !hasArabicScript(heading.title)) inUrdu = false;
      else {
        if (line) urduLines.push(line.replace(/^[-*•+]\s+/, '• ').replace(/[*#_`]/g, '').trim());
        continue;
      }
    }

    englishLines.push(raw);
    if (!line) {
      flushAll();
      continue;
    }
    if (heading) {
      startSection(heading.title);
      if (heading.rest) paragraph.push(heading.rest);
      continue;
    }
    if (line.startsWith('|')) {
      flushParagraph();
      flushList();
      table.push(line);
      continue;
    }
    flushTable();
    const bullet = line.match(/^[-*•+]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    if (bullet || numbered) {
      flushParagraph();
      const ordered = !!numbered;
      if (list && list.ordered !== ordered) flushList();
      list ??= { ordered, items: [] };
      list.items.push(parseInline((bullet ?? numbered)![1]));
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  startSection(null);

  return {
    sections: sections.filter((section) => section.blocks.length || section.title),
    urdu: urduLines.length ? urduLines.join('\n') : null,
    statedSeverity: findStatedSeverity(englishLines),
    statedConfidence: findStatedConfidence(englishLines),
  };
}
