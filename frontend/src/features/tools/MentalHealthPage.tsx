import { CircleAlert, Info, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { SeverityBadge } from '@/components/SeverityBadge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { RadioCard, RadioGroup } from '@/components/ui/radio-group';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { CrisisPanel, HelplineList } from './helplines';
import { BAND_LEVEL, PHQ9_ITEMS, scorePhq9, showAdvice, type Phq9Answer } from './phq9';

const empty = () => Array<Phq9Answer | null>(PHQ9_ITEMS).fill(null);

export default function MentalHealthPage() {
  const { t, i18n } = useTranslation(['tools', 'common']);
  useDocumentTitle(t('tools:phq9.title'));
  const [answers, setAnswers] = useState(empty);
  const [showResults, setShowResults] = useState(false);
  const [incomplete, setIncomplete] = useState(false);
  const resultsRef = useRef<HTMLHeadingElement>(null);
  const items = t('tools:phq9.items', { returnObjects: true }) as string[];
  const options = t('tools:phq9.options', { returnObjects: true }) as string[];
  const result = scorePhq9(answers);
  const answered = answers.filter((a) => a !== null).length;

  useEffect(() => {
    if (showResults) resultsRef.current?.focus();
  }, [showResults]);

  const answer = (index: number, value: Phq9Answer) => {
    setAnswers((current) => current.map((a, i) => (i === index ? value : a)));
    setIncomplete(false);
  };

  const submit = () => {
    if (!result.complete) {
      setIncomplete(true);
      const first = answers.findIndex((a) => a === null);
      document.getElementById(`phq-q${first}-o0`)?.focus();
      return;
    }
    setShowResults(true);
  };

  if (showResults) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('tools:phq9.title')} />
        <section aria-labelledby="phq-results" className="space-y-4">
          <h2 id="phq-results" ref={resultsRef} tabIndex={-1} className="text-xl font-semibold outline-none">
            {t('tools:phq9.resultsHeading')}
          </h2>
          {result.crisis ? <CrisisPanel /> : null}
          <div className="space-y-3 rounded-lg border bg-surface p-5">
            <div className="flex flex-wrap items-center gap-3">
              <SeverityBadge level={BAND_LEVEL[result.band]} label={t(`tools:phq9.bands.${result.band}.label`)} srPrefix={t('tools:phq9.band')} />
              <span className="font-semibold tabular-nums">{t('tools:phq9.score', { score: result.total })}</span>
            </div>
            {showAdvice(result.band, result.crisis) ? <p>{t(`tools:phq9.bands.${result.band}.advice`)}</p> : null}
            {result.band === 'severe' && !result.crisis ? <HelplineList /> : null}
          </div>
          <Alert variant="info" role="note">
            <Info aria-hidden="true" />
            <p>{t('tools:phq9.disclaimer')}</p>
          </Alert>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setShowResults(false)}>
              {t('tools:phq9.edit')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setAnswers(empty());
                setShowResults(false);
              }}
            >
              {t('tools:phq9.restart')}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            <span lang="en" dir="ltr">
              {t('tools:phq9.attribution')}
            </span>
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('tools:phq9.title')} description={t('tools:phq9.description')} />
      <p className="flex items-start gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {t('tools:phq9.privacy')}
      </p>
      {i18n.language === 'ur' ? (
        <Alert variant="info" role="note">
          <Info aria-hidden="true" />
          <p>{t('tools:phq9.englishOnly')}</p>
        </Alert>
      ) : null}
      <p lang="en" dir="ltr" className="text-lg font-semibold">
        {t('tools:phq9.stem')}
      </p>
      <form noValidate onSubmit={(event) => event.preventDefault()} className="space-y-6">
        {items.map((item, index) => {
          const legendId = `phq-q${index}-legend`;
          return (
            <fieldset key={index} className="space-y-3 rounded-lg border bg-surface p-4">
              {/* Floated so the legend sits inside the card instead of on its border. */}
              <legend id={legendId} className="float-start w-full">
                <span className="block text-sm text-muted-foreground">{t('tools:phq9.questionLabel', { number: index + 1 })}</span>
                <span lang="en" dir="ltr" className="mb-2 block font-medium">
                  {item}
                </span>
              </legend>
              <RadioGroup
                aria-labelledby={legendId}
                value={answers[index] === null ? '' : String(answers[index])}
                onValueChange={(value) => answer(index, Number(value) as Phq9Answer)}
                className="clear-both sm:grid-cols-2"
              >
                {options.map((option, value) => (
                  <RadioCard key={value} id={`phq-q${index}-o${value}`} value={String(value)}>
                    <span lang="en" dir="ltr">
                      {option}
                    </span>
                  </RadioCard>
                ))}
              </RadioGroup>
              {index === PHQ9_ITEMS - 1 && result.crisis ? <CrisisPanel /> : null}
            </fieldset>
          );
        })}
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {t('tools:phq9.progress', { count: answered })}
        </p>
        {incomplete ? (
          <Alert variant="destructive" role="alert">
            <CircleAlert aria-hidden="true" />
            <p>{t('tools:phq9.answerAll')}</p>
          </Alert>
        ) : null}
        <Button type="button" size="lg" onClick={submit}>
          {t('tools:phq9.submit')}
        </Button>
      </form>
    </div>
  );
}
