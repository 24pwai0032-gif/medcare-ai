import { getUser, isLoggedIn } from '../services/api';

export type Role = 'patient' | 'doctor';

export interface SessionUser {
  id?: number;
  full_name?: string;
  email?: string;
  role: Role;
}

export function currentUser(): SessionUser | null {
  if (!isLoggedIn()) return null;
  const user = getUser();
  return user && (user.role === 'patient' || user.role === 'doctor') ? (user as SessionUser) : null;
}

export const homeFor = (role: Role) => (role === 'doctor' ? '/doctor' : '/app');

/** Only same-origin relative paths are allowed as a post-login redirect. */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return null;
  return next;
}
