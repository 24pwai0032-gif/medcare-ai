import { BadgeCheck, Clock, Flag, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { ScanStatus } from '@/services/types';

const STYLES: Record<ScanStatus, { icon: LucideIcon; className: string }> = {
  pending: { icon: Clock, className: 'bg-status-pending text-status-pending-foreground border-status-pending-foreground/30' },
  approved: {
    icon: BadgeCheck,
    className: 'bg-status-approved text-status-approved-foreground border-status-approved-foreground/30',
  },
  rejected: { icon: Flag, className: 'bg-status-flagged text-status-flagged-foreground border-status-flagged-foreground/30' },
};

export function normalizeStatus(value: string | null | undefined): ScanStatus {
  return value === 'approved' || value === 'rejected' ? value : 'pending';
}

/** Doctor-review status: Pending, Approved, or Flagged (the API calls it "rejected"). */
export function StatusBadge({ status, className }: { status: string | null | undefined; className?: string }) {
  const { t } = useTranslation();
  const key = normalizeStatus(status);
  const { icon: Icon, className: tone } = STYLES[key];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-semibold', tone, className)}>
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="sr-only">{t('status.label')}: </span>
      {t(`status.${key}`)}
    </span>
  );
}
