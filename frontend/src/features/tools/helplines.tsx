import { LifeBuoy, Phone } from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { EmergencyCallButtons } from '@/components/Disclaimer';

/**
 * Pakistani mental-health helplines, each checked against an official source on 2026-10-10
 * (listed in CHANGELOG.md). Re-check them regularly; never add a number without a source.
 */
export const HELPLINES = [
  // WHO EMRO list of mental health services (Umang's own site had an expired certificate).
  { id: 'umang', display: '0311 7786264', tel: '+923117786264', source: 'https://www.emro.who.int/mhps/mental_health_professionals.html' },
  // Government of Pakistan, Press Information Department, 9 March 2023.
  { id: 'gov', display: '1166', tel: '1166', source: 'https://pid.gov.pk/site/press_detail/22237' },
  // Rozan's own counseling services page.
  { id: 'rozan', display: '0304 111 1741', tel: '+923041111741', source: 'https://rozan.org/counseling-services/' },
] as const;

export function HelplineList() {
  const { t } = useTranslation('tools');
  return (
    <ul role="list" className="grid gap-3 sm:grid-cols-3">
      {HELPLINES.map((line) => (
        <li key={line.id} className="rounded-md border border-current/30 bg-surface p-3 text-foreground">
          <p className="font-semibold">{t(`helplines.${line.id}.name`)}</p>
          <p className="text-sm text-muted-foreground">{t(`helplines.${line.id}.hours`)}</p>
          <a
            href={`tel:${line.tel}`}
            className="mt-2 inline-flex min-h-11 items-center gap-2 font-bold text-primary underline underline-offset-2"
            dir="ltr"
          >
            <Phone className="size-4" aria-hidden="true" />
            {line.display}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Shown as soon as PHQ-9 item 9 is answered above zero, whatever the total score. */
export function CrisisPanel() {
  const { t } = useTranslation('tools');
  const headingId = useId();
  return (
    <section
      role="alert"
      aria-labelledby={headingId}
      className="space-y-3 rounded-lg border-2 border-sev-severe-foreground/60 bg-sev-severe p-4 text-sev-severe-foreground"
    >
      <h3 id={headingId} className="flex items-start gap-2 text-lg font-semibold">
        <LifeBuoy className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        {t('phq9.crisis.title')}
      </h3>
      <p>{t('phq9.crisis.body')}</p>
      <p className="font-semibold">{t('phq9.crisis.danger')}</p>
      <EmergencyCallButtons />
      <h4 className="pt-1 font-semibold">{t('phq9.crisis.helplines')}</h4>
      <HelplineList />
    </section>
  );
}
