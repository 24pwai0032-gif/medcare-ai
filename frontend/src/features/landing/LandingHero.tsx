import { Check, Clock, FileDown, Info, ScanLine, Siren, UserPlus } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { IconChip } from '@/components/IconChip';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const container = 'mx-auto w-full max-w-6xl px-4 sm:px-6';

export function SignUpButtons() {
  const { t } = useTranslation();
  return (
    <div className="grid gap-3 sm:flex sm:flex-wrap">
      <Button asChild size="xl">
        <Link to="/register">
          <UserPlus aria-hidden="true" />
          {t('actions.getStarted')}
        </Link>
      </Button>
      <Button asChild size="xl" variant="outline">
        <Link to="/login">{t('actions.signIn')}</Link>
      </Button>
    </div>
  );
}

/**
 * An illustration of the report screen, built from the real badges. It is marked "Example" and
 * read out as one image, so nobody mistakes it for a real result.
 */
function ReportPreview() {
  const { t } = useTranslation(['landing', 'common']);
  const lines = t('landing:preview.lines', { returnObjects: true }) as string[];
  // Drawn here rather than with SeverityBadge/StatusBadge, which would add every level's icon to the landing page.
  const badge = 'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold';
  return (
    <figure role="img" aria-label={t('landing:preview.alt')} className="relative mx-auto w-full max-w-md pb-10">
      <svg aria-hidden="true" viewBox="0 0 420 120" className="absolute inset-x-0 top-28 -z-0 w-full opacity-60">
        <defs>
          <linearGradient id="landing-ecg" x1="0" y1="0" x2="420" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4338ca" stopOpacity="0" />
            <stop offset="25%" stopColor="#4f46e5" />
            <stop offset="75%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 60 H140 L165 20 L190 100 L215 10 L240 95 L262 60 H420"
          fill="none"
          stroke="url(#landing-ecg)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="relative space-y-4 rounded-3xl border bg-surface p-6 shadow-raised">
        <div className="flex items-center gap-3">
          <IconChip icon={ScanLine} tone="indigo" />
          <strong className="text-lg">{t('landing:preview.title')}</strong>
          <span className="ms-auto rounded-full border border-dashed px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            {t('landing:preview.label')}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={cn(badge, 'border-sev-mild-foreground/30 bg-sev-mild text-sev-mild-foreground')}>
            <Info className="size-4 shrink-0" aria-hidden="true" />
            {t('common:severity.mild')}
          </span>
          <span className={cn(badge, 'border-status-pending-foreground/30 bg-status-pending text-status-pending-foreground')}>
            <Clock className="size-4 shrink-0" aria-hidden="true" />
            {t('common:status.pending')}
          </span>
        </div>
        <div className="inline-flex gap-1 rounded-xl bg-muted p-1 text-sm">
          <span className="rounded-lg bg-surface px-3 py-1.5 font-bold shadow-card">{t('landing:preview.tabEnglish')}</span>
          <span className="px-3 py-1.5 font-semibold text-muted-foreground">{t('landing:preview.tabUrdu')}</span>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-bold tracking-wider text-primary uppercase">{t('landing:preview.findings')}</p>
          {lines.map((line) => (
            <p key={line} className="text-[0.95rem]">
              {line}
            </p>
          ))}
        </div>
        <span className="inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold">
          <FileDown className="size-4" aria-hidden="true" />
          {t('landing:preview.pdf')}
        </span>
      </div>
      <div className="absolute start-0 bottom-0 flex max-w-72 items-center gap-3 rounded-2xl border bg-surface px-4 py-3 shadow-raised">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sev-normal text-sev-normal-foreground">
          <Check className="size-5" aria-hidden="true" />
        </span>
        <span className="text-sm leading-snug">
          <strong className="block">{t('landing:preview.reviewTitle')}</strong>
          <span className="text-muted-foreground">{t('landing:preview.reviewBody')}</span>
        </span>
      </div>
    </figure>
  );
}

export function Hero() {
  const { t } = useTranslation(['landing', 'common']);
  return (
    <section aria-labelledby="landing-title" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -start-40 -top-44 size-[36rem] rounded-full bg-[radial-gradient(circle,var(--glow-a),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -end-32 top-10 size-[32rem] rounded-full bg-[radial-gradient(circle,var(--glow-b),transparent_70%)]"
      />
      <div className={cn(container, 'relative grid gap-12 py-12 md:py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center')}>
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border bg-surface px-3.5 py-1.5 text-sm font-semibold text-secondary-foreground shadow-card">
            <span lang="en">{t('common:language.en')}</span>
            <span aria-hidden="true" className="size-1 rounded-full bg-tone-cyan-foreground" />
            <span lang="ur" className="font-system">
              {t('common:language.ur')}
            </span>
          </span>
          <h1 id="landing-title" className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">
            <Trans t={t} i18nKey="landing:hero.title" components={{ hl: <span className="text-brand" /> }} />
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">{t('landing:hero.body')}</p>
          <SignUpButtons />
          <div className="flex max-w-xl items-center gap-3 rounded-2xl border border-sev-severe-foreground/15 bg-sev-severe/60 p-3 text-sm text-sev-severe-foreground">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface shadow-soft">
              <Siren className="size-5" aria-hidden="true" />
            </span>
            <p>
              {t('landing:hero.emergency')}{' '}
              <Link to="/emergency" className="font-bold underline underline-offset-2 hover:no-underline">
                {t('landing:hero.emergencyLink')}
              </Link>
            </p>
          </div>
        </div>
        <ReportPreview />
      </div>
    </section>
  );
}
