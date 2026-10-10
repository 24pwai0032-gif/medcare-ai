import type { User } from './types';

// Same keys as the pre-rebuild app, so existing sign-ins survive the update.
const TOKEN_KEY = 'medcare_token';
const USER_KEY = 'medcare_user';

export function isUser(value: unknown): value is User {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (v.role === 'patient' || v.role === 'doctor') && typeof v.email === 'string';
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Only the sign-in token and profile are stored in the browser; never images or reports. */
export const sessionStore = {
  getToken: () => read(TOKEN_KEY),

  getUser(): User | null {
    const raw = read(USER_KEY);
    if (!raw) return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      return isUser(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },

  save(token: string, user: User) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // Storage blocked (private mode): the session lasts until the tab closes.
    }
  },

  saveUser(user: User) {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
  },

  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
  },
};
