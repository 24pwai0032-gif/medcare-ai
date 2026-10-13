import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Toaster as SonnerToaster } from 'sonner';
import { useTheme } from '@/lib/theme';
import { isRetryable } from '@/services/errors';

function Toaster() {
  const { t, i18n } = useTranslation();
  const { resolved } = useTheme();
  return (
    <SonnerToaster
      theme={resolved}
      dir={i18n.dir()}
      position="top-center"
      duration={6000}
      closeButton
      containerAriaLabel={t('toasts.region')}
      toastOptions={{
        closeButtonAriaLabel: t('toasts.close'),
        classNames: {
          toast: '!bg-surface !text-surface-foreground !border-border',
          description: '!text-muted-foreground',
        },
      }}
    />
  );
}

/**
 * Server state and toasts, mounted only inside the signed-in areas (lazy chunks, not the landing
 * page). The cache lives in memory, is never persisted, and is dropped when the area unmounts.
 */
export function AppDataProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (count, error) => count < 2 && isRetryable(error),
          },
          mutations: { retry: false },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
