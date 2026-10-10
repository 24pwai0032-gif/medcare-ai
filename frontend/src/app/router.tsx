import type { ComponentType } from 'react';
import { createBrowserRouter, Navigate, Outlet, useNavigate, useSearchParams, type RouteObject } from 'react-router';
import { useAuth } from '@/features/auth/authContext';
import { destinationAfterLogin, homeFor } from '@/features/auth/redirects';
import { RequireRole } from '@/features/auth/RequireRole';
import { NotFoundPage, RouteError } from './NotFoundPage';
import { RootLayout } from './RootLayout';

type BackProps = { onBack: () => void };
type PortalProps = { user: unknown; onLogout: () => void };

// Pre-rebuild pages, wired to the router until their phase replaces them.
const legacyModule = (load: () => Promise<{ default: ComponentType<BackProps> }>) => async () => {
  const { default: Page } = await load();
  function LegacyModuleRoute() {
    const navigate = useNavigate();
    return <Page onBack={() => navigate('/app')} />;
  }
  return { Component: LegacyModuleRoute };
};

const legacyPortal = (load: () => Promise<{ default: ComponentType<PortalProps> }>) => async () => {
  const { default: Page } = await load();
  function LegacyPortalRoute() {
    const { user, logout } = useAuth();
    return <Page user={user} onLogout={logout} />;
  }
  return { Component: LegacyPortalRoute };
};

/** Signed-in layout: query cache + toasts + the app shell (sidebar / bottom navigation). */
const shellLayout = (role: 'patient' | 'doctor') => async () => {
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

const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      { path: 'design', lazy: () => import('@/features/design/DesignPage').then((m) => ({ Component: m.default })) },
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
        path: 'login',
        lazy: async () => {
          const { default: Login } = await import('../pages/Login');
          function LoginRoute() {
            const navigate = useNavigate();
            const [params] = useSearchParams();
            const { user, syncFromStorage } = useAuth();
            if (user) return <Navigate to={homeFor(user.role)} replace />;
            const onLogin = (u: { role?: string }) => {
              syncFromStorage();
              const role = u.role === 'doctor' ? 'doctor' : 'patient';
              navigate(destinationAfterLogin(role, params.get('next')), { replace: true });
            };
            return <Login onLogin={onLogin} />;
          }
          return { Component: LoginRoute };
        },
      },
      {
        path: 'app',
        element: (
          <RequireRole role="patient">
            <Outlet />
          </RequireRole>
        ),
        children: [
          { index: true, lazy: legacyPortal(() => import('../pages/PatientDashboard')) },
          {
            lazy: shellLayout('patient'),
            children: [
              {
                path: 'analyze/:module',
                lazy: () => import('@/features/analyzer/AnalyzerPage').then((m) => ({ Component: m.default })),
              },
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
        children: [{ index: true, lazy: legacyPortal(() => import('../pages/DoctorDashboard')) }],
      },
      ...devRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
