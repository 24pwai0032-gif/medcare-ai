import { describe, expect, it } from 'vitest';
import { inlineText, parseInline, parseReport } from './parseReport';

const SAMPLE = `**CLINICAL INDICATION**: Cough and fever for one week.

**TECHNIQUE**: PA view, adequate inspiration.

**FINDINGS**:
- **Lungs & Airways**: Patchy opacity in the right lower zone.
- **Heart & Mediastinum**: Normal cardiothoracic ratio.

**IMPRESSION**:
1. Right lower zone consolidation, likely pneumonia.
2. No pleural effusion.

**RESULTS TABLE**:
| Parameter | Result | Normal Range | Status |
|---|---|---|---|
| Hemoglobin | 10.2 g/dL | 12-16 | Low |

**SEVERITY**: Moderate

**CONFIDENCE**: 85%

**اردو خلاصہ**:
دائیں پھیپھڑے کے نچلے حصے میں انفیکشن کے آثار ہیں۔
- ڈاکٹر سے رجوع کریں۔`;

describe('parseReport', () => {
  const parsed = parseReport(SAMPLE);

  it('splits capitalised bold headings into sections', () => {
    expect(parsed.sections.map((s) => s.title)).toEqual([
      'CLINICAL INDICATION',
      'TECHNIQUE',
      'FINDINGS',
      'IMPRESSION',
      'RESULTS TABLE',
      'SEVERITY',
      'CONFIDENCE',
    ]);
  });

  it('keeps text after the heading as the first paragraph', () => {
    const block = parsed.sections[0].blocks[0];
    expect(block.kind === 'paragraph' && inlineText(block.content)).toBe('Cough and fever for one week.');
  });

  it('keeps mixed-case bold labels inline inside bullets', () => {
    const list = parsed.sections[2].blocks[0];
    expect(list.kind).toBe('list');
    if (list.kind !== 'list') return;
    expect(list.ordered).toBe(false);
    expect(list.items[0][0]).toEqual({ text: 'Lungs & Airways', bold: true });
  });

  it('parses numbered lists and tables', () => {
    const ordered = parsed.sections[3].blocks[0];
    expect(ordered.kind === 'list' && ordered.ordered).toBe(true);
    const table = parsed.sections[4].blocks[0];
    expect(table.kind).toBe('table');
    if (table.kind !== 'table') return;
    expect(table.header.map(inlineText)).toEqual(['Parameter', 'Result', 'Normal Range', 'Status']);
    expect(table.rows[0].map(inlineText)).toEqual(['Hemoglobin', '10.2 g/dL', '12-16', 'Low']);
  });

  it('extracts the Urdu summary and keeps it out of the English sections', () => {
    expect(parsed.urdu).toBe('دائیں پھیپھڑے کے نچلے حصے میں انفیکشن کے آثار ہیں۔\n• ڈاکٹر سے رجوع کریں۔');
    expect(JSON.stringify(parsed.sections)).not.toContain('ڈاکٹر');
  });

  it('reads the severity and confidence the report states', () => {
    expect(parsed.statedSeverity).toBe('moderate');
    expect(parsed.statedConfidence).toBe(85);
  });

  it('does not treat "severe" elsewhere in the text as the severity', () => {
    const report = '**IMPRESSION**: No severe abnormality.\n\n**SEVERITY**: Mild';
    expect(parseReport(report).statedSeverity).toBe('mild');
  });

  it('reads a value on the line after a bare label', () => {
    const report = '**SEVERITY**\nNormal\n\n**CONFIDENCE**\n70 %';
    const result = parseReport(report);
    expect(result.statedSeverity).toBe('normal');
    expect(result.statedConfidence).toBe(70);
  });

  it('reports no confidence when the text has none (the API value would be synthetic)', () => {
    const result = parseReport('**IMPRESSION**: Clear lungs. SpO2 98% noted.');
    expect(result.statedConfidence).toBeNull();
    expect(result.statedSeverity).toBeNull();
  });

  it('handles markdown headings and empty input', () => {
    expect(parseReport('## Findings\nAll clear').sections[0].title).toBe('Findings');
    expect(parseReport(null)).toEqual({ sections: [], urdu: null, statedSeverity: null, statedConfidence: null });
  });
});

describe('parseInline', () => {
  it('splits bold runs and strips stray markdown', () => {
    expect(parseInline('**Heart Rate**: 72 *bpm*')).toEqual([{ text: 'Heart Rate', bold: true }, { text: ': 72 bpm' }]);
  });

  it('ignores an unmatched bold marker', () => {
    expect(parseInline('Value **12')).toEqual([{ text: 'Value 12' }]);
  });
});
