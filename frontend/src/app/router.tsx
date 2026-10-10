import type { ComponentType } from 'react';
import { createBrowserRouter, Navigate, Outlet, useNavigate, type RouteObject } from 'react-router';
import { useAuth } from '@/features/auth/authContext';
import { homeFor } from '@/features/auth/redirects';
import { RequireRole } from '@/features/auth/RequireRole';
import type { Role } from '@/services/types';
import { NotFoundPage, RouteError } from './NotFoundPage';
import { RootLayout } from './RootLayout';

/** Lazily loaded route module with a default-exported page component. */
const page = (load: () => Promise<{ default: ComponentType }>) => () => load().then((m) => ({ Component: m.default }));

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

// Pre-rebuild pages, wired to the router until their phase replaces them.
type BackProps = { onBack: () => void };

const legacyModule = (load: () => Promise<{ default: ComponentType<BackProps> }>) => async () => {
  const { default: Page } = await load();
  function LegacyModuleRoute() {
    const navigate = useNavigate();
    return <Page onBack={() => navigate('/app')} />;
  }
  return { Component: LegacyModuleRoute };
};

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
        index: true,
        lazy: async () => {
          const { default: Landing } = await import('../pages/LegacyLanding');
          function LandingRoute() {
            const { user } = useAuth();
            return user ? <Navigate to={homeFor(user.role)} replace /> : <Landing />;
          }
          return { Component: LandingRoute };
        },
      },
      {
        lazy: publicLayout,
        children: [
          { path: 'login', lazy: page(() => import('@/features/auth/LoginPage')) },
          { path: 'register', lazy: page(() => import('@/features/auth/RegisterPage')) },
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
              { index: true, lazy: page(() => import('@/features/patient/PatientDashboard')) },
              { path: 'scans', lazy: page(() => import('@/features/patient/ScanHistoryPage')) },
              { path: 'scans/:id', lazy: page(() => import('@/features/patient/ScanDetailPage')) },
              { path: 'analyze/:module', lazy: page(() => import('@/features/analyzer/AnalyzerPage')) },
            ],
          },
          { path: 'diagnosis', lazy: legacyModule(() => import('../pages/DiagnosisAI')) },
          { path: 'mental-health', lazy: legacyModule(() => import('../pages/MentalHealth')) },
          { path: 'vitals', lazy: legacyModule(() => import('../pages/VitalSigns')) },
          { path: 'emergency', lazy: legacyModule(() => import('../pages/EmergencyAid')) },
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
              { index: true, lazy: page(() => import('@/features/doctor/ReviewQueuePage')) },
              { path: 'scans', lazy: page(() => import('@/features/doctor/AllScansPage')) },
              { path: 'scans/:id', lazy: page(() => import('@/features/doctor/ReviewPage')) },
            ],
          },
        ],
      },
      ...devRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
