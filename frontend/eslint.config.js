import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Pre-rebuild pages. Each entry is deleted when a phase replaces the file.
const legacy = [
  'src/pages/**',
  'src/components/Icons.tsx',
  'src/components/ErrorBoundary.tsx',
  'src/utils/generatePDF.ts',
  'src/services/api.ts',
];

export default defineConfig([
  globalIgnores(['dist', 'build', 'coverage', 'playwright-report', 'test-results', ...legacy]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended, reactHooks.configs.flat.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
  },
]);
