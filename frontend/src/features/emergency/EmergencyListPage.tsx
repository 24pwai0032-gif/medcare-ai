import { Siren } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { EmergencyCallButtons } from '@/components/Disclaimer';
import { PageHeader } from '@/components/PageHeader';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { EMERGENCIES } from './emergencies';

/** Public: never behind sign-in. */
export default function EmergencyListPage() {
  const { t } = useTranslation('emergency');
  useDocumentTitle(t('title'));
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
      <PageHeader title={t('title')} description={t('description')} className="mb-0" />
      <section className="space-y-3 rounded-lg border border-sev-severe-foreground/40 bg-sev-severe p-4 text-sev-severe-foreground">
        <p className="flex items-center gap-2 text-lg font-semibold">
          <Siren className="size-5" aria-hidden="true" />
          {t('callFirst')}
        </p>
        <EmergencyCallButtons />
      </section>
      <section aria-labelledby="choose-heading" className="space-y-3">
        <h2 id="choose-heading" className="text-lg font-semibold">
          {t('chooseHeading')}
        </h2>
        <ul role="list" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {EMERGENCIES.map((emergency) => (
            <li key={emergency.id}>
              <Link
                to={`/emergency/${emergency.slug}`}
                className="flex h-full min-h-24 flex-col items-center justify-center gap-2 rounded-lg border bg-surface p-4 text-center font-semibold hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <emergency.icon className="size-8 text-destructive" aria-hidden="true" />
                {t(`items.${emergency.id}.title`)}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
