import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const localeFor = (language: string) => (language === 'ur' ? 'ur-PK' : 'en-PK');

/**
 * Backend timestamps carry no timezone and are stored in UTC. The patient endpoint sends
 * "2026-10-10T09:14:00", the doctor endpoints "2026-10-10 09:14:00.123456".
 */
export function parseServerDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  let iso = value.trim().replace(' ', 'T').replace(/(\.\d{3})\d+/, '$1');
  if (!/(z|[+-]\d{2}:?\d{2})$/i.test(iso)) iso += 'Z';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(value: string | Date | null | undefined, language: string) {
  const date = value instanceof Date ? value : parseServerDate(value);
  if (!date) return '';
  return new Intl.DateTimeFormat(localeFor(language), { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function formatDate(value: string | Date | null | undefined, language: string) {
  const date = value instanceof Date ? value : parseServerDate(value);
  if (!date) return '';
  return new Intl.DateTimeFormat(localeFor(language), { dateStyle: 'medium' }).format(date);
}

const LRI = String.fromCodePoint(0x2066);
const PDI = String.fromCodePoint(0x2069);

/** Keeps a Latin unit such as "°F" or "/min" in order inside Urdu (right-to-left) text. */
export const isolateLtr = (text: string) => `${LRI}${text}${PDI}`;

/** Never use this for phone numbers: it would print 1122 as "1,122". */
export function formatNumber(value: number, language: string, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(localeFor(language), options).format(value);
}

export function formatFileSize(bytes: number, language: string) {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${formatNumber(mb, language, { maximumFractionDigits: 1 })} MB`;
  return `${formatNumber(Math.max(1, Math.round(bytes / 1024)), language)} KB`;
}

/** Formatters bound to the current UI language; re-render on language change. */
export function useFormatters() {
  const { i18n } = useTranslation();
  const language = i18n.language;
  return useMemo(
    () => ({
      language,
      dateTime: (value: string | Date | null | undefined) => formatDateTime(value, language),
      date: (value: string | Date | null | undefined) => formatDate(value, language),
      number: (value: number, options?: Intl.NumberFormatOptions) => formatNumber(value, language, options),
      fileSize: (bytes: number) => formatFileSize(bytes, language),
    }),
    [language],
  );
}
