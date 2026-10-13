import { describe, expect, it } from 'vitest';

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

const en = import.meta.glob<Json>('./locales/en/*.json', { eager: true, import: 'default' });
const ur = import.meta.glob<Json>('./locales/ur/*.json', { eager: true, import: 'default' });

function flatten(value: Json, prefix = '', out: Record<string, string> = {}) {
  if (Array.isArray(value)) value.forEach((item, i) => flatten(item, `${prefix}[${i}]`, out));
  else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) flatten(child, prefix ? `${prefix}.${key}` : key, out);
  } else out[prefix] = String(value ?? '');
  return out;
}

const tokens = (text: string) => [...text.matchAll(/{{\s*(\w+)\s*}}|<\/?(\w+)>/g)].map((m) => m[0].replace(/\s/g, '')).sort();

describe('translations', () => {
  const namespaces = Object.keys(en).map((path) => path.replace('./locales/en/', ''));

  it('has an Urdu file for every English namespace', () => {
    expect(namespaces.length).toBeGreaterThan(0);
    for (const ns of namespaces) expect(ur[`./locales/ur/${ns}`], ns).toBeDefined();
  });

  for (const ns of namespaces) {
    describe(ns, () => {
      const enFlat = flatten(en[`./locales/en/${ns}`]);
      const urFlat = flatten(ur[`./locales/ur/${ns}`] ?? {});

      it('has exactly the same keys, including one-to-one list items', () => {
        expect(Object.keys(urFlat).sort()).toEqual(Object.keys(enFlat).sort());
      });

      it('has no empty strings', () => {
        for (const [key, text] of [...Object.entries(enFlat), ...Object.entries(urFlat)]) {
          expect(text.trim(), key).not.toBe('');
        }
      });

      it('keeps the same placeholders and markup tags', () => {
        for (const [key, text] of Object.entries(enFlat)) {
          expect(tokens(urFlat[key] ?? ''), key).toEqual(tokens(text));
        }
      });
    });
  }
});
