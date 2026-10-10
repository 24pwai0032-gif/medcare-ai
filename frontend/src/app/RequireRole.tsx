import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { currentUser, homeFor, type Role } from './session';

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const location = useLocation();
  const user = currentUser();

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />;
  return children;
}
