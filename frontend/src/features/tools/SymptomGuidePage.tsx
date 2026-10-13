import { CircleAlert, Info, Siren, Stethoscope } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmergencyCallButtons } from '@/components/Disclaimer';
import { PageHeader } from '@/components/PageHeader';
import { SeverityBadge } from '@/components/SeverityBadge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { severityRank, type SeverityLevel } from '@/lib/severity';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

/** The 10 symptoms and their severity, unchanged from the original lookup table. */
const SYMPTOMS = [
  { id: 'headache', severity: 'mild' },
  { id: 'fever', severity: 'moderate' },
  { id: 'cough', severity: 'mild' },
  { id: 'chestPain', severity: 'severe' },
  { id: 'stomachPain', severity: 'moderate' },
  { id: 'backPain', severity: 'mild' },
  { id: 'dizziness', severity: 'moderate' },
  { id: 'shortnessOfBreath', severity: 'severe' },
  { id: 'fatigue', severity: 'mild' },
  { id: 'jointPain', severity: 'moderate' },
] as const satisfies ReadonlyArray<{ id: string; severity: SeverityLevel }>;

type SymptomId = (typeof SYMPTOMS)[number]['id'];

/**
 * Not AI: tick boxes replace the old keyword matching, which showed a green "Mild" badge for
 * anything it didn't recognise (e.g. "can't breathe") and matched "no fever" as fever.
 */
export default function SymptomGuidePage() {
  const { t } = useTranslation('tools');
  useDocumentTitle(t('symptoms.title'));
  const [selected, setSelected] = useState<SymptomId[]>([]);
  const [shown, setShown] = useState(false);
  const [needOne, setNeedOne] = useState(false);
  const resultsRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (shown) resultsRef.current?.focus();
  }, [shown]);

  const toggle = (id: SymptomId) => {
    setSelected((current) => (current.includes(id) ? current.filter((s) => s !== id) : [...current, id]));
    setNeedOne(false);
  };
  const results = SYMPTOMS.filter((s) => selected.includes(s.id)).sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
  const urgent = results.some((s) => s.severity === 'severe');

  return (
    <div className="space-y-6">
      <PageHeader title={t('symptoms.title')} description={t('symptoms.description')} icon={{ icon: Stethoscope, tone: 'cyan' }} />

      {shown ? (
        <section aria-labelledby="symptom-results" className="space-y-4">
          <h2 id="symptom-results" ref={resultsRef} tabIndex={-1} className="text-xl font-semibold outline-none">
            {t('symptoms.resultsHeading')}
          </h2>
          {urgent ? (
            <div role="alert" className="space-y-3 rounded-2xl border border-sev-severe-foreground/25 bg-sev-severe p-5 text-sev-severe-foreground">
              <p className="flex items-center gap-2 font-semibold">
                <Siren className="size-5" aria-hidden="true" />
                {t('symptoms.urgent')}
              </p>
              <EmergencyCallButtons />
            </div>
          ) : null}
          <ul role="list" className="space-y-4">
            {results.map((symptom) => {
              const conditions = t(`symptoms.items.${symptom.id}.conditions`, { returnObjects: true }) as string[];
              return (
                <li key={symptom.id} className="space-y-3 rounded-2xl border bg-surface p-6 shadow-card">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold">{t(`symptoms.items.${symptom.id}.label`)}</h3>
                    <SeverityBadge level={symptom.severity} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">{t('symptoms.causes')}</p>
                    <ul className="mt-1 list-disc ps-6">
                      {conditions.map((condition) => (
                        <li key={condition}>{condition}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">{t('symptoms.advice')}</p>
                    <p>{t(`symptoms.items.${symptom.id}.advice`)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <Button variant="outline" onClick={() => setShown(false)}>
            {t('symptoms.reset')}
          </Button>
        </section>
      ) : (
        <form noValidate onSubmit={(event) => event.preventDefault()} className="space-y-4">
          <fieldset className="space-y-3">
            <legend className="mb-2 text-base font-semibold">{t('symptoms.choose')}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {SYMPTOMS.map((symptom) => (
                <label
                  key={symptom.id}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border bg-surface px-4 py-2.5 shadow-soft transition-colors hover:border-primary/40 hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-secondary has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring"
                >
                  <input
                    type="checkbox"
                    className="size-5 shrink-0 accent-primary"
                    checked={selected.includes(symptom.id)}
                    onChange={() => toggle(symptom.id)}
                  />
                  <span className="font-medium">{t(`symptoms.items.${symptom.id}.label`)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {needOne ? (
            <Alert variant="destructive" role="alert">
              <CircleAlert aria-hidden="true" />
              <p>{t('symptoms.chooseFirst')}</p>
            </Alert>
          ) : null}
          <Button size="lg" onClick={() => (selected.length ? setShown(true) : setNeedOne(true))}>
            {t('symptoms.show')}
          </Button>
        </form>
      )}

      <p className="text-sm">{t('symptoms.notListed')}</p>
      <Alert variant="info" role="note">
        <Info aria-hidden="true" />
        <p>{t('symptoms.disclaimer')}</p>
      </Alert>
    </div>
  );
}
