import type { ComponentType } from 'react';
import { createBrowserRouter, Navigate, Outlet, useNavigate, useSearchParams } from 'react-router';
import { logout } from '../services/api';
import { NotFoundPage, RouteError } from './NotFoundPage';
import { RequireRole } from './RequireRole';
import { RootLayout } from './RootLayout';
import { currentUser, homeFor, safeNext } from './session';

type BackProps = { onBack: () => void };
type PortalProps = { user: unknown; onLogout: () => void };

/** Pre-rebuild module pages take an onBack callback; each gets its own lazily loaded route. */
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
    const navigate = useNavigate();
    const onLogout = () => {
      logout();
      navigate('/', { replace: true });
    };
    return <Page user={currentUser()} onLogout={onLogout} />;
  }
  return { Component: LegacyPortalRoute };
};

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    hydrateFallbackElement: <div aria-busy="true" className="min-h-screen" />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { default: Landing } = await import('../pages/LegacyLanding');
          function LandingRoute() {
            const user = currentUser();
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
            const user = currentUser();
            if (user) return <Navigate to={homeFor(user.role)} replace />;
            const onLogin = (u: { role?: string }) =>
              navigate(safeNext(params.get('next')) ?? homeFor(u.role === 'doctor' ? 'doctor' : 'patient'), {
                replace: true,
              });
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
          { path: 'analyze/xray', lazy: legacyModule(() => import('../pages/XrayAnalyzer')) },
          { path: 'analyze/bone', lazy: legacyModule(() => import('../pages/BoneScan')) },
          { path: 'analyze/ecg', lazy: legacyModule(() => import('../pages/ECGAnalyzer')) },
          { path: 'analyze/blood', lazy: legacyModule(() => import('../pages/BloodTestAnalyzer')) },
          { path: 'analyze/prescription', lazy: legacyModule(() => import('../pages/PrescriptionReader')) },
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
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
