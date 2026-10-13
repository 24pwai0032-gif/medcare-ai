import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/** Sets "<page> · MedCare AI" as the tab title; screen readers announce it on navigation. */
export function useDocumentTitle(title: string | null | undefined) {
  const { t } = useTranslation();
  const brand = t('brand');
  useEffect(() => {
    document.title = title ? `${title} · ${brand}` : brand;
  }, [title, brand]);
}
