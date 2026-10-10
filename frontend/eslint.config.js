import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Pre-rebuild pages. Each entry is deleted when a phase replaces the file.
const legacy = [
  'src/pages/**',
  'src/components/Icons.tsx',
  'src/utils/generatePDF.ts',
  'src/services/legacyApi.ts',
];

const LETTERS = /[A-Za-z؀-ۿ]/;
const TEXT_ATTRIBUTES = new Set([
  'alt',
  'title',
  'placeholder',
  'label',
  'aria-label',
  'aria-description',
  'aria-placeholder',
  'aria-roledescription',
  'aria-valuetext',
]);

/** Every user-facing string must come from the i18n files (en/ur JSON), not from JSX literals. */
const noLiteralUiString = {
  meta: {
    type: 'problem',
    messages: { literal: 'User-facing text must come from i18n (t()), not a string literal: "{{text}}".' },
    schema: [],
  },
  create(context) {
    const report = (node, text) =>
      context.report({ node, messageId: 'literal', data: { text: text.trim().slice(0, 40) } });
    const staticString = (value) => {
      if (!value) return null;
      if (value.type === 'Literal' && typeof value.value === 'string') return value.value;
      if (value.type === 'JSXExpressionContainer') {
        const expression = value.expression;
        if (expression.type === 'Literal' && typeof expression.value === 'string') return expression.value;
        if (expression.type === 'TemplateLiteral' && expression.expressions.length === 0) {
          return expression.quasis[0].value.cooked;
        }
      }
      return null;
    };
    return {
      JSXText(node) {
        if (LETTERS.test(node.value)) report(node, node.value);
      },
      JSXAttribute(node) {
        const name = typeof node.name.name === 'string' ? node.name.name : '';
        if (!TEXT_ATTRIBUTES.has(name)) return;
        const text = staticString(node.value);
        if (text && LETTERS.test(text)) report(node, text);
      },
    };
  },
};

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
  {
    files: ['src/**/*.tsx'],
    ignores: ['src/**/*.test.tsx', 'src/test/**', 'src/features/design/**'],
    plugins: { medcare: { rules: { 'no-literal-ui-string': noLiteralUiString } } },
    rules: { 'medcare/no-literal-ui-string': 'error' },
  },
]);
