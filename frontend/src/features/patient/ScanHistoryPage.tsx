import { ClipboardList, SearchX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router';
import { FilterSelect, setParam } from '@/components/FilterSelect';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState, ErrorState } from '@/components/states';
import { Button } from '@/components/ui/button';
import { ScanList, ScanListSkeleton } from '@/features/scans/ScanList';
import { scanKind, useMyScans } from '@/features/scans/scans';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

const STATUSES = ['pending', 'approved', 'rejected'] as const;

export default function ScanHistoryPage() {
  const { t } = useTranslation(['patient', 'common']);
  useDocumentTitle(t('patient:history.title'));
  const scans = useMyScans();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? '';
  const type = params.get('type') ?? '';

  const setFilter = (key: 'status' | 'type', value: string) => setParams(setParam(params, key, value), { replace: true });

  const all = scans.data ?? [];
  const kinds = [...new Set(all.map((s) => scanKind(s.scan_type)))];
  const visible = all.filter((s) => (!status || s.status === status) && (!type || scanKind(s.scan_type) === type));

  return (
    <div className="space-y-6">
      <PageHeader title={t('patient:history.title')} description={t('patient:history.description')} />

      {all.length ? (
        <form role="search" aria-label={t('patient:history.filters')} className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
          <FilterSelect
            id="filter-status"
            label={t('patient:history.filterStatus')}
            value={status}
            onChange={(value) => setFilter('status', value)}
            options={[{ value: '', label: t('patient:history.all') }, ...STATUSES.map((s) => ({ value: s, label: t(`common:status.${s}`) }))]}
          />
          <FilterSelect
            id="filter-type"
            label={t('patient:history.filterType')}
            value={type}
            onChange={(value) => setFilter('type', value)}
            options={[{ value: '', label: t('patient:history.allTypes') }, ...kinds.map((k) => ({ value: k, label: t(`common:scanTypes.${k}`) }))]}
          />
        </form>
      ) : null}

      {scans.isPending ? <ScanListSkeleton rows={4} /> : null}
      {scans.isError ? (
        <ErrorState title={t('patient:history.loadError')} error={scans.error} onRetry={() => void scans.refetch()} />
      ) : null}
      {scans.isSuccess && !all.length ? (
        <EmptyState
          icon={ClipboardList}
          title={t('patient:history.empty')}
          description={t('patient:history.emptyBody')}
          action={
            <Button asChild>
              <Link to="/app">{t('patient:history.start')}</Link>
            </Button>
          }
        />
      ) : null}
      {all.length ? (
        <>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {t('patient:history.count', { count: visible.length })}
          </p>
          {visible.length ? (
            <ScanList scans={visible} hrefFor={(scan) => `/app/scans/${scan.id}`} />
          ) : (
            <EmptyState
              icon={SearchX}
              title={t('patient:history.noMatches')}
              action={
                <Button variant="outline" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
                  {t('patient:history.clearFilters')}
                </Button>
              }
            />
          )}
        </>
      ) : null}
    </div>
  );
}
