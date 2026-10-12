import { zodResolver } from '@hookform/resolvers/zod';
import { BadgeCheck, Flag } from 'lucide-react';
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Field } from '@/components/Field';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { useReviewScan, type ReviewDecision } from './doctorScans';

const schema = z.object({ notes: z.string().trim().max(2000, 'notesLong') });
type Values = z.infer<typeof schema>;

/** Notes plus Approve / Flag. Flagging needs notes so the patient knows what to do next. */
export function ReviewForm({ scanId }: { scanId: number }) {
  const { t } = useTranslation('doctor');
  const headingId = useId();
  const navigate = useNavigate();
  const review = useReviewScan();
  const [decision, setDecision] = useState<ReviewDecision | null>(null);
  const { register, handleSubmit, setError, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { notes: '' },
  });

  const ask = (next: ReviewDecision) =>
    handleSubmit((values) => {
      if (next === 'reject' && !values.notes) {
        setError('notes', { message: 'notesRequired' }, { shouldFocus: true });
        return;
      }
      setDecision(next);
    })();

  const confirm = handleSubmit(async (values) => {
    if (!decision) return;
    try {
      await review.mutateAsync({ id: scanId, decision, notes: values.notes });
      toast.success(decision === 'approve' ? t('review.approved') : t('review.flagged'));
      navigate('/doctor', { replace: true });
    } catch {
      toast.error(t('review.failed'));
      setDecision(null);
    }
  });

  const errorKey = formState.errors.notes?.message as 'notesRequired' | 'notesLong' | undefined;

  return (
    <section aria-labelledby={headingId} className="space-y-4 rounded-2xl border bg-surface p-6 shadow-card">
      <div className="space-y-1">
        <h2 id={headingId} className="text-lg font-semibold">
          {t('review.heading')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('review.intro')}</p>
      </div>
      <Field id="review-notes" label={t('review.notes')} hint={t('review.notesHint')} error={errorKey ? t(`review.${errorKey}`) : undefined}>
        {(control) => <Textarea rows={5} dir="auto" {...control} {...register('notes')} />}
      </Field>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => void ask('approve')}>
          <BadgeCheck aria-hidden="true" />
          {t('review.approve')}
        </Button>
        <Button variant="outline" className="text-destructive" onClick={() => void ask('reject')}>
          <Flag aria-hidden="true" />
          {t('review.flag')}
        </Button>
      </div>
      <ConfirmDialog
        open={decision !== null}
        onOpenChange={(open) => !open && setDecision(null)}
        title={decision === 'reject' ? t('review.confirmFlagTitle') : t('review.confirmApproveTitle')}
        description={t('review.confirmDescription')}
        confirmLabel={decision === 'reject' ? t('review.flag') : t('review.approve')}
        variant={decision === 'reject' ? 'destructive' : 'default'}
        pending={review.isPending}
        onConfirm={() => void confirm()}
      />
    </section>
  );
}
