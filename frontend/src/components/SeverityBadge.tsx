import { CircleCheck, Info, OctagonAlert, Siren, TriangleAlert, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SeverityLevel } from '@/lib/severity';
import { cn } from '@/lib/utils';

const STYLES: Record<SeverityLevel, { icon: LucideIcon; className: string }> = {
  normal: { icon: CircleCheck, className: 'bg-sev-normal text-sev-normal-foreground border-sev-normal-foreground/30' },
  mild: { icon: Info, className: 'bg-sev-mild text-sev-mild-foreground border-sev-mild-foreground/30' },
  moderate: {
    icon: TriangleAlert,
    className: 'bg-sev-moderate text-sev-moderate-foreground border-sev-moderate-foreground/30',
  },
  severe: { icon: OctagonAlert, className: 'bg-sev-severe text-sev-severe-foreground border-sev-severe-foreground/30' },
  critical: { icon: Siren, className: 'bg-sev-critical text-sev-critical-foreground border-transparent' },
};

interface SeverityBadgeProps {
  level: SeverityLevel | null;
  /** Overrides the default label, e.g. a PHQ-9 band or a vital-sign status. */
  label?: string;
  /** Overrides the screen-reader prefix ("Severity"). */
  srPrefix?: string;
  className?: string;
}

/** Colour, a distinct icon per level and a text label, so severity never relies on colour alone. */
export function SeverityBadge({ level, label, srPrefix, className }: SeverityBadgeProps) {
  const { t } = useTranslation();
  const prefix = srPrefix ?? t('severity.label');

  if (!level) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-sm font-medium text-muted-foreground', className)}>
        <span className="sr-only">{prefix}: </span>
        {label ?? t('severity.unknown')}
      </span>
    );
  }

  const { icon: Icon, className: tone } = STYLES[level];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold', tone, className)}>
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="sr-only">{prefix}: </span>
      {label ?? t(`severity.${level}`)}
    </span>
  );
}
