import type { SeverityLevel } from '@/lib/severity';

export const PHQ9_ITEMS = 9;
export type Phq9Answer = 0 | 1 | 2 | 3;
export type Phq9Band = 'minimal' | 'mild' | 'moderate' | 'moderatelySevere' | 'severe';

/** Standard PHQ-9 bands: 0–4, 5–9, 10–14, 15–19, 20–27. */
export function bandFor(total: number): Phq9Band {
  if (total <= 4) return 'minimal';
  if (total <= 9) return 'mild';
  if (total <= 14) return 'moderate';
  if (total <= 19) return 'moderatelySevere';
  return 'severe';
}

/**
 * Item 9 asks about thoughts of being better off dead or of self-harm. Any answer above
 * "Not at all" triggers the crisis panel, whatever the total score.
 */
export function scorePhq9(answers: ReadonlyArray<Phq9Answer | null>) {
  const total = answers.reduce<number>((sum, answer) => sum + (answer ?? 0), 0);
  return {
    total,
    band: bandFor(total),
    crisis: (answers[PHQ9_ITEMS - 1] ?? 0) > 0,
    complete: answers.length === PHQ9_ITEMS && answers.every((answer) => answer !== null),
  };
}

export const BAND_LEVEL: Record<Phq9Band, SeverityLevel> = {
  minimal: 'normal',
  mild: 'mild',
  moderate: 'moderate',
  moderatelySevere: 'severe',
  severe: 'critical',
};

/** Reassuring advice is never shown next to a positive item 9. */
export const showAdvice = (band: Phq9Band, crisis: boolean) => !crisis || (band !== 'minimal' && band !== 'mild');
