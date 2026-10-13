import { crc32, deflateSync } from 'node:zlib';
import { test as base, expect, type BrowserContext, type Page } from '@playwright/test';
import { MockApi, type MockUser } from './mock-api';

export { expect };
export { DOCTOR, PATIENT } from './mock-api';

export interface Preferences {
  lang?: 'en' | 'ur';
  theme?: 'light' | 'dark';
  user?: MockUser;
}

/** Every test gets its own mocked API; a call the mock doesn't know fails the test. */
export const test = base.extend<{ api: MockApi }>({
  api: [
    async ({ context }, use) => {
      const api = new MockApi();
      await api.attach(context);
      await use(api);
      expect(api.unexpected, 'API calls the mock does not implement').toEqual([]);
    },
    { auto: true },
  ],
});

/** Language, theme and (optionally) a signed-in user, set before the app starts. */
export async function prepare(context: BrowserContext, { lang = 'en', theme = 'light', user }: Preferences = {}) {
  await context.addInitScript(
    ({ lang, theme, user }) => {
      localStorage.setItem('medcare_lang', lang);
      localStorage.setItem('medcare_theme', theme);
      if (user) {
        localStorage.setItem('medcare_token', `token-${user.id}`);
        const { password: _password, pmdc: _pmdc, ...profile } = user;
        localStorage.setItem('medcare_user', JSON.stringify(profile));
      }
    },
    { lang, theme, user },
  );
}

/** Waits until the route's lazy chunks, strings and data have loaded. */
export async function settle(page: Page) {
  await page.waitForLoadState('networkidle');
  await expect(page.locator('h1').first()).toBeVisible();
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
}

function pngChunk(type: string, data: Buffer) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

/** A real 64×64 greyscale PNG, so the preview renders and the client-side checks pass. */
export function samplePng(size = 64) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bit depth; colour type 0 (greyscale) and the rest stay 0
  const rows = Buffer.alloc((size + 1) * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) rows[y * (size + 1) + 1 + x] = (x * 3 + y * 2) & 0xff;
  }
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([signature, pngChunk('IHDR', header), pngChunk('IDAT', deflateSync(rows)), pngChunk('IEND', Buffer.alloc(0))]);
}
