import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { DOCTOR, expect, PATIENT, prepare, settle, test, type Preferences } from './fixtures';

const ROUTES: Array<{ path: string; user?: Preferences['user'] }> = [
  { path: '/' },
  { path: '/login' },
  { path: '/register' },
  { path: '/emergency' },
  { path: '/emergency/heart-attack' },
  { path: '/about' },
  { path: '/privacy' },
  { path: '/terms' },
  { path: '/no-such-page' },
  ...['/app', '/app/scans', '/app/scans/37', '/app/diagnosis', '/app/mental-health', '/app/vitals'].map((path) => ({ path, user: PATIENT })),
  ...['xray', 'bone', 'ecg', 'blood', 'prescription'].map((id) => ({ path: `/app/analyze/${id}`, user: PATIENT })),
  ...['/doctor', '/doctor/scans', '/doctor/scans/41'].map((path) => ({ path, user: DOCTOR })),
];

const COMBOS = [
  { lang: 'en', theme: 'light', width: 1280 },
  { lang: 'ur', theme: 'dark', width: 360 },
] as const;

async function overflowAt(page: Page, width: number) {
  await page.setViewportSize({ width, height: 800 });
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

for (const combo of COMBOS) {
  test.describe(`${combo.lang}, ${combo.theme}, ${combo.width}px`, () => {
    for (const route of ROUTES) {
      test(`${route.path} has no serious accessibility issues and no sideways scroll`, async ({ page, context }) => {
        await prepare(context, { lang: combo.lang, theme: combo.theme, user: route.user });
        await page.setViewportSize({ width: combo.width, height: 800 });
        await page.goto(route.path);
        await settle(page);
        await expect(page.locator('html')).toHaveAttribute('lang', combo.lang);
        await expect(page.locator('html')).toHaveAttribute('data-theme', combo.theme);

        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
        const blocking = results.violations
          .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
          .map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`);
        expect(blocking).toEqual([]);

        expect(await overflowAt(page, 360), 'horizontal overflow at 360px').toBeLessThanOrEqual(0);
        expect(await overflowAt(page, 1440), 'horizontal overflow at 1440px').toBeLessThanOrEqual(0);
      });
    }
  });
}
