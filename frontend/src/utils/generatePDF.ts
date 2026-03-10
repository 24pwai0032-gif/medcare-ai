// src/utils/generatePDF.ts
import jsPDF from 'jspdf';

/* ── Colors ───────────────────────────────── */
const C = {
  navy:      [15, 32, 65]    as const,
  blue:      [37, 99, 235]   as const,
  darkGray:  [30, 41, 59]    as const,
  midGray:   [71, 85, 105]   as const,
  lightGray: [148, 163, 184] as const,
  bgBlue:    [237, 245, 255] as const,
  bgGreen:   [236, 253, 245] as const,
  bgYellow:  [255, 251, 235] as const,
  bgRed:     [254, 242, 242] as const,
  green:     [16, 185, 129]  as const,
  amber:     [217, 119, 6]   as const,
  red:       [220, 38, 38]   as const,
  white:     [255, 255, 255] as const,
  black:     [0, 0, 0]       as const,
};

const sevCfg = (s: string) => {
  const v = (s || '').toLowerCase();
  if (v.includes('severe'))   return { color: C.red,   bg: C.bgRed,    label: 'SEVERE'   };
  if (v.includes('moderate')) return { color: C.amber,  bg: C.bgYellow, label: 'MODERATE' };
  if (v.includes('mild'))     return { color: C.amber,  bg: C.bgYellow, label: 'MILD'     };
  return                             { color: C.green,  bg: C.bgGreen,  label: 'NORMAL'   };
};

/* ── Helpers ──────────────────────────────── */
const setC = (doc: jsPDF, c: readonly number[]) => doc.setTextColor(c[0], c[1], c[2]);
const setF = (doc: jsPDF, c: readonly number[]) => doc.setFillColor(c[0], c[1], c[2]);
const setD = (doc: jsPDF, c: readonly number[]) => doc.setDrawColor(c[0], c[1], c[2]);

const checkPage = (doc: jsPDF, y: number, need: number, margin: number): number => {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + need > pageH - margin) {
    doc.addPage();
    return 22;
  }
  return y;
};

/* ── Section parser: splits report by **HEADING** ── */
const parseSections = (report: string): { title: string; body: string }[] => {
  const lines = report.split('\n');
  const sections: { title: string; body: string }[] = [];
  let cur: { title: string; body: string } | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    // Match **HEADING** or **HEADING**: at start of line
    const headMatch = line.match(/^\*\*(.+?)\*\*\s*:?\s*(.*)/);
    if (headMatch) {
      if (cur) sections.push(cur);
      const rest = headMatch[2]?.trim() || '';
      cur = { title: headMatch[1].trim(), body: rest };
    } else if (cur) {
      cur.body += (cur.body ? '\n' : '') + raw;
    } else {
      // Text before any heading
      if (line) {
        cur = { title: '', body: raw };
      }
    }
  }
  if (cur) sections.push(cur);
  return sections;
};

/* ═══════════════════════════════════════════════
   PUBLIC: Generate professional medical PDF
   ═══════════════════════════════════════════════ */
export const generateMedicalPDF = (data: {
  scanType: string;
  report: string;
  urduReport?: string;
  severity: string;
  confidence: number;
  time: number;
  filename: string;
  patientName?: string;
  doctorNotes?: string;
  status?: string;
  scanDate?: string;
}) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();   // 210
  const H = doc.internal.pageSize.getHeight();   // 297
  const M = 18; // margin
  const contentW = W - M * 2;
  const sev = sevCfg(data.severity);

  /* ── HEADER BAR ────────────────────────── */
  setF(doc, C.navy);
  doc.rect(0, 0, W, 38, 'F');
  // Accent line
  setF(doc, C.blue);
  doc.rect(0, 38, W, 2.5, 'F');

  // Logo text
  setC(doc, C.white);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('MedCare', M, 16);
  doc.setFontSize(24);
  setC(doc, [96, 165, 250]);
  doc.text(' AI', M + doc.getTextWidth('MedCare'), 16);

  // Subtitle
  setC(doc, [148, 163, 184]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text("Pakistan's First AI-Powered Medical Imaging Platform", M, 24);

  // Right side — report ID & date
  setC(doc, [148, 163, 184]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const reportId = `RPT-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  doc.text(`Report ID: ${reportId}`, W - M, 14, { align: 'right' });
  const dateStr = data.scanDate
    ? new Date(data.scanDate).toLocaleString('en-PK', { dateStyle: 'long', timeStyle: 'short' })
    : new Date().toLocaleString('en-PK', { dateStyle: 'long', timeStyle: 'short' });
  doc.text(`Date: ${dateStr}`, W - M, 20, { align: 'right' });
  doc.text(`Scan: ${data.scanType.replace(/-/g, ' ').toUpperCase()}`, W - M, 26, { align: 'right' });

  let y = 48;

  /* ── PATIENT & SCAN INFO BOX ───────────── */
  setF(doc, C.bgBlue);
  doc.roundedRect(M, y, contentW, 24, 3, 3, 'F');
  setD(doc, [200, 220, 245]);
  doc.roundedRect(M, y, contentW, 24, 3, 3, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  setC(doc, C.navy);
  doc.text('PATIENT DETAILS', M + 6, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setC(doc, C.darkGray);
  const patientName = data.patientName || 'Patient';
  doc.text(`Name: ${patientName}`, M + 6, y + 14);
  doc.text(`File: ${data.filename || 'N/A'}`, M + 6, y + 20);

  // Right column
  doc.text(`Scan Type: ${data.scanType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`, W / 2 + 5, y + 14);
  doc.text(`Analysis Time: ${data.time?.toFixed(1) || '—'}s`, W / 2 + 5, y + 20);

  y += 30;

  /* ── SEVERITY + CONFIDENCE ROW ─────────── */
  const boxW = (contentW - 6) / 3;

  // Severity box
  setF(doc, sev.bg);
  doc.roundedRect(M, y, boxW, 22, 2.5, 2.5, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setC(doc, C.midGray);
  doc.text('SEVERITY', M + boxW / 2, y + 7, { align: 'center' });
  doc.setFontSize(14);
  setC(doc, sev.color);
  doc.text(sev.label, M + boxW / 2, y + 17, { align: 'center' });

  // Confidence box
  const cx = M + boxW + 3;
  setF(doc, C.bgBlue);
  doc.roundedRect(cx, y, boxW, 22, 2.5, 2.5, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setC(doc, C.midGray);
  doc.text('AI CONFIDENCE', cx + boxW / 2, y + 7, { align: 'center' });
  doc.setFontSize(14);
  setC(doc, C.blue);
  doc.text(`${Math.round(data.confidence)}%`, cx + boxW / 2, y + 17, { align: 'center' });

  // Status box
  const sx = cx + boxW + 3;
  const statusLabel = (data.status || 'pending').toUpperCase();
  const statusBg = statusLabel === 'APPROVED' ? C.bgGreen : statusLabel === 'REJECTED' ? C.bgRed : C.bgYellow;
  const statusClr = statusLabel === 'APPROVED' ? C.green : statusLabel === 'REJECTED' ? C.red : C.amber;
  setF(doc, statusBg);
  doc.roundedRect(sx, y, boxW, 22, 2.5, 2.5, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setC(doc, C.midGray);
  doc.text('STATUS', sx + boxW / 2, y + 7, { align: 'center' });
  doc.setFontSize(14);
  setC(doc, statusClr);
  doc.text(statusLabel, sx + boxW / 2, y + 17, { align: 'center' });

  y += 28;

  /* ── DIVIDER ───────────────────────────── */
  setD(doc, [220, 225, 235]);
  doc.line(M, y, W - M, y);
  y += 6;

  /* ── REPORT BODY — parsed sections ─────── */
  const sections = parseSections(data.report || '');
  const renderLines = (text: string, startY: number): number => {
    let ly = startY;
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .split('\n');

    for (const rawLine of cleanText) {
      const trimmed = rawLine.trim();
      if (!trimmed) { ly += 3; continue; }

      const isBullet = trimmed.startsWith('-') || trimmed.startsWith('•');
      const displayText = isBullet ? trimmed.replace(/^[-•]\s*/, '') : trimmed;
      const indent = isBullet ? M + 8 : M + 4;
      const wrapW = W - indent - M;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      setC(doc, C.darkGray);
      const wrapped = doc.splitTextToSize(displayText, wrapW);

      for (let wi = 0; wi < wrapped.length; wi++) {
        ly = checkPage(doc, ly, 6, 28);
        if (isBullet && wi === 0) {
          // bullet dot
          setF(doc, C.blue);
          doc.circle(M + 5, ly - 1.2, 1, 'F');
        }
        doc.text(wrapped[wi], indent, ly);
        ly += 5;
      }
    }
    return ly;
  };

  if (sections.length > 0) {
    for (const sec of sections) {
      y = checkPage(doc, y, 18, 28);

      // Skip Urdu section — we handle it separately
      if (sec.title.includes('\u0627\u0631\u062f\u0648') || sec.title.includes('Urdu')) continue;

      if (sec.title) {
        // Section heading with accent bar
        setF(doc, C.blue);
        doc.rect(M, y - 0.5, 2.5, 6, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        setC(doc, C.navy);
        doc.text(sec.title.toUpperCase(), M + 6, y + 4);
        y += 10;
      }

      y = renderLines(sec.body, y);
      y += 4;
    }
  } else {
    // Fallback: render entire report as plain text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    setC(doc, C.navy);
    doc.text('AI MEDICAL REPORT', M, y + 4);
    y += 10;
    y = renderLines(data.report || '', y);
  }

  /* ── DOCTOR NOTES (if any) ─────────────── */
  if (data.doctorNotes) {
    y = checkPage(doc, y, 22, 28);
    y += 4;
    setF(doc, C.bgGreen);
    doc.roundedRect(M, y, contentW, 5 + 8, 2.5, 2.5, 'F');
    // Re-measure after wrapping
    const noteLines = doc.splitTextToSize(data.doctorNotes, contentW - 12);
    const noteH = 12 + noteLines.length * 5;
    setF(doc, C.bgGreen);
    doc.roundedRect(M, y, contentW, noteH, 2.5, 2.5, 'F');
    setD(doc, [16, 185, 129]);
    doc.roundedRect(M, y, contentW, noteH, 2.5, 2.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setC(doc, C.green);
    doc.text("DOCTOR'S NOTES", M + 6, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    setC(doc, C.darkGray);
    let ny = y + 13;
    for (const nl of noteLines) {
      doc.text(nl, M + 6, ny);
      ny += 5;
    }
    y += noteH + 4;
  }

  /* ── DISCLAIMER ────────────────────────── */
  y = checkPage(doc, y, 18, 28);
  y += 4;
  setF(doc, C.bgYellow);
  doc.roundedRect(M, y, contentW, 14, 2, 2, 'F');
  setD(doc, [217, 119, 6]);
  doc.roundedRect(M, y, contentW, 14, 2, 2, 'S');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setC(doc, C.amber);
  doc.text('DISCLAIMER:', M + 5, y + 5.5);
  doc.setFont('helvetica', 'normal');
  setC(doc, [120, 80, 0]);
  doc.text('This AI-generated report is for preliminary screening only. Final clinical decisions', M + 30, y + 5.5);
  doc.text('must be made by a licensed medical professional after thorough examination.', M + 5, y + 11);

  /* ── FOOTER on every page ──────────────── */
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    // Footer bar
    setF(doc, C.navy);
    doc.rect(0, H - 14, W, 14, 'F');
    setF(doc, C.blue);
    doc.rect(0, H - 14, W, 1.5, 'F');

    setC(doc, [148, 163, 184]);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('MedCare AI  |  Syed Hassan Tayyab  |  Atomcamp Cohort 15  |  2026', M, H - 5);

    setC(doc, [96, 165, 250]);
    doc.text(`Page ${i} of ${pageCount}`, W - M, H - 5, { align: 'right' });

    // Top border (subtle) on pages after first
    if (i > 1) {
      setF(doc, C.blue);
      doc.rect(0, 0, W, 2, 'F');
    }
  }

  /* ── SAVE ──────────────────────────────── */
  const filename = `MedCare_AI_${data.scanType.replace(/-/g, '_')}_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};