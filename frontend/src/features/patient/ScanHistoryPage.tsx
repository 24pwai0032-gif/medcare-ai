import { ClipboardList, SearchX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState, ErrorState } from '@/components/states';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScanList, ScanListSkeleton } from '@/features/scans/ScanList';
import { scanKind, useMyScans } from '@/features/scans/scans';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

const STATUSES = ['pending', 'approved', 'rejected'] as const;
const selectClass =
  'h-11 w-full rounded-md border border-input bg-surface px-3 text-base text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

export default function ScanHistoryPage() {
  const { t } = useTranslation(['patient', 'common']);
  useDocumentTitle(t('patient:history.title'));
  const scans = useMyScans();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? '';
  const type = params.get('type') ?? '';

  const setFilter = (key: 'status' | 'type', value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const all = scans.data ?? [];
  const kinds = [...new Set(all.map((s) => scanKind(s.scan_type)))];
  const visible = all.filter((s) => (!status || s.status === status) && (!type || scanKind(s.scan_type) === type));

  return (
    <div className="space-y-6">
      <PageHeader title={t('patient:history.title')} description={t('patient:history.description')} />

      {all.length ? (
        <form role="search" aria-label={t('patient:history.filters')} className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-1.5">
            <Label htmlFor="filter-status">{t('patient:history.filterStatus')}</Label>
            <select id="filter-status" className={selectClass} value={status} onChange={(e) => setFilter('status', e.target.value)}>
              <option value="">{t('patient:history.all')}</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`common:status.${s}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="filter-type">{t('patient:history.filterType')}</Label>
            <select id="filter-type" className={selectClass} value={type} onChange={(e) => setFilter('type', e.target.value)}>
              <option value="">{t('patient:history.allTypes')}</option>
              {kinds.map((kind) => (
                <option key={kind} value={kind}>
                  {t(`common:scanTypes.${kind}`)}
                </option>
              ))}
            </select>
          </div>
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
