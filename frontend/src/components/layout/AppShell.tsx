import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, Outlet } from 'react-router';
import { Logo } from '@/components/Logo';
import { PageLoader } from '@/components/states';
import { homeFor } from '@/features/auth/redirects';
import { cn } from '@/lib/utils';
import type { Role } from '@/services/types';
import { NAV, type NavItem } from './nav';
import { LanguageToggle, ThemeToggle } from './toggles';
import { SidebarAccount, UserMenu } from './UserMenu';

export function SkipLink() {
  const { t } = useTranslation();
  return (
    <a
      href="#main"
      className="sr-only z-50 rounded-md bg-primary px-4 py-3 font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:start-3 focus:top-3"
    >
      {t('skipToContent')}
    </a>
  );
}

const linkBase =
  'flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

function SideNav({ items }: { items: NavItem[] }) {
  const { t } = useTranslation();
  const groups = [
    { id: 'main', heading: null },
    { id: 'analyze', heading: t('nav.analyze') },
    { id: 'tools', heading: t('nav.tools') },
  ] as const;
  return (
    <nav aria-label={t('nav.main')} className="flex-1 space-y-5 overflow-y-auto px-3 py-2">
      {groups.map((group) => {
        const groupItems = items.filter((item) => item.group === group.id);
        if (!groupItems.length) return null;
        return (
          <div key={group.id} className="space-y-1">
            {group.heading ? (
              <p className="px-3 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{group.heading}</p>
            ) : null}
            <ul className="space-y-1">
              {groupItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        linkBase,
                        item.tone === 'emergency'
                          ? 'text-destructive hover:bg-sev-severe'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                        isActive && 'bg-secondary text-secondary-foreground',
                      )
                    }
                  >
                    <item.icon className="size-5 shrink-0" aria-hidden="true" />
                    {t(item.labelKey)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function BottomNav({ items }: { items: NavItem[] }) {
  const { t } = useTranslation();
  return (
    <nav
      aria-label={t('nav.main')}
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg justify-around">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-xs font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
                  item.tone === 'emergency' ? 'text-destructive' : 'text-muted-foreground',
                  isActive && 'text-primary',
                )
              }
            >
              <item.icon className="size-6" aria-hidden="true" />
              <span className="text-center leading-tight">{t(item.labelKey)}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Sidebar on desktop; top bar and bottom navigation on mobile. */
export function AppShell({ role, items = NAV[role] }: { role: Role; items?: NavItem[] }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <SkipLink />
      <aside className="sticky top-0 hidden h-dvh flex-col border-e bg-surface lg:flex">
        <Link to={homeFor(role)} className="flex h-16 items-center px-5">
          <Logo />
        </Link>
        <SideNav items={items} />
        <div className="flex items-center gap-1 border-t px-3 py-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
        <div className="border-t p-3">
          <SidebarAccount />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-1 border-b bg-surface px-2 lg:hidden">
          <Link to={homeFor(role)} className="me-auto flex min-h-11 items-center px-2">
            <Logo nameClassName="max-[359px]:sr-only" />
          </Link>
          <LanguageToggle showIcon={false} />
          <ThemeToggle />
          <UserMenu />
        </header>
        <main id="main" tabIndex={-1} className="flex-1 px-4 pt-6 pb-28 outline-none sm:px-6 lg:px-10 lg:pt-8 lg:pb-12">
          <div className="mx-auto w-full max-w-5xl">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      <BottomNav items={items.filter((item) => item.mobile)} />
    </div>
  );
}
