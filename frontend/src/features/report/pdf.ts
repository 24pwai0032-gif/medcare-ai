// Loaded only when the user clicks "Download PDF" (keeps jsPDF and html2canvas off every other page).
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { hasArabicScript, inlineText, type Inline, type ReportSection } from './parseReport';

export interface PdfContent {
  fileName: string;
  brand: string;
  subtitle: string;
  title: string;
  meta: Array<[label: string, value: string]>;
  disclaimer: string[];
  sections: ReportSection[];
  doctorNotes: { label: string; text: string } | null;
  /** `label` is the English section heading; `heading` and the rest are drawn as an image. */
  urdu: { label: string; heading: string; text: string | null; disclaimer: string[] };
  footer: string;
  pageLabel: (page: number, total: number) => string;
}

type Rgb = [number, number, number];
const INK: Rgb = [15, 23, 42];
const MUTED: Rgb = [71, 85, 105];
const PRIMARY: Rgb = [15, 118, 110];
const LINE: Rgb = [226, 232, 240];
const INFO_BG: Rgb = [240, 247, 246];
const INFO_BORDER: Rgb = [185, 220, 215];
const INFO_INK: Rgb = [11, 74, 69];

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 16;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_SPACE = 14;
const LINE_H = 5;

/** The built-in PDF fonts only cover Latin-1; map common typography and drop the rest. */
export function toPdfText(text: string) {
  const mapped = text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u2192/g, '->')
    .replace(/\u2265/g, '>=')
    .replace(/\u2264/g, '<=')
    .replace(/\u2248/g, '~')
    .replace(/[\u2022\u00B7]/g, '-')
    .replace(/[\u00A0\u202F]/g, ' ');
  // Keep tab, newlines, printable ASCII and Latin-1.
  return Array.from(mapped)
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || (code >= 32 && code <= 126) || (code >= 160 && code <= 255);
    })
    .join('');
}

interface Word {
  text: string;
  bold: boolean;
  width: number;
}

class Writer {
  readonly doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  y = MARGIN;

  ensure(height: number) {
    if (this.y + height > PAGE_H - MARGIN - FOOTER_SPACE) {
      this.doc.addPage();
      this.y = MARGIN;
    }
  }

  style(size: number, bold = false, color: Rgb = INK) {
    this.doc.setFont('helvetica', bold ? 'bold' : 'normal');
    this.doc.setFontSize(size);
    this.doc.setTextColor(...color);
  }

  /** Word-wraps runs of normal and bold text. */
  layout(runs: Inline[], width: number, size: number): Word[][] {
    const lines: Word[][] = [];
    let line: Word[] = [];
    let used = 0;
    for (const run of runs) {
      this.style(size, !!run.bold);
      for (const token of toPdfText(run.text).split(/(\s+)/).filter(Boolean)) {
        if (/^\s+$/.test(token)) {
          if (line.length) {
            const space = this.doc.getTextWidth(' ');
            line.push({ text: ' ', bold: !!run.bold, width: space });
            used += space;
          }
          continue;
        }
        const tokenWidth = this.doc.getTextWidth(token);
        if (used + tokenWidth > width && line.length) {
          while (line.at(-1)?.text === ' ') line.pop();
          lines.push(line);
          line = [];
          used = 0;
        }
        line.push({ text: token, bold: !!run.bold, width: tokenWidth });
        used += tokenWidth;
      }
    }
    if (line.length) lines.push(line);
    return lines;
  }

  rich(runs: Inline[], { x = MARGIN, width = CONTENT_W, size = 10, color = INK } = {}) {
    for (const line of this.layout(runs, width, size)) {
      this.ensure(LINE_H);
      let cursor = x;
      for (const word of line) {
        this.style(size, word.bold, color);
        this.doc.text(word.text, cursor, this.y + 3.6);
        cursor += word.width;
      }
      this.y += LINE_H;
    }
  }

  /** Keeps a heading on the same page as the start of its section. */
  heading(text: string, keepWith = LINE_H * 3) {
    this.ensure(LINE_H * 2 + keepWith);
    this.y += 2;
    this.style(10.5, true, PRIMARY);
    this.doc.text(toPdfText(text).toUpperCase(), MARGIN, this.y + 3.6);
    this.y += LINE_H + 1;
  }

  table(header: Inline[][], rows: Inline[][][]) {
    const columns = Math.max(header.length, ...rows.map((r) => r.length), 1);
    const cellW = CONTENT_W / columns;
    const drawRow = (cells: Inline[][], bold: boolean) => {
      const wrapped = Array.from({ length: columns }, (_, c) =>
        this.layout(cells[c] ?? [], cellW - 3, 9).map((words) => words.map((w) => w.text).join('')),
      );
      const height = Math.max(1, ...wrapped.map((l) => l.length)) * 4.2 + 2.4;
      this.ensure(height);
      this.doc.setDrawColor(...LINE);
      if (bold) {
        this.doc.setFillColor(238, 242, 244);
        this.doc.rect(MARGIN, this.y, CONTENT_W, height, 'F');
      }
      wrapped.forEach((lines, c) => {
        this.style(9, bold);
        lines.forEach((text, i) => this.doc.text(text, MARGIN + c * cellW + 1.5, this.y + 4.4 + i * 4.2));
      });
      this.doc.rect(MARGIN, this.y, CONTENT_W, height, 'S');
      this.y += height;
    };
    drawRow(header, true);
    rows.forEach((row) => drawRow(row, false));
    this.y += 2;
  }

  /** Places a rendered canvas at full content width, splitting it across pages if needed. */
  image(canvas: HTMLCanvasElement) {
    const mmPerPx = CONTENT_W / canvas.width;
    let offset = 0;
    while (offset < canvas.height) {
      this.ensure(20);
      const availablePx = Math.floor((PAGE_H - MARGIN - FOOTER_SPACE - this.y) / mmPerPx);
      const slice = Math.min(availablePx, canvas.height - offset);
      const part = document.createElement('canvas');
      part.width = canvas.width;
      part.height = slice;
      part.getContext('2d')?.drawImage(canvas, 0, offset, canvas.width, slice, 0, 0, canvas.width, slice);
      this.doc.addImage(part, 'PNG', MARGIN, this.y, CONTENT_W, slice * mmPerPx);
      this.y += slice * mmPerPx + 2;
      offset += slice;
      if (offset < canvas.height) {
        this.doc.addPage();
        this.y = MARGIN;
      }
    }
  }
}

/** Renders right-to-left Urdu with the real Nastaliq font, which jsPDF can't shape. */
export async function renderRtl(parts: { heading?: string; paragraphs: string[]; note?: string[] }) {
  const host = document.createElement('div');
  host.className = 'pdf-render-host';
  host.lang = 'ur';
  host.dir = 'rtl';
  if (parts.heading) {
    const h = document.createElement('h2');
    h.textContent = parts.heading;
    host.append(h);
  }
  for (const text of parts.paragraphs) {
    const p = document.createElement('p');
    p.textContent = text;
    host.append(p);
  }
  if (parts.note?.length) {
    const note = document.createElement('div');
    note.className = 'pdf-render-note';
    for (const text of parts.note) {
      const p = document.createElement('p');
      p.textContent = text;
      note.append(p);
    }
    host.append(note);
  }
  document.body.append(host);
  try {
    await document.fonts.load('400 18px "Noto Nastaliq Urdu"');
    await document.fonts.ready;
    return await html2canvas(host, { scale: 2, backgroundColor: '#ffffff', logging: false });
  } finally {
    host.remove();
  }
}

export async function buildAndSavePdf(content: PdfContent) {
  const w = new Writer();
  const { doc } = w;

  w.style(16, true, PRIMARY);
  doc.text(toPdfText(content.brand), MARGIN, w.y + 6);
  w.style(9, false, MUTED);
  doc.text(toPdfText(content.subtitle), PAGE_W - MARGIN, w.y + 6, { align: 'right' });
  w.y += 11;
  doc.setDrawColor(...LINE);
  doc.line(MARGIN, w.y, PAGE_W - MARGIN, w.y);
  w.y += 6;
  w.style(15, true);
  doc.text(toPdfText(content.title), MARGIN, w.y + 5);
  w.y += 10;

  for (const [label, value] of content.meta) {
    w.ensure(LINE_H);
    w.style(9.5, true, MUTED);
    doc.text(toPdfText(label), MARGIN, w.y + 3.6);
    w.style(9.5);
    doc.text(toPdfText(value), MARGIN + 62, w.y + 3.6, { maxWidth: CONTENT_W - 62 });
    w.y += LINE_H;
  }
  w.y += 3;

  const disclaimerLines = content.disclaimer.flatMap((text) => w.layout([{ text }], CONTENT_W - 8, 9.5));
  const boxH = disclaimerLines.length * LINE_H + 5;
  w.ensure(boxH);
  doc.setFillColor(...INFO_BG);
  doc.setDrawColor(...INFO_BORDER);
  doc.roundedRect(MARGIN, w.y, CONTENT_W, boxH, 1.5, 1.5, 'FD');
  w.style(9.5, false, INFO_INK);
  disclaimerLines.forEach((line, i) => doc.text(line.map((word) => word.text).join(''), MARGIN + 4, w.y + 6 + i * LINE_H));
  w.y += boxH + 6;

  for (const section of content.sections) {
    if (section.title) w.heading(section.title);
    for (const block of section.blocks) {
      if (block.kind === 'table') {
        w.table(block.header, block.rows);
        continue;
      }
      const items = block.kind === 'paragraph' ? [block.content] : block.items;
      for (const [i, item] of items.entries()) {
        if (hasArabicScript(inlineText(item))) {
          w.image(await renderRtl({ paragraphs: [inlineText(item)] }));
          continue;
        }
        if (block.kind === 'list') {
          w.ensure(LINE_H);
          w.style(10);
          doc.text(block.ordered ? `${i + 1}.` : '-', MARGIN + 1, w.y + 3.6);
          w.rich(item, { x: MARGIN + 7, width: CONTENT_W - 7 });
        } else {
          w.rich(item);
        }
      }
      w.y += 2;
    }
  }

  if (content.doctorNotes) {
    w.heading(content.doctorNotes.label);
    if (hasArabicScript(content.doctorNotes.text)) w.image(await renderRtl({ paragraphs: content.doctorNotes.text.split('\n') }));
    else w.rich([{ text: content.doctorNotes.text }]);
  }

  const urduBlock = await renderRtl({
    heading: content.urdu.heading,
    paragraphs: content.urdu.text ? content.urdu.text.split('\n') : [],
    note: content.urdu.disclaimer,
  });
  // Move the whole Urdu block to the next page rather than splitting it under its heading.
  const urduHeight = urduBlock.height * (CONTENT_W / urduBlock.width);
  w.heading(content.urdu.label, Math.min(urduHeight, PAGE_H - MARGIN * 2 - FOOTER_SPACE - LINE_H * 3));
  w.image(urduBlock);

  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page++) {
    doc.setPage(page);
    doc.setDrawColor(...LINE);
    doc.line(MARGIN, PAGE_H - MARGIN, PAGE_W - MARGIN, PAGE_H - MARGIN);
    w.style(7.5, false, MUTED);
    doc.text(toPdfText(content.footer), MARGIN, PAGE_H - MARGIN + 5);
    doc.text(toPdfText(content.pageLabel(page, total)), PAGE_W - MARGIN, PAGE_H - MARGIN + 5, { align: 'right' });
  }

  doc.save(content.fileName);
}
