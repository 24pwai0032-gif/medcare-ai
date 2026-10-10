import { FileQuestion, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router';
import { BackLink } from '@/components/PageHeader';
import { EmptyState, ErrorState, PageLoader } from '@/components/states';
import { Alert } from '@/components/ui/feedback';
import { ReportView } from '@/features/report/ReportView';
import { reportFromScan, scanKind } from '@/features/report/reportData';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { useAllScans } from './doctorScans';
import { ReviewForm } from './ReviewForm';

export default function ReviewPage() {
  const { t } = useTranslation(['doctor', 'common']);
  const { id } = useParams();
  const [params] = useSearchParams();
  const scans = useAllScans();
  const scan = scans.data?.find((s) => String(s.id) === id);
  useDocumentTitle(scan ? t(`common:reportTitles.${scanKind(scan.scan_type)}`) : t('doctor:queue.title'));
  const back =
    params.get('from') === 'all'
      ? { to: '/doctor/scans', label: t('doctor:review.backAll') }
      : { to: '/doctor', label: t('doctor:review.back') };

  if (scans.isPending) return <PageLoader />;
  if (scans.isError) {
    return (
      <div className="space-y-4">
        <BackLink {...back} />
        <ErrorState error={scans.error} onRetry={() => void scans.refetch()} />
      </div>
    );
  }
  if (!scan) {
    return (
      <div className="space-y-4">
        <BackLink {...back} />
        <EmptyState icon={FileQuestion} title={t('doctor:review.notFound')} description={t('doctor:review.notFoundBody')} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BackLink {...back} />
      <ReportView data={reportFromScan(scan)} audience="doctor">
        {scan.status === 'pending' ? (
          <ReviewForm scanId={scan.id} />
        ) : (
          <Alert variant="neutral" role="status">
            <Info aria-hidden="true" />
            <p>{t('doctor:review.alreadyReviewed')}</p>
          </Alert>
        )}
      </ReportView>
    </div>
  );
}
