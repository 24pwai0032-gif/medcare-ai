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

const stripCall =
  'inline-flex min-h-8 items-center rounded-full bg-emergency px-3 font-bold text-emergency-foreground transition-[filter] hover:brightness-110';

/** A quiet, always-visible route to emergency help on every public page. */
function EmergencyStrip() {
  const { t } = useTranslation();
  return (
    <div className="bg-sev-severe text-sev-severe-foreground">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-2.5 gap-y-1.5 px-4 py-1.5 text-sm sm:px-6">
        <Siren className="size-4 shrink-0" aria-hidden="true" />
        <span className="font-semibold max-sm:sr-only">{t('emergencyStrip.question')}</span>
        <a href="tel:1122" className={stripCall}>
          {t('emergencyNumbers.callRescue')}
        </a>
        <a href="tel:115" className={stripCall}>
          {t('emergencyNumbers.callEdhi')}
        </a>
        <Link to="/emergency" className="inline-flex min-h-8 items-center font-semibold underline underline-offset-2 hover:no-underline">
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
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div className="max-w-md space-y-3">
          <Logo />
          <p className="text-muted-foreground">{t('footer.notMedicalAdvice')}</p>
        </div>
        <nav aria-label={t('nav.footer')}>
          <ul role="list" className="flex flex-wrap gap-x-6 gap-y-1">
            {FOOTER_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="inline-flex min-h-11 items-center font-semibold transition-colors hover:text-primary">
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-5 text-sm text-muted-foreground sm:px-6">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </p>
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
            <Button asChild size="sm" className="ms-1">
              <Link to={homeFor(user.role)}>{t('actions.openDashboard')}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline" size="sm" className="ms-1">
                <Link to="/login">{t('actions.signIn')}</Link>
              </Button>
              <Button asChild size="sm" className="ms-1 hidden sm:inline-flex">
                <Link to="/register">{t('actions.getStarted')}</Link>
              </Button>
            </>
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
