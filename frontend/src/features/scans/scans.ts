import { useQuery } from '@tanstack/react-query';
import { Bone, FileText, HeartPulse, Pill, ScanLine, ScanFace, TestTube, type LucideIcon } from 'lucide-react';
import { parseServerDate } from '@/lib/format';
import { normalizeSeverity, type SeverityLevel } from '@/lib/severity';
import { parseReport } from '@/features/report/parseReport';
import { scanKind, type ScanKind } from '@/features/report/reportData';
import { api } from '@/services/api';
import type { Scan } from '@/services/types';

export const SCAN_ICONS: Record<ScanKind, LucideIcon> = {
  xray: ScanLine,
  bone: Bone,
  ecg: HeartPulse,
  blood: TestTube,
  prescription: Pill,
  skin: ScanFace,
  unknown: FileText,
};

const time = (scan: Scan) => parseServerDate(scan.created_at)?.getTime() ?? 0;
export const newestFirst = (a: Scan, b: Scan) => time(b) - time(a) || b.id - a.id;
export const oldestFirst = (a: Scan, b: Scan) => time(a) - time(b) || a.id - b.id;

const severityCache = new Map<string, SeverityLevel | null>();

/** The severity the report itself states, falling back to the stored value. Memoised per report text. */
export function displaySeverity(scan: Scan): SeverityLevel | null {
  const key = scan.report ?? '';
  if (!severityCache.has(key)) severityCache.set(key, parseReport(key).statedSeverity);
  return severityCache.get(key) ?? normalizeSeverity(scan.severity);
}

export const scanKeys = {
  mine: ['scans', 'mine'] as const,
  pending: ['scans', 'doctor', 'pending'] as const,
  all: ['scans', 'doctor', 'all'] as const,
};

/** The patient's own scans. The API has no single-scan endpoint, so detail pages read this list too. */
export function useMyScans() {
  return useQuery({
    queryKey: scanKeys.mine,
    queryFn: api.myScans,
    select: (scans) => [...scans].sort(newestFirst),
  });
}

export { scanKind };
