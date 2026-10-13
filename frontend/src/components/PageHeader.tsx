import { ArrowLeft, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { IconChip, type Tone } from '@/components/IconChip';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { to: string; label: string };
  /** The module's colour chip, shown before the title. */
  icon?: { icon: LucideIcon; tone: Tone };
  className?: string;
}

export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="inline-flex min-h-11 w-fit items-center gap-2 rounded-md text-sm font-semibold text-primary hover:underline">
      <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
      {label}
    </Link>
  );
}

export function PageHeader({ title, description, actions, back, icon, className }: PageHeaderProps) {
  return (
    <header className={cn('mb-6 flex flex-col gap-3', className)}>
      {back ? <BackLink to={back.to} label={back.label} /> : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-4">
          {icon ? <IconChip icon={icon.icon} tone={icon.tone} size="lg" className="mt-0.5" /> : null}
          <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">{title}</h1>
          {description ? <div className="max-w-prose text-muted-foreground">{description}</div> : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
