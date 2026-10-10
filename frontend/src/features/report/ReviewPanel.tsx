import { BadgeCheck, Clock, Flag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { normalizeStatus } from '@/components/StatusBadge';
import { Alert } from '@/components/ui/feedback';

/** Doctor-review status for the patient: Pending, Approved (with notes) or Flagged. */
export function ReviewPanel({ status, notes }: { status: string; notes: string | null }) {
  const { t } = useTranslation('report');
  const key = normalizeStatus(status);

  if (key === 'pending') {
    return (
      <Alert variant="warning" role="status">
        <Clock aria-hidden="true" />
        <div>
          <p className="font-semibold">{t('review.pendingTitle')}</p>
          <p>{t('review.pendingBody')}</p>
        </div>
      </Alert>
    );
  }

  const approved = key === 'approved';
  const Icon = approved ? BadgeCheck : Flag;
  return (
    <Alert
      variant={approved ? 'neutral' : 'destructive'}
      role="status"
      className={approved ? 'border-status-approved-foreground/30 bg-status-approved text-status-approved-foreground' : undefined}
    >
      <Icon aria-hidden="true" />
      <div className="min-w-0 space-y-2">
        <p className="font-semibold">{approved ? t('review.approvedTitle') : t('review.rejectedTitle')}</p>
        {approved ? null : <p>{t('review.rejectedBody')}</p>}
        <div>
          <p className="text-sm font-semibold">{t('review.notes')}</p>
          {notes ? (
            <p dir="auto" className="break-words whitespace-pre-line">
              {notes}
            </p>
          ) : (
            <p>{t('review.noNotes')}</p>
          )}
        </div>
      </div>
    </Alert>
  );
}
