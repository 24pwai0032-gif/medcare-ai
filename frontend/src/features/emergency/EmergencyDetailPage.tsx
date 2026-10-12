import { FileQuestion, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { EmergencyCallButtons } from '@/components/Disclaimer';
import { BackLink } from '@/components/PageHeader';
import { EmptyState } from '@/components/states';
import { Alert } from '@/components/ui/feedback';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { emergencyBySlug } from './emergencies';

export default function EmergencyDetailPage() {
  const { t } = useTranslation('emergency');
  const emergency = emergencyBySlug(useParams().slug);
  useDocumentTitle(emergency ? t(`items.${emergency.id}.title`) : t('title'));
  const back = <BackLink to="/emergency" label={t('allEmergencies')} />;

  if (!emergency) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 sm:px-6">
        {back}
        <EmptyState icon={FileQuestion} title={t('notFound')} />
      </div>
    );
  }

  const symptoms = t(`items.${emergency.id}.symptoms`, { returnObjects: true }) as string[];
  const steps = t(`items.${emergency.id}.steps`, { returnObjects: true }) as string[];

  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      {back}
      <h1 className="flex items-center gap-3 text-2xl font-semibold sm:text-3xl">
        <emergency.icon className="size-8 shrink-0 text-destructive" aria-hidden="true" />
        {t(`items.${emergency.id}.title`)}
      </h1>
      <section className="space-y-3 rounded-2xl border border-sev-severe-foreground/25 bg-sev-severe p-5 text-sev-severe-foreground">
        <p className="font-semibold">{t('callFirst')}</p>
        <EmergencyCallButtons />
      </section>
      <section aria-labelledby="signs-heading" className="space-y-2">
        <h2 id="signs-heading" className="text-lg font-semibold">
          {t('symptomsHeading')}
        </h2>
        <ul className="list-disc space-y-1 ps-6">
          {symptoms.map((symptom) => (
            <li key={symptom}>{symptom}</li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="steps-heading" className="space-y-3">
        <h2 id="steps-heading" className="text-lg font-semibold">
          {t('stepsHeading')}
        </h2>
        <ol role="list" className="space-y-3">
          {steps.map((step, index) => (
            <li key={step} className="flex items-start gap-3 rounded-2xl border bg-surface p-5 shadow-card">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-destructive font-bold text-destructive-foreground tabular-nums" aria-hidden="true">
                {index + 1}
              </span>
              <span className="pt-1 text-lg leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </section>
      <Alert variant="info" role="note">
        <Info aria-hidden="true" />
        <p>{t('disclaimer')}</p>
      </Alert>
    </article>
  );
}
