import { ExternalLink, TriangleAlert } from 'lucide-react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui/feedback';
import { useFormatters } from '@/lib/format';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

type LegalDoc = 'about' | 'privacy' | 'terms';
interface Section {
  heading: string;
  paragraphs: string[];
}

/** When these drafts were written. Update it when the operator signs off a version. */
const DRAFT_DATE = new Date(2026, 9, 10);
const GEMINI_TERMS_URL = 'https://ai.google.dev/gemini-api/terms';

/**
 * "<todo>…</todo>" in legal.json marks details only the operator can supply: who runs the
 * service, a contact email, the Gemini API tier, retention, hosting and the legal terms.
 * They stay highlighted on the page until someone fills them in.
 */
function WithPlaceholders({ text }: { text: string }) {
  return text.split(/<todo>(.*?)<\/todo>/).map((part, index) =>
    index % 2 ? (
      <mark key={index} className="rounded-sm bg-warning px-0.5 text-warning-foreground">
        {part}
      </mark>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

function LegalDocument({ doc }: { doc: LegalDoc }) {
  const { t } = useTranslation('legal');
  const fmt = useFormatters();
  const title = t(`${doc}.title`);
  useDocumentTitle(title);
  const sections = t(`${doc}.sections`, { returnObjects: true }) as unknown as Record<string, Section>;

  return (
    <article aria-labelledby="legal-title" className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-2">
        <h1 id="legal-title" className="text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{t('updated', { date: fmt.date(DRAFT_DATE) })}</p>
      </header>
      <Alert variant="warning" role="note">
        <TriangleAlert aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-semibold">{t('draft.title')}</p>
          <p>{t('draft.body')}</p>
        </div>
      </Alert>
      <p className="text-lg">{t(`${doc}.intro`)}</p>
      {Object.entries(sections).map(([id, section]) => (
        <section key={id} aria-labelledby={`legal-${id}`} className="space-y-3">
          <h2 id={`legal-${id}`} className="text-xl font-semibold">
            {section.heading}
          </h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>
              <WithPlaceholders text={paragraph} />
            </p>
          ))}
          {doc === 'privacy' && id === 'ai' ? (
            <p>
              <a
                href={GEMINI_TERMS_URL}
                className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary underline underline-offset-2 hover:no-underline"
              >
                {t('privacy.geminiTerms')}
                <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
              </a>
            </p>
          ) : null}
        </section>
      ))}
    </article>
  );
}

export const AboutPage = () => <LegalDocument doc="about" />;
export const PrivacyPage = () => <LegalDocument doc="privacy" />;
export const TermsPage = () => <LegalDocument doc="terms" />;
