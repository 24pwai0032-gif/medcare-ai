import { describe, expect, it } from 'vitest';
import { formatDateTime, formatNumber, parseServerDate } from './format';
import { normalizeSeverity, severityRank } from './severity';

describe('normalizeSeverity', () => {
  it.each([
    ['Normal', 'normal'],
    ['Mild', 'mild'],
    ['MODERATE', 'moderate'],
    ['Severe', 'severe'],
    ['Critical', 'critical'],
    ['URGENT', 'critical'],
  ] as const)('maps %s to %s', (input, expected) => {
    expect(normalizeSeverity(input)).toBe(expected);
  });

  it('returns null for missing or unknown values', () => {
    expect(normalizeSeverity(undefined)).toBeNull();
    expect(normalizeSeverity('')).toBeNull();
    expect(normalizeSeverity('n/a')).toBeNull();
  });

  it('ranks levels in order', () => {
    expect(severityRank('critical')).toBeGreaterThan(severityRank('severe'));
    expect(severityRank('normal')).toBeGreaterThan(severityRank(null));
  });
});

describe('parseServerDate', () => {
  it('treats the patient-endpoint format as UTC', () => {
    expect(parseServerDate('2026-10-10T09:14:00')?.toISOString()).toBe('2026-10-10T09:14:00.000Z');
  });

  it('treats the doctor-endpoint format (space, microseconds) as UTC', () => {
    expect(parseServerDate('2026-10-10 09:14:00.123456')?.toISOString()).toBe('2026-10-10T09:14:00.123Z');
  });

  it('keeps an explicit offset', () => {
    expect(parseServerDate('2026-10-10T14:14:00+05:00')?.toISOString()).toBe('2026-10-10T09:14:00.000Z');
  });

  it('returns null for garbage', () => {
    expect(parseServerDate('not a date')).toBeNull();
    expect(parseServerDate(null)).toBeNull();
  });
});

describe('locale formatting', () => {
  it('formats dates in English and Urdu', () => {
    const date = new Date('2026-10-10T09:14:00Z');
    expect(formatDateTime(date, 'en')).toMatch(/2026/);
    expect(formatDateTime(date, 'ur')).toMatch(/اکتوبر/);
  });

  it('uses Latin digits in Urdu', () => {
    expect(formatNumber(98.6, 'ur')).toBe('98.6');
  });
});
