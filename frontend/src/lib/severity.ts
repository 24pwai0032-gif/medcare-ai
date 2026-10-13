export const SEVERITY_LEVELS = ['normal', 'mild', 'moderate', 'severe', 'critical'] as const;
export type SeverityLevel = (typeof SEVERITY_LEVELS)[number];

const RANK: Record<SeverityLevel, number> = { normal: 0, mild: 1, moderate: 2, severe: 3, critical: 4 };

/** Maps the API's free-text severity ("Normal", "Mild", "Moderate", "Severe") to a level. */
export function normalizeSeverity(value: string | null | undefined): SeverityLevel | null {
  const v = (value ?? '').trim().toLowerCase();
  if (!v) return null;
  if (v.includes('critical') || v.includes('urgent')) return 'critical';
  if (v.includes('severe')) return 'severe';
  if (v.includes('moderate')) return 'moderate';
  if (v.includes('mild')) return 'mild';
  if (v.includes('normal') || v.includes('minimal')) return 'normal';
  return null;
}

export const severityRank = (level: SeverityLevel | null) => (level ? RANK[level] : -1);
