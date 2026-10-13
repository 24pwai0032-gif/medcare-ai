import { normalizeSeverity, type SeverityLevel } from '@/lib/severity';
import type { AnalyzeResponse, Scan } from '@/services/types';
import type { ParsedReport } from './parseReport';

export type SubtypeId = 'chest' | 'mri' | 'ct' | 'bone';
export type ScanKind = 'xray' | 'bone' | 'ecg' | 'blood' | 'prescription' | 'skin' | 'unknown';

/** One shape for a fresh analysis result and a stored scan, so ReportView renders both. */
export interface ReportData {
  scanId: number | null;
  scanType: string;
  subtype?: SubtypeId;
  createdAt: string | Date;
  report: string;
  urduReport: string | null;
  severity: string | null;
  status: string;
  doctorNotes: string | null;
  patientName?: string;
  patientEmail?: string;
  saved: boolean;
}

export function scanKind(scanType: string | null | undefined): ScanKind {
  switch (scanType) {
    case 'xray':
    case 'bone':
    case 'ecg':
    case 'prescription':
    case 'skin':
      return scanType;
    case 'blood':
    case 'blood-test':
      return 'blood';
    default:
      return 'unknown';
  }
}

export function reportFromScan(scan: Scan): ReportData {
  return {
    scanId: scan.id,
    scanType: scan.scan_type,
    createdAt: scan.created_at,
    report: scan.report ?? '',
    urduReport: null,
    severity: scan.severity ?? null,
    status: scan.status,
    doctorNotes: scan.doctor_notes ?? null,
    patientName: scan.patient_name,
    patientEmail: scan.patient_email,
    saved: true,
  };
}

export function reportFromAnalysis(result: AnalyzeResponse, scanType: string, subtype?: SubtypeId): ReportData {
  const scanId = typeof result.scan_id === 'number' ? result.scan_id : null;
  return {
    scanId,
    scanType: result.scan_type || scanType,
    subtype,
    createdAt: new Date(),
    report: result.report ?? '',
    urduReport: result.urdu_report?.trim() || null,
    severity: result.severity ?? null,
    status: 'pending',
    doctorNotes: null,
    saved: result.scan_saved !== false && scanId !== null,
  };
}

/**
 * The report's own SEVERITY line wins over the stored value: the backend picks "Severe"
 * whenever the word appears anywhere, even in "no severe findings".
 */
export function resolveSeverity(parsed: ParsedReport, stored: string | null) {
  const storedLevel = normalizeSeverity(stored);
  const level: SeverityLevel | null = parsed.statedSeverity ?? storedLevel;
  return { level, storedLevel, mismatch: !!parsed.statedSeverity && !!storedLevel && parsed.statedSeverity !== storedLevel };
}
