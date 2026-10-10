import { Siren } from 'lucide-react';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet } from 'react-router';
import { Logo } from '@/components/Logo';
import { PageLoader } from '@/components/states';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/authContext';
import { homeFor } from '@/features/auth/redirects';
import { SkipLink } from './SkipLink';
import { LanguageToggle, ThemeToggle } from './toggles';

const FOOTER_LINKS = [
  { to: '/emergency', key: 'nav.emergency' },
  { to: '/about', key: 'nav.about' },
  { to: '/privacy', key: 'nav.privacy' },
  { to: '/terms', key: 'nav.terms' },
] as const;

/** A quiet, always-visible route to emergency help on every public page. */
function EmergencyStrip() {
  const { t } = useTranslation();
  return (
    <div className="bg-sev-severe text-sev-severe-foreground">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-1.5 text-sm sm:px-6">
        <Siren className="size-4 shrink-0" aria-hidden="true" />
        <span className="font-semibold">{t('emergencyStrip.question')}</span>
        <a href="tel:1122" className="inline-flex min-h-8 items-center font-bold underline underline-offset-2">
          {t('emergencyNumbers.callRescue')}
        </a>
        <a href="tel:115" className="inline-flex min-h-8 items-center font-bold underline underline-offset-2">
          {t('emergencyNumbers.callEdhi')}
        </a>
        <Link to="/emergency" className="inline-flex min-h-8 items-center underline underline-offset-2">
          {t('emergencyStrip.guide')}
        </Link>
      </div>
    </div>
  );
}

function PublicFooter() {
  const { t } = useTranslation();
  return (
    <footer className="border-t bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:px-6">
        <nav aria-label={t('nav.footer')}>
          <ul role="list" className="flex flex-wrap gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="inline-flex min-h-11 items-center font-medium hover:underline">
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-muted-foreground">{t('footer.notMedicalAdvice')}</p>
        <p className="text-muted-foreground">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}

export function PublicLayout() {
  const { t } = useTranslation();
  const { user } = useAuth();
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <EmergencyStrip />
      <header className="sticky top-0 z-30 border-b bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-1 px-2 sm:px-6">
          <Link to="/" className="me-auto flex min-h-11 items-center px-2">
            <Logo nameClassName="max-[399px]:sr-only" />
          </Link>
          <LanguageToggle showIcon={false} />
          <ThemeToggle />
          {user ? (
            <Button asChild size="sm" className="ms-1 h-11">
              <Link to={homeFor(user.role)}>{t('actions.openDashboard')}</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm" className="ms-1 h-11">
              <Link to="/login">{t('actions.signIn')}</Link>
            </Button>
          )}
        </div>
      </header>
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}
