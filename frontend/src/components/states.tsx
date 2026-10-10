import { TriangleAlert, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/feedback';
import { cn } from '@/lib/utils';
import { errorKey } from '@/services/errors';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center gap-3 rounded-lg border border-dashed bg-surface px-6 py-10 text-center', className)}>
      <Icon className="size-10 text-muted-foreground" aria-hidden="true" />
      <h2 className="text-lg font-semibold">{title}</h2>
      {description ? <p className="max-w-prose text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

/** Shows a translated error message, announced to screen readers, with an optional retry. */
export function ErrorState({
  error,
  title,
  onRetry,
  className,
}: {
  error: unknown;
  title?: string;
  onRetry?: () => void;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      className={cn('flex flex-col items-center gap-3 rounded-lg border border-sev-severe-foreground/30 bg-surface px-6 py-10 text-center', className)}
    >
      <TriangleAlert className="size-10 text-destructive" aria-hidden="true" />
      <h2 className="text-lg font-semibold">{title ?? t('errors.title')}</h2>
      <p className="max-w-prose text-sm text-muted-foreground">{t(errorKey(error))}</p>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry} className="mt-2">
          {t('actions.retry')}
        </Button>
      ) : null}
    </div>
  );
}

export function PageLoader({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <div role="status" className={cn('flex min-h-48 items-center justify-center gap-3 text-muted-foreground', className)}>
      <Spinner />
      <span>{t('loading')}</span>
    </div>
  );
}
