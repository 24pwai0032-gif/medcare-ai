import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, setUnauthorizedHandler } from '@/services/api';
import { ApiError } from '@/services/errors';
import { isUser, sessionStore } from '@/services/session';
import type { AuthResponse, LoginBody, RegisterBody, User } from '@/services/types';
import { AuthContext, type SignOutReason } from './authContext';

const storedUser = () => (sessionStore.getToken() ? sessionStore.getUser() : null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(storedUser);
  const [signOutReason, setSignOutReason] = useState<SignOutReason>(null);

  const endSession = useCallback((reason: Exclude<SignOutReason, null>) => {
    sessionStore.clear();
    setUser(null);
    setSignOutReason(reason);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => endSession('expired'));
    return () => setUnauthorizedHandler(null);
  }, [endSession]);

  // Refresh the stored profile once in the background. A 401 ends the session through the handler.
  useEffect(() => {
    if (!sessionStore.getToken()) return;
    let active = true;
    api
      .me()
      .then((fresh) => {
        if (!active || !isUser(fresh)) return;
        sessionStore.saveUser(fresh);
        setUser(fresh);
      })
      .catch(() => {
        // Offline or a cold start: keep the stored profile.
      });
    return () => {
      active = false;
    };
  }, []);

  const startSession = useCallback((response: AuthResponse) => {
    if (!response?.access_token || !isUser(response.user)) throw new ApiError('server');
    sessionStore.save(response.access_token, response.user);
    setSignOutReason(null);
    setUser(response.user);
    return response.user;
  }, []);

  const login = useCallback(async (body: LoginBody) => startSession(await api.login(body)), [startSession]);
  const register = useCallback(async (body: RegisterBody) => startSession(await api.register(body)), [startSession]);
  const logout = useCallback(() => endSession('signed-out'), [endSession]);
  const syncFromStorage = useCallback(() => {
    setSignOutReason(null);
    setUser(storedUser());
  }, []);

  const value = useMemo(
    () => ({ user, signOutReason, login, register, logout, syncFromStorage }),
    [user, signOutReason, login, register, logout, syncFromStorage],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
