import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import i18n from '@/i18n';

// jsdom lacks these browser APIs.
if (!URL.createObjectURL) URL.createObjectURL = () => 'blob:test-preview';
if (!URL.revokeObjectURL) URL.revokeObjectURL = () => undefined;
// Like current Chrome, scrollTo() returns a Promise; an effect that returns it must fail a test.
window.scrollTo = (() => Promise.resolve()) as unknown as typeof window.scrollTo;
// Radix radio groups inside a <form> measure themselves.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const FATAL_REACT_WARNINGS = [/must not return anything besides a function/, /unique "key" prop/];
const originalError = console.error;
console.error = (...args: unknown[]) => {
  const text = args.map(String).join(' ');
  if (FATAL_REACT_WARNINGS.some((pattern) => pattern.test(text))) throw new Error(`React warning: ${text.slice(0, 300)}`);
  originalError(...args);
};

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
