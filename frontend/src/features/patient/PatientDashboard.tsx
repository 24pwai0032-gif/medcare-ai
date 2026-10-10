import { Activity, BadgeCheck, Brain, ClipboardList, Clock, Flag, Siren, Stethoscope, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { EmergencyCallButtons } from '@/components/Disclaimer';
import { PageHeader } from '@/components/PageHeader';
import { ErrorState } from '@/components/states';
import { ANALYZER_MODULES, MODULE_IDS } from '@/features/analyzer/modules';
import { useAuth } from '@/features/auth/authContext';
import { ScanList, ScanListSkeleton } from '@/features/scans/ScanList';
import { useMyScans } from '@/features/scans/scans';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

const TOOLS: Array<{ to: string; key: 'diagnosis' | 'mentalHealth' | 'vitals'; icon: LucideIcon }> = [
  { to: '/app/diagnosis', key: 'diagnosis', icon: Stethoscope },
  { to: '/app/mental-health', key: 'mentalHealth', icon: Brain },
  { to: '/app/vitals', key: 'vitals', icon: Activity },
];

const tileClass =
  'flex h-full items-start gap-3 rounded-lg border bg-surface p-4 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

export default function PatientDashboard() {
  const { t } = useTranslation(['patient', 'common']);
  const { user } = useAuth();
  const scans = useMyScans();
  const firstName = user?.full_name.split(' ')[0] ?? '';
  useDocumentTitle(t('common:nav.home'));

  const all = scans.data ?? [];
  const stats: Array<{ key: 'total' | 'pending' | 'approved' | 'rejected'; value: number; icon: LucideIcon }> = [
    { key: 'total', value: all.length, icon: ClipboardList },
    { key: 'pending', value: all.filter((s) => s.status === 'pending').length, icon: Clock },
    { key: 'approved', value: all.filter((s) => s.status === 'approved').length, icon: BadgeCheck },
    { key: 'rejected', value: all.filter((s) => s.status === 'rejected').length, icon: Flag },
  ];

  return (
    <div className="space-y-10">
      <PageHeader title={t('patient:dashboard.greeting', { name: firstName })} description={t('patient:dashboard.subtitle')} />

      {scans.isSuccess ? (
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">
            {t('patient:dashboard.statsLabel')}
          </h2>
          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.key} className="rounded-lg border bg-surface p-4">
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <stat.icon className="size-4" aria-hidden="true" />
                  {t(`patient:dashboard.stats.${stat.key}`)}
                </dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <section aria-labelledby="analyze-heading" className="space-y-3">
        <h2 id="analyze-heading" className="text-lg font-semibold">
          {t('patient:dashboard.analyzeHeading')}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODULE_IDS.map((id) => {
            const Icon = ANALYZER_MODULES[id].icon;
            return (
              <li key={id}>
                <Link to={`/app/analyze/${id}`} className={tileClass}>
                  <Icon className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <span className="block font-semibold">{t(`common:modules.${id}`)}</span>
                    <span className="block text-sm text-muted-foreground">{t(`patient:modules.${id}`)}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="tools-heading" className="space-y-3">
        <h2 id="tools-heading" className="text-lg font-semibold">
          {t('patient:dashboard.toolsHeading')}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {TOOLS.map((tool) => (
            <li key={tool.key}>
              <Link to={tool.to} className={tileClass}>
                <tool.icon className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  <span className="block font-semibold">{t(`common:modules.${tool.key}`)}</span>
                  <span className="block text-sm text-muted-foreground">{t(`patient:modules.${tool.key}`)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="emergency-heading" className="space-y-3 rounded-lg border border-sev-severe-foreground/30 bg-sev-severe p-4 text-sev-severe-foreground">
        <h2 id="emergency-heading" className="flex items-center gap-2 text-lg font-semibold">
          <Siren className="size-5" aria-hidden="true" />
          {t('patient:dashboard.emergencyHeading')}
        </h2>
        <p>{t('patient:dashboard.emergencyBody')}</p>
        <EmergencyCallButtons />
        <Link to="/app/emergency" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-2">
          {t('patient:dashboard.firstAidGuide')}
        </Link>
      </section>

      <section aria-labelledby="recent-heading" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="recent-heading" className="text-lg font-semibold">
            {t('patient:dashboard.recentHeading')}
          </h2>
          {all.length ? (
            <Link to="/app/scans" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline">
              {t('patient:dashboard.viewAll')}
            </Link>
          ) : null}
        </div>
        {scans.isPending ? <ScanListSkeleton /> : null}
        {scans.isError ? <ErrorState error={scans.error} onRetry={() => void scans.refetch()} /> : null}
        {scans.isSuccess && !all.length ? (
          <p className="rounded-lg border border-dashed bg-surface p-4 text-muted-foreground">{t('patient:history.emptyBody')}</p>
        ) : null}
        {all.length ? <ScanList scans={all.slice(0, 5)} hrefFor={(scan) => `/app/scans/${scan.id}`} /> : null}
      </section>
    </div>
  );
}
