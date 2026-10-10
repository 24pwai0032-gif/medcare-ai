import { createContext, useContext } from 'react';
import type { LoginBody, RegisterBody, User } from '@/services/types';

/** Why the user is signed out: they chose to, or the server rejected the token. */
export type SignOutReason = 'signed-out' | 'expired' | null;

export interface AuthContextValue {
  user: User | null;
  signOutReason: SignOutReason;
  login: (body: LoginBody) => Promise<User>;
  register: (body: RegisterBody) => Promise<User>;
  logout: () => void;
  /** Re-reads the session after a pre-rebuild page wrote it directly to storage. */
  syncFromStorage: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
