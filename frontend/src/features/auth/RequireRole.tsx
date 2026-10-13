import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import type { Role } from '@/services/types';
import { useAuth } from './authContext';
import { homeFor } from './redirects';

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user, signOutReason } = useAuth();
  const location = useLocation();

  if (!user) {
    // After "Sign out" go home; after an expired session come back here once signed in again.
    if (signOutReason === 'signed-out') return <Navigate to="/" replace />;
    const next = encodeURIComponent(location.pathname + location.search);
    const expired = signOutReason === 'expired' ? '&expired=1' : '';
    return <Navigate to={`/login?next=${next}${expired}`} replace />;
  }
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />;
  return children;
}
