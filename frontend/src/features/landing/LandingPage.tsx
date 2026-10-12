import { Activity, Brain, ChevronDown, Siren, Stethoscope, UserPlus } from 'lucide-react';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Disclaimer } from '@/components/Disclaimer';
import { Button } from '@/components/ui/button';
import { ANALYZER_MODULES, MODULE_IDS } from '@/features/analyzer/modules';
import { useFormatters } from '@/lib/format';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { cn } from '@/lib/utils';
import { warmUpBackend } from '@/services/api';

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

const container = 'mx-auto w-full max-w-6xl px-4 sm:px-6';
const sectionHeading = 'text-2xl font-semibold tracking-tight';
const inlineLink = 'font-semibold text-primary underline underline-offset-2 hover:no-underline';

function SignUpButtons() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild size="lg">
        <Link to="/register">
          <UserPlus aria-hidden="true" />
          {t('actions.getStarted')}
        </Link>
      </Button>
      <Button asChild size="lg" variant="outline">
        <Link to="/login">{t('actions.signIn')}</Link>
      </Button>
    </div>
  );
}

function Hero() {
  const { t } = useTranslation('landing');
  return (
    <section aria-labelledby="landing-title" className="border-b bg-surface">
      <div className={cn(container, 'grid gap-8 py-10 md:py-16 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center lg:gap-12')}>
        <div className="space-y-6">
          <h1 id="landing-title" className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            {t('hero.title')}
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">{t('hero.body')}</p>
          <SignUpButtons />
          <p className="flex flex-wrap items-center gap-x-2 text-sm">
            <Siren className="size-4 shrink-0 text-destructive" aria-hidden="true" />
            <span>{t('hero.emergency')}</span>
            <Link to="/emergency" className={cn(inlineLink, 'inline-flex min-h-11 items-center')}>
              {t('hero.emergencyLink')}
            </Link>
          </p>
        </div>
        <Disclaimer />
      </div>
    </section>
  );
}

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
          <li key={step} className="space-y-2 rounded-lg border bg-surface p-5">
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-full bg-secondary font-semibold text-secondary-foreground"
            >
              {fmt.number(index + 1)}
            </span>
            <h3 className="font-semibold">{t(`steps.${step}.title`)}</h3>
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
    <section aria-labelledby="modules-heading" className="border-y bg-surface">
      <div className={cn(container, 'space-y-6 py-12')}>
        <div className="max-w-3xl space-y-2">
          <h2 id="modules-heading" className={sectionHeading}>
            {t('landing:modules.heading')}
          </h2>
          <p className="text-muted-foreground">{t('landing:modules.intro')}</p>
        </div>
        <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULE_IDS.map((id) => {
            const Icon = ANALYZER_MODULES[id].icon;
            return (
              <li key={id} className="flex gap-4 rounded-lg border bg-background p-5">
                <Icon className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden="true" />
                <div className="space-y-1">
                  <h3 className="font-semibold">{t(`common:modules.${id}`)}</h3>
                  <p className="text-sm text-muted-foreground">{t(`landing:modules.${id}`)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Tools() {
  const { t } = useTranslation(['landing', 'common']);
  return (
    <section aria-labelledby="tools-heading" className={cn(container, 'space-y-6 py-12')}>
      <div className="max-w-3xl space-y-2">
        <h2 id="tools-heading" className={sectionHeading}>
          {t('landing:tools.heading')}
        </h2>
        <p className="text-muted-foreground">{t('landing:tools.intro')}</p>
      </div>
      <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TOOLS.map((tool) => (
          <li key={tool.key} className="flex gap-4 rounded-lg border bg-surface p-5">
            <tool.icon className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden="true" />
            <div className="space-y-1">
              <h3 className="font-semibold">{t(`common:modules.${tool.key}`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`landing:tools.${tool.key}`)}</p>
            </div>
          </li>
        ))}
        <li className="flex gap-4 rounded-lg border border-sev-severe-foreground/30 bg-sev-severe p-5 text-sev-severe-foreground">
          <Siren className="mt-0.5 size-6 shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <h3 className="font-semibold">{t('landing:tools.emergencyTitle')}</h3>
            <p className="text-sm">{t('landing:tools.emergencyBody')}</p>
            <Link to="/emergency" className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-2">
              {t('landing:hero.emergencyLink')}
            </Link>
          </div>
        </li>
      </ul>
    </section>
  );
}

function Faq() {
  const { t } = useTranslation('landing');
  const telLink = 'font-semibold underline underline-offset-2 hover:no-underline';
  return (
    <section aria-labelledby="faq-heading" className="border-y bg-surface">
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-12 sm:px-6">
        <h2 id="faq-heading" className={sectionHeading}>
          {t('faq.heading')}
        </h2>
        <div className="divide-y rounded-lg border bg-background">
          {FAQ.map((id) => (
            <details key={id} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-semibold hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
                {t(`faq.${id}.q`)}
                <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
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
      <Steps />
      <Modules />
      <Tools />
      <Faq />
      <section aria-labelledby="cta-heading" className={cn(container, 'py-12')}>
        <div className="flex flex-col gap-5 rounded-xl border bg-surface p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 id="cta-heading" className="text-xl font-semibold">
              {t('cta.heading')}
            </h2>
            <p className="text-muted-foreground">{t('cta.body')}</p>
          </div>
          <SignUpButtons />
        </div>
      </section>
    </>
  );
}
