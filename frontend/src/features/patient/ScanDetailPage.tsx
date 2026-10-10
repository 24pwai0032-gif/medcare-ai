import { FileQuestion } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { BackLink, PageHeader } from '@/components/PageHeader';
import { EmptyState, ErrorState, PageLoader } from '@/components/states';
import { Button } from '@/components/ui/button';
import { ReportView } from '@/features/report/ReportView';
import { reportFromScan, scanKind } from '@/features/report/reportData';
import { useMyScans } from '@/features/scans/scans';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

export default function ScanDetailPage() {
  const { t } = useTranslation(['patient', 'common']);
  const { id } = useParams();
  const scans = useMyScans();
  const scan = scans.data?.find((s) => String(s.id) === id);
  useDocumentTitle(scan ? t(`common:reportTitles.${scanKind(scan.scan_type)}`) : t('patient:history.title'));
  const back = { to: '/app/scans', label: t('patient:detail.back') };

  if (scans.isPending) return <PageLoader />;
  if (scans.isError) {
    return (
      <>
        <PageHeader title={t('patient:history.title')} back={back} />
        <ErrorState error={scans.error} onRetry={() => void scans.refetch()} />
      </>
    );
  }
  if (!scan) {
    return (
      <>
        <PageHeader title={t('patient:detail.notFound')} back={back} />
        <EmptyState
          icon={FileQuestion}
          title={t('patient:detail.notFound')}
          description={t('patient:detail.notFoundBody')}
          action={
            <Button asChild>
              <Link to="/app/scans">{t('patient:detail.back')}</Link>
            </Button>
          }
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <BackLink to={back.to} label={back.label} />
      <ReportView data={reportFromScan(scan)} audience="patient" />
    </div>
  );
}
