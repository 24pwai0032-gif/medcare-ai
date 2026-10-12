import { Activity, Brain, ChevronDown, Siren, Stethoscope } from 'lucide-react';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Disclaimer, EmergencyCallButtons } from '@/components/Disclaimer';
import { IconChip } from '@/components/IconChip';
import { ANALYZER_MODULES, MODULE_IDS } from '@/features/analyzer/modules';
import { useFormatters } from '@/lib/format';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { cn } from '@/lib/utils';
import { warmUpBackend } from '@/services/api';
import { container, Hero, SignUpButtons } from './LandingHero';

/**
 * Only facts that can be checked against the code. The old page's statistics, testimonials,
 * press logos, ratings and accuracy claims were never confirmed, so they were removed (see CHANGELOG).
 */
const STEPS = ['account', 'upload', 'report', 'review'] as const;
const TOOLS = [
  { key: 'diagnosis', icon: Stethoscope },
  { key: 'mentalHealth', icon: Brain },
  { key: 'vitals', icon: Activity },
] as const;
const FAQ = ['diagnosis', 'ai', 'doctors', 'image', 'urdu', 'emergency'] as const;

const sectionHeading = 'text-3xl font-extrabold tracking-tight';
const inlineLink = 'font-semibold text-primary underline underline-offset-2 hover:no-underline';

function Steps() {
  const { t } = useTranslation('landing');
  const fmt = useFormatters();
  return (
    <section aria-labelledby="steps-heading" className={cn(container, 'space-y-6 py-12')}>
      <h2 id="steps-heading" className={sectionHeading}>
        {t('steps.heading')}
      </h2>
      <ol role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <li key={step} className="space-y-3 rounded-2xl border bg-surface p-5 shadow-card">
            <span aria-hidden="true" className="grid size-10 place-items-center rounded-xl bg-brand text-lg font-extrabold text-white">
              {fmt.number(index + 1)}
            </span>
            <h3 className="font-bold">{t(`steps.${step}.title`)}</h3>
            <p className="text-sm text-muted-foreground">{t(`steps.${step}.body`)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Modules() {
  const { t } = useTranslation(['landing', 'common']);
  return (
    <section aria-labelledby="modules-heading" className={cn(container, 'space-y-6 py-12')}>
      <div className="max-w-3xl space-y-2">
        <h2 id="modules-heading" className={sectionHeading}>
          {t('landing:modules.heading')}
        </h2>
        <p className="text-muted-foreground">{t('landing:modules.intro')}</p>
      </div>
      <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {MODULE_IDS.map((id) => (
          <li key={id} className="space-y-3 rounded-2xl border bg-surface p-5 shadow-card">
            <IconChip icon={ANALYZER_MODULES[id].icon} tone={ANALYZER_MODULES[id].tone} size="lg" />
            <h3 className="font-bold">{t(`common:modules.${id}`)}</h3>
            <p className="text-sm text-muted-foreground">{t(`landing:modules.${id}`)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Tools() {
  const { t } = useTranslation(['landing', 'common']);
  return (
    <section aria-labelledby="tools-heading" className={cn(container, 'grid gap-4 py-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]')}>
      <div className="relative overflow-hidden rounded-3xl bg-brand-deep p-7 text-white shadow-raised">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -end-20 -top-24 size-72 rounded-full bg-[radial-gradient(circle,rgb(103_232_249/0.3),transparent_70%)]"
        />
        <div className="relative space-y-4">
          <h2 id="tools-heading" className="text-2xl font-extrabold tracking-tight">
            {t('landing:tools.heading')}
          </h2>
          <p>{t('landing:tools.intro')}</p>
          <ul role="list" className="grid gap-3 sm:grid-cols-3">
            {TOOLS.map((tool) => (
              <li key={tool.key} className="space-y-1 rounded-2xl bg-[rgb(18_19_58/0.35)] p-4 ring-1 ring-white/20">
                <p className="flex items-center gap-2 font-bold">
                  <tool.icon className="size-5 shrink-0" aria-hidden="true" />
                  {t(`common:modules.${tool.key}`)}
                </p>
                <p className="text-sm">{t(`landing:tools.${tool.key}`)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-3xl border border-sev-severe-foreground/25 bg-sev-severe p-7 text-sev-severe-foreground">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
          <Siren className="size-6 shrink-0" aria-hidden="true" />
          {t('landing:tools.emergencyTitle')}
        </h2>
        <p>{t('landing:tools.emergencyBody')}</p>
        <EmergencyCallButtons className="sm:grid-cols-1 xl:grid-cols-2" />
        <Link to="/emergency" className="inline-flex min-h-11 items-center font-bold underline underline-offset-2">
          {t('landing:hero.emergencyLink')}
        </Link>
      </div>
    </section>
  );
}

function Faq() {
  const { t } = useTranslation('landing');
  const telLink = 'font-semibold underline underline-offset-2 hover:no-underline';
  return (
    <section aria-labelledby="faq-heading" className="mx-auto w-full max-w-3xl space-y-6 px-4 py-12 sm:px-6">
      <h2 id="faq-heading" className={sectionHeading}>
        {t('faq.heading')}
      </h2>
      <div className="divide-y overflow-hidden rounded-2xl border bg-surface shadow-card">
        {FAQ.map((id) => (
          <details key={id} className="group">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-bold hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
              {t(`faq.${id}.q`)}
              <ChevronDown className="size-5 shrink-0 text-primary transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="px-5 pt-1 pb-5 text-muted-foreground">
              <Trans
                t={t}
                i18nKey={`faq.${id}.a`}
                components={{
                  rescue: <a href="tel:1122" className={telLink} />,
                  edhi: <a href="tel:115" className={telLink} />,
                  privacy: <Link to="/privacy" className={inlineLink} />,
                  firstAid: <Link to="/emergency" className={inlineLink} />,
                }}
              />
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

export default function LandingPage() {
  const { t } = useTranslation('landing');
  useDocumentTitle(t('title'));
  // Most visitors sign in next; wake a sleeping backend now so they don't wait for it.
  useEffect(() => {
    warmUpBackend();
  }, []);
  return (
    <>
      <Hero />
      <div className={container}>
        <Disclaimer />
      </div>
      <Steps />
      <Modules />
      <Tools />
      <Faq />
      <section aria-labelledby="cta-heading" className={cn(container, 'pb-16')}>
        <div className="relative flex flex-col gap-5 overflow-hidden rounded-3xl border bg-surface p-7 shadow-raised md:flex-row md:items-center md:justify-between">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -start-24 -bottom-32 size-80 rounded-full bg-[radial-gradient(circle,var(--glow-a),transparent_70%)]"
          />
          <div className="relative space-y-1">
            <h2 id="cta-heading" className="text-2xl font-extrabold tracking-tight">
              {t('cta.heading')}
            </h2>
            <p className="text-muted-foreground">{t('cta.body')}</p>
          </div>
          <div className="relative">
            <SignUpButtons />
          </div>
        </div>
      </section>
    </>
  );
}
