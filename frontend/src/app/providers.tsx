import { Direction } from 'radix-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { ThemeProvider } from '@/lib/theme';

/** Theme, session and text direction for the whole app. Kept small: the landing page loads it. */
export function AppProviders({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  return (
    <ThemeProvider>
      <AuthProvider>
        <Direction.Provider dir={i18n.dir()}>{children}</Direction.Provider>
      </AuthProvider>
    </ThemeProvider>
  );
}
