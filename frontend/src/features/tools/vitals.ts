import type { SeverityLevel } from '@/lib/severity';

export type VitalId = 'heartRate' | 'systolic' | 'diastolic' | 'temperature' | 'oxygen' | 'respiratory';
export type VitalStatus = 'normal' | 'warning' | 'critical';

interface VitalRange {
  id: VitalId;
  normal: readonly [number, number];
  warning: readonly [number, number];
  /** Input sanity bounds to catch typos (e.g. °C typed into the °F field); not clinical thresholds. */
  bounds: readonly [number, number];
}

/** Thresholds are unchanged from the original Vital Signs page. */
export const VITALS: readonly VitalRange[] = [
  { id: 'heartRate', normal: [60, 100], warning: [50, 120], bounds: [1, 300] },
  { id: 'systolic', normal: [90, 120], warning: [80, 140], bounds: [1, 300] },
  { id: 'diastolic', normal: [60, 80], warning: [50, 90], bounds: [1, 200] },
  { id: 'temperature', normal: [97, 99], warning: [95, 103], bounds: [80, 115] },
  { id: 'oxygen', normal: [95, 100], warning: [90, 100], bounds: [1, 100] },
  { id: 'respiratory', normal: [12, 20], warning: [8, 30], bounds: [1, 80] },
];

export function vitalStatus(range: VitalRange, value: number): VitalStatus {
  if (value >= range.normal[0] && value <= range.normal[1]) return 'normal';
  if (value >= range.warning[0] && value <= range.warning[1]) return 'warning';
  return 'critical';
}

export function overallStatus(statuses: VitalStatus[]): VitalStatus {
  if (statuses.includes('critical')) return 'critical';
  if (statuses.includes('warning')) return 'warning';
  return 'normal';
}

export const STATUS_LEVEL: Record<VitalStatus, SeverityLevel> = { normal: 'normal', warning: 'moderate', critical: 'critical' };

/** Accepts "98.6" and "98,6"; returns null for anything that isn't a plain number. */
export function parseReading(raw: string): number | null {
  const text = raw.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(text)) return null;
  return Number(text);
}
