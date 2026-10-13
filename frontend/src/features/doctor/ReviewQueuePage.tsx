import { Inbox } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { FilterSelect, setParam } from '@/components/FilterSelect';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState, ErrorState } from '@/components/states';
import { ScanList, ScanListSkeleton } from '@/features/scans/ScanList';
import { displaySeverity, newestFirst, oldestFirst } from '@/features/scans/scans';
import { severityRank } from '@/lib/severity';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import type { Scan } from '@/services/types';
import { usePendingScans } from './doctorScans';

const SORTS = {
  oldest: oldestFirst,
  newest: newestFirst,
  severity: (a: Scan, b: Scan) => severityRank(displaySeverity(b)) - severityRank(displaySeverity(a)) || oldestFirst(a, b),
};
type SortKey = keyof typeof SORTS;

/** Pending reports only; oldest first by default so nobody waits longest. */
export default function ReviewQueuePage() {
  const { t } = useTranslation('doctor');
  useDocumentTitle(t('queue.title'));
  const pending = usePendingScans();
  const [params, setParams] = useSearchParams();
  const sort = (params.get('sort') as SortKey) in SORTS ? (params.get('sort') as SortKey) : 'oldest';
  const scans = [...(pending.data ?? [])].sort(SORTS[sort]);

  return (
    <div className="space-y-6">
      <PageHeader title={t('queue.title')} description={t('queue.description')} />
      {pending.isPending ? <ScanListSkeleton rows={4} /> : null}
      {pending.isError ? (
        <ErrorState title={t('queue.loadError')} error={pending.error} onRetry={() => void pending.refetch()} />
      ) : null}
      {pending.isSuccess && !scans.length ? (
        <EmptyState icon={Inbox} title={t('queue.empty')} description={t('queue.emptyBody')} />
      ) : null}
      {scans.length ? (
        <>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {t('queue.count', { count: scans.length })}
            </p>
            <div className="w-full sm:w-64">
              <FilterSelect
                id="queue-sort"
                label={t('queue.sort')}
                value={sort}
                onChange={(value) => setParams(setParam(params, 'sort', value === 'oldest' ? '' : value), { replace: true })}
                options={(['oldest', 'newest', 'severity'] as const).map((key) => ({ value: key, label: t(`queue.${key}`) }))}
              />
            </div>
          </div>
          <ScanList scans={scans} showPatient hrefFor={(scan) => `/doctor/scans/${scan.id}`} />
        </>
      ) : null}
    </div>
  );
}
