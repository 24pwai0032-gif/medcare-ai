import { CircleAlert } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LogoMark } from '@/components/Logo';
import { Alert } from '@/components/ui/feedback';
import { warmUpBackend } from '@/services/api';
import { errorKey } from '@/services/errors';
import type { ValidationKey } from './schemas';

export function AuthCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  // Start waking a sleeping backend while the person types.
  useEffect(() => {
    warmUpBackend();
  }, []);
  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:py-14">
      <div className="space-y-6 rounded-3xl border bg-surface p-6 shadow-raised sm:p-8">
        <header className="space-y-2">
          <LogoMark className="size-11" />
          <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
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

/** Shown while a sign-in or registration is still running after a few seconds. */
export function SlowServerNote() {
  const { t } = useTranslation('auth');
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 6000);
    return () => clearTimeout(timer);
  }, []);
  return slow ? (
    <p role="status" className="text-sm text-muted-foreground">
      {t('slowServer')}
    </p>
  ) : null;
}
