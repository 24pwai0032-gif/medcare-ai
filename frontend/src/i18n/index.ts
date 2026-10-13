import i18n, { type BackendModule } from 'i18next';
import { initReactI18next } from 'react-i18next';

export const LANGUAGES = ['en', 'ur'] as const;
export type Language = (typeof LANGUAGES)[number];

const STORAGE_KEY = 'medcare_lang';

// One chunk per language and namespace, so a page only downloads the strings it uses.
const loaders = import.meta.glob<Record<string, unknown>>('./locales/*/*.json', { import: 'default' });

const lazyBackend: BackendModule = {
  type: 'backend',
  init() {},
  read(language, namespace, callback) {
    const load = loaders[`./locales/${language}/${namespace}.json`];
    if (!load) {
      callback(new Error(`Missing locale file ${language}/${namespace}`), false);
      return;
    }
    load().then(
      (data) => callback(null, data),
      (error: unknown) => callback(error instanceof Error ? error : new Error(String(error)), false),
    );
  },
};

export function detectLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'ur') return saved;
  } catch {
    // storage unavailable
  }
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('ur') ? 'ur' : 'en';
}

export const dirFor = (language: string) => (language === 'ur' ? 'rtl' : 'ltr');

function applyToDocument(language: string) {
  document.documentElement.lang = language;
  document.documentElement.dir = dirFor(language);
}

i18n
  .use(lazyBackend)
  .use(initReactI18next)
  .init({
    lng: detectLanguage(),
    supportedLngs: [...LANGUAGES],
    // Every key exists in both languages (enforced by a test), so no fallback download is needed.
    fallbackLng: false,
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    react: { useSuspense: true },
  });

i18n.on('languageChanged', (language) => {
  applyToDocument(language);
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // ignore
  }
});

applyToDocument(i18n.language);

export default i18n;
