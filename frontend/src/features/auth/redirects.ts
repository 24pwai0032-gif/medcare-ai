import type { Role } from '@/services/types';

export const homeFor = (role: Role) => (role === 'doctor' ? '/doctor' : '/app');

/** Only same-origin relative paths are allowed as a post-login redirect. */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return null;
  return next;
}

/** A role's `next` path is only honoured inside that role's own area. */
export function destinationAfterLogin(role: Role, next: string | null | undefined) {
  const target = safeNext(next);
  const home = homeFor(role);
  if (!target) return home;
  if (target.startsWith('/app') || target.startsWith('/doctor')) return target.startsWith(home) ? target : home;
  return target;
}
