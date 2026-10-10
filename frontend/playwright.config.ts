import { defineConfig, devices } from '@playwright/test';

const PORT = 4174;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // `vite preview` is a single Node process; with many browsers at once it can refuse a
  // connection for a chunk. A retry absorbs that, and Playwright still reports the test as flaky.
  retries: 1,
  workers: process.env.CI ? 2 : 4,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chrome',
      // Installed Google Chrome, not Playwright's own Chromium download (blocked on some machines).
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
  webServer: {
    // A production build whose API is a made-up origin that e2e/mock-api.ts answers.
    command: `npx vite build --outDir dist-e2e --emptyOutDir && npx vite preview --outDir dist-e2e --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    env: { VITE_API_URL: 'http://api.medcare.test/api/v1' },
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
