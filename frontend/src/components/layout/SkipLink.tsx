import { useTranslation } from 'react-i18next';

/**
 * First focusable element on every page. Kept in its own module so public pages don't
 * download the signed-in shell (sidebar, menus) just to render it.
 */
export function SkipLink() {
  const { t } = useTranslation();
  return (
    <a
      href="#main"
      className="sr-only z-50 rounded-md bg-primary px-4 py-3 font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:start-3 focus:top-3"
    >
      {t('skipToContent')}
    </a>
  );
}
