import { CircleAlert, Info, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmergencyCallButtons } from '@/components/Disclaimer';
import { Field } from '@/components/Field';
import { PageHeader } from '@/components/PageHeader';
import { SeverityBadge } from '@/components/SeverityBadge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { Input } from '@/components/ui/input';
import { isolateLtr, useFormatters } from '@/lib/format';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { overallStatus, parseReading, STATUS_LEVEL, VITALS, vitalStatus, type VitalId, type VitalStatus } from './vitals';

type Values = Record<VitalId, string>;
const EMPTY: Values = { heartRate: '', systolic: '', diastolic: '', temperature: '', oxygen: '', respiratory: '' };

export default function VitalSignsPage() {
  const { t } = useTranslation('tools');
  const fmt = useFormatters();
  useDocumentTitle(t('vitals.title'));
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<VitalId, string>>>({});
  const [needOne, setNeedOne] = useState(false);
  const [results, setResults] = useState<Array<{ id: VitalId; value: number; status: VitalStatus }> | null>(null);
  const resultsRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (results) resultsRef.current?.focus();
  }, [results]);

  const check = () => {
    const nextErrors: Partial<Record<VitalId, string>> = {};
    const readings: Array<{ id: VitalId; value: number; status: VitalStatus }> = [];
    for (const range of VITALS) {
      const raw = values[range.id];
      if (!raw.trim()) continue;
      const value = parseReading(raw);
      if (value === null || value < range.bounds[0] || value > range.bounds[1]) {
        nextErrors[range.id] = t('vitals.invalid', { min: fmt.number(range.bounds[0]), max: fmt.number(range.bounds[1]) });
        continue;
      }
      readings.push({ id: range.id, value, status: vitalStatus(range, value) });
    }
    setErrors(nextErrors);
    const firstError = VITALS.find((range) => nextErrors[range.id]);
    if (firstError) {
      document.getElementById(`vital-${firstError.id}`)?.focus();
      return;
    }
    if (!readings.length) {
      setNeedOne(true);
      return;
    }
    setResults(readings);
  };

  if (results) {
    const overall = overallStatus(results.map((r) => r.status));
    return (
      <div className="space-y-6">
        <PageHeader title={t('vitals.title')} />
        <section aria-labelledby="vital-results" className="space-y-4">
          <h2 id="vital-results" ref={resultsRef} tabIndex={-1} className="text-xl font-semibold outline-none">
            {t('vitals.resultsHeading')}
          </h2>
          <div
            role={overall === 'critical' ? 'alert' : 'status'}
            className="space-y-3 rounded-lg border bg-surface p-4"
          >
            <SeverityBadge level={STATUS_LEVEL[overall]} label={t(`vitals.status.${overall}`)} />
            <p className="font-medium">{t(`vitals.summary.${overall}`)}</p>
            {overall === 'critical' ? <EmergencyCallButtons /> : null}
          </div>
          <ul role="list" className="grid gap-3 sm:grid-cols-2">
            {results.map((reading) => {
              const range = VITALS.find((v) => v.id === reading.id)!;
              const unit = isolateLtr(t(`vitals.units.${reading.id}`));
              return (
                <li key={reading.id} className="space-y-2 rounded-lg border bg-surface p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">{t(`vitals.fields.${reading.id}`)}</span>
                    <SeverityBadge level={STATUS_LEVEL[reading.status]} label={t(`vitals.status.${reading.status}`)} />
                  </div>
                  <p className="text-2xl font-semibold tabular-nums">
                    <span dir="ltr">
                      {fmt.number(reading.value)} <span className="text-base font-normal text-muted-foreground">{unit}</span>
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('vitals.normalRange', { min: fmt.number(range.normal[0]), max: fmt.number(range.normal[1]), unit })}
                  </p>
                </li>
              );
            })}
          </ul>
          <Button variant="outline" onClick={() => setResults(null)}>
            {t('vitals.reset')}
          </Button>
        </section>
        <Alert variant="info" role="note">
          <Info aria-hidden="true" />
          <p>{t('vitals.disclaimer')}</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('vitals.title')} description={t('vitals.description')} />
      <p className="flex items-start gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {t('vitals.privacy')}
      </p>
      <form noValidate onSubmit={(event) => event.preventDefault()} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {VITALS.map((range) => {
            const unit = isolateLtr(t(`vitals.units.${range.id}`));
            const normal = t('vitals.normalRange', { min: fmt.number(range.normal[0]), max: fmt.number(range.normal[1]), unit });
            return (
              <Field
                key={range.id}
                id={`vital-${range.id}`}
                label={`${t(`vitals.fields.${range.id}`)} (${unit})`}
                hint={range.id === 'temperature' ? `${normal} ${t('vitals.temperatureHint', { unit })}` : normal}
                error={errors[range.id]}
              >
                {(control) => (
                  <Input
                    {...control}
                    inputMode="decimal"
                    dir="ltr"
                    autoComplete="off"
                    value={values[range.id]}
                    onChange={(event) => {
                      setValues((current) => ({ ...current, [range.id]: event.target.value }));
                      setNeedOne(false);
                    }}
                  />
                )}
              </Field>
            );
          })}
        </div>
        {needOne ? (
          <Alert variant="destructive" role="alert">
            <CircleAlert aria-hidden="true" />
            <p>{t('vitals.enterOne')}</p>
          </Alert>
        ) : null}
        <Button type="button" size="lg" onClick={check}>
          {t('vitals.check')}
        </Button>
      </form>
      <Alert variant="info" role="note">
        <Info aria-hidden="true" />
        <p>{t('vitals.disclaimer')}</p>
      </Alert>
    </div>
  );
}
