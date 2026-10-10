import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import i18n from '@/i18n';

beforeEach(() => {
  // Tests must never reach the real backend; individual tests stub fetch when they need it.
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.reject(new TypeError('Network access is disabled in tests'))),
  );
});

afterEach(async () => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  if (i18n.language !== 'en') await i18n.changeLanguage('en');
  document.documentElement.removeAttribute('data-theme');
});
