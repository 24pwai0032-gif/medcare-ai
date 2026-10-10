import type { CustomTypeOptions } from 'i18next';
import type { ComponentType } from 'react';
import { Navigate, Outlet, type RouteObject } from 'react-router';
import { useAuth } from '@/features/auth/authContext';
import { homeFor } from '@/features/auth/redirects';
import { RequireRole } from '@/features/auth/RequireRole';
import i18n from '@/i18n';
import type { Role } from '@/services/types';
import { NotFoundPage, RouteError } from './NotFoundPage';
import { RootLayout } from './RootLayout';

type Namespace = keyof CustomTypeOptions['resources'];

/**
 * Loads a route's code and its translations in parallel, before the route renders. Otherwise the
 * page would suspend on its strings after the layout had painted, flashing a spinner and pushing
 * the footer down (a layout shift).
 */
const withStrings = async <T,>(load: Promise<T>, namespaces: readonly Namespace[]) => {
  const [module] = await Promise.all([load, namespaces.length ? i18n.loadNamespaces([...namespaces]) : undefined]);
  return module;
};

/** Lazily loaded route module with a default-exported page component. */
const page = (load: () => Promise<{ default: ComponentType }>, namespaces: readonly Namespace[] = []) => async () => ({
  Component: (await withStrings(load(), namespaces)).default,
});

/** Signed-in layout: query cache, toasts and the app shell (sidebar or bottom navigation). */
const shellLayout = (role: Role) => async () => {
  const [{ AppShell }, { AppDataProvider }] = await Promise.all([
    import('@/components/layout/AppShell'),
    import('./AppDataProvider'),
  ]);
  function ShellLayout() {
    return (
      <AppDataProvider>
        <AppShell role={role} />
      </AppDataProvider>
    );
  }
  return { Component: ShellLayout };
};

const publicLayout = () => import('@/components/layout/PublicLayout').then((m) => ({ Component: m.PublicLayout }));
const legalPage = (name: 'AboutPage' | 'PrivacyPage' | 'TermsPage') => async () => ({
  Component: (await withStrings(import('@/features/legal/LegalPages'), ['legal']))[name],
});

const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      { path: 'design', lazy: page(() => import('@/features/design/DesignPage')) },
      {
        path: 'design/shell',
        lazy: () => import('@/features/design/ShellPreview').then((m) => ({ Component: m.ShellPreviewLayout })),
        children: [
          {
            index: true,
            lazy: () => import('@/features/design/ShellPreview').then((m) => ({ Component: m.ShellPreviewContent })),
          },
        ],
      },
    ]
  : [];

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    hydrateFallbackElement: <div aria-busy="true" className="min-h-dvh" />,
    children: [
      {
        lazy: publicLayout,
        children: [
          {
            index: true,
            lazy: async () => {
              const { default: Landing } = await withStrings(import('@/features/landing/LandingPage'), ['landing']);
              function LandingRoute() {
                const { user } = useAuth();
                return user ? <Navigate to={homeFor(user.role)} replace /> : <Landing />;
              }
              return { Component: LandingRoute };
            },
          },
          { path: 'login', lazy: page(() => import('@/features/auth/LoginPage'), ['auth']) },
          { path: 'register', lazy: page(() => import('@/features/auth/RegisterPage'), ['auth']) },
          // Public on purpose: first aid must never sit behind sign-in.
          { path: 'emergency', lazy: page(() => import('@/features/emergency/EmergencyListPage'), ['emergency']) },
          { path: 'emergency/:slug', lazy: page(() => import('@/features/emergency/EmergencyDetailPage'), ['emergency']) },
          { path: 'about', lazy: legalPage('AboutPage') },
          { path: 'privacy', lazy: legalPage('PrivacyPage') },
          { path: 'terms', lazy: legalPage('TermsPage') },
          { path: '*', Component: NotFoundPage },
        ],
      },
      {
        path: 'app',
        element: (
          <RequireRole role="patient">
            <Outlet />
          </RequireRole>
        ),
        children: [
          {
            lazy: shellLayout('patient'),
            children: [
              { index: true, lazy: page(() => import('@/features/patient/PatientDashboard'), ['patient']) },
              { path: 'scans', lazy: page(() => import('@/features/patient/ScanHistoryPage'), ['patient']) },
              { path: 'scans/:id', lazy: page(() => import('@/features/patient/ScanDetailPage'), ['patient', 'report']) },
              { path: 'analyze/:module', lazy: page(() => import('@/features/analyzer/AnalyzerPage'), ['analyzer', 'report']) },
              { path: 'diagnosis', lazy: page(() => import('@/features/tools/SymptomGuidePage'), ['tools']) },
              { path: 'mental-health', lazy: page(() => import('@/features/tools/MentalHealthPage'), ['tools']) },
              { path: 'vitals', lazy: page(() => import('@/features/tools/VitalSignsPage'), ['tools']) },
            ],
          },
          // The pre-rebuild URL for first aid.
          { path: 'emergency', element: <Navigate to="/emergency" replace /> },
        ],
      },
      {
        path: 'doctor',
        element: (
          <RequireRole role="doctor">
            <Outlet />
          </RequireRole>
        ),
        children: [
          {
            lazy: shellLayout('doctor'),
            children: [
              { index: true, lazy: page(() => import('@/features/doctor/ReviewQueuePage'), ['doctor']) },
              { path: 'scans', lazy: page(() => import('@/features/doctor/AllScansPage'), ['doctor']) },
              { path: 'scans/:id', lazy: page(() => import('@/features/doctor/ReviewPage'), ['doctor', 'report']) },
            ],
          },
        ],
      },
      ...devRoutes,
    ],
  },
];
