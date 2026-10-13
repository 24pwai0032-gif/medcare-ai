import { ClipboardList, SearchX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { FilterSelect, setParam } from '@/components/FilterSelect';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState, ErrorState } from '@/components/states';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScanList, ScanListSkeleton } from '@/features/scans/ScanList';
import { scanKind } from '@/features/scans/scans';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { useAllScans } from './doctorScans';

const STATUSES = ['pending', 'approved', 'rejected'] as const;

export default function AllScansPage() {
  const { t } = useTranslation(['doctor', 'common']);
  useDocumentTitle(t('doctor:all.title'));
  const scans = useAllScans();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? '';
  const type = params.get('type') ?? '';
  const query = params.get('q') ?? '';
  const update = (key: string, value: string) => setParams(setParam(params, key, value), { replace: true });

  const all = scans.data ?? [];
  const kinds = [...new Set(all.map((s) => scanKind(s.scan_type)))];
  const needle = query.trim().toLowerCase();
  const visible = all.filter(
    (s) =>
      (!status || s.status === status) &&
      (!type || scanKind(s.scan_type) === type) &&
      (!needle || `${s.patient_name ?? ''} ${s.patient_email ?? ''}`.toLowerCase().includes(needle)),
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t('doctor:all.title')} description={t('doctor:all.description')} />

      {all.length ? (
        <form role="search" aria-label={t('doctor:all.filters')} className="grid gap-4 sm:grid-cols-3" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-1.5">
            <Label htmlFor="filter-q">{t('doctor:all.search')}</Label>
            <Input id="filter-q" type="search" value={query} onChange={(e) => update('q', e.target.value)} />
          </div>
          <FilterSelect
            id="filter-status"
            label={t('doctor:all.status')}
            value={status}
            onChange={(value) => update('status', value)}
            options={[{ value: '', label: t('doctor:all.all') }, ...STATUSES.map((s) => ({ value: s, label: t(`common:status.${s}`) }))]}
          />
          <FilterSelect
            id="filter-type"
            label={t('doctor:all.type')}
            value={type}
            onChange={(value) => update('type', value)}
            options={[{ value: '', label: t('doctor:all.allTypes') }, ...kinds.map((k) => ({ value: k, label: t(`common:scanTypes.${k}`) }))]}
          />
        </form>
      ) : null}

      {scans.isPending ? <ScanListSkeleton rows={5} /> : null}
      {scans.isError ? <ErrorState title={t('doctor:all.loadError')} error={scans.error} onRetry={() => void scans.refetch()} /> : null}
      {scans.isSuccess && !all.length ? <EmptyState icon={ClipboardList} title={t('doctor:all.empty')} /> : null}
      {all.length ? (
        <>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {t('doctor:all.count', { count: visible.length })}
          </p>
          {visible.length ? (
            <ScanList scans={visible} showPatient hrefFor={(scan) => `/doctor/scans/${scan.id}?from=all`} />
          ) : (
            <EmptyState
              icon={SearchX}
              title={t('doctor:all.noMatches')}
              action={
                <Button variant="outline" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
                  {t('doctor:all.clear')}
                </Button>
              }
            />
          )}
        </>
      ) : null}
    </div>
  );
}
