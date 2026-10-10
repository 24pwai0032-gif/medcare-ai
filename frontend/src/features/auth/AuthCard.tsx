import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui/feedback';
import { errorKey } from '@/services/errors';
import type { ValidationKey } from './schemas';

export function AuthCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:py-14">
      <div className="space-y-6 rounded-xl border bg-surface p-6 sm:p-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </header>
        {children}
      </div>
    </div>
  );
}

/** Translates a field's zod message key. */
export function useFieldError() {
  const { t } = useTranslation('auth');
  return (message: string | undefined) => (message ? t(`validation.${message as ValidationKey}`) : undefined);
}

export function ServerError({ error }: { error: unknown }) {
  const { t } = useTranslation('common');
  if (!error) return null;
  return (
    <Alert variant="destructive" role="alert">
      <CircleAlert aria-hidden="true" />
      <p>{t(errorKey(error))}</p>
    </Alert>
  );
}
