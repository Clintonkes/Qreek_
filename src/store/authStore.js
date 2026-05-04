import { create } from 'zustand';

export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export const AUTH_STORAGE_KEYS = {
  token: 'qreek_token',
  refreshToken: 'qreek_refresh_token',
  user: 'qreek_user',
  lastActivity: 'qreek_session_last_activity',
};

export function clearStoredSession() {
  localStorage.removeItem(AUTH_STORAGE_KEYS.token);
  localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken);
  localStorage.removeItem(AUTH_STORAGE_KEYS.user);
  localStorage.removeItem(AUTH_STORAGE_KEYS.lastActivity);
}

export function isSessionExpired(lastActivity, now = Date.now()) {
  const lastActiveAt = Number(lastActivity);
  return !lastActiveAt || now - lastActiveAt > SESSION_TIMEOUT_MS;
}

export function markSessionActivity(now = Date.now()) {
  localStorage.setItem(AUTH_STORAGE_KEYS.lastActivity, String(now));
}

export function hasStoredActiveSession() {
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
  const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken);
  const lastActivity = localStorage.getItem(AUTH_STORAGE_KEYS.lastActivity);
  return !!token && !!refreshToken && !isSessionExpired(lastActivity);
}

const stored = (() => {
  try {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
    const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken);
    const user  = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEYS.user) || 'null');
    const lastActivity = localStorage.getItem(AUTH_STORAGE_KEYS.lastActivity);

    if (!token || !refreshToken || isSessionExpired(lastActivity)) {
      clearStoredSession();
      return { token: null, refreshToken: null, user: null };
    }

    return { token, refreshToken, user };
  } catch {
    clearStoredSession();
    return { token: null, refreshToken: null, user: null };
  }
})();

const useAuthStore = create(set => ({
  token:           stored.token,
  refreshToken:    stored.refreshToken,
  user:            stored.user,
  isAuthenticated: !!stored.token && !!stored.refreshToken,

  setAuth: ({ token, refresh_token: refreshToken, refreshToken: camelRefreshToken, user }) => {
    const nextRefreshToken = refreshToken || camelRefreshToken;
    localStorage.setItem(AUTH_STORAGE_KEYS.token, token);
    if (nextRefreshToken) localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, nextRefreshToken);
    localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));
    markSessionActivity();
    set({ token, refreshToken: nextRefreshToken, user, isAuthenticated: true });
  },

  updateTokens: ({ token, refresh_token: refreshToken, refreshToken: camelRefreshToken }) => {
    const nextRefreshToken = refreshToken || camelRefreshToken;
    localStorage.setItem(AUTH_STORAGE_KEYS.token, token);
    if (nextRefreshToken) localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, nextRefreshToken);
    markSessionActivity();
    set({ token, refreshToken: nextRefreshToken, isAuthenticated: true });
  },

  updateUser: (user) => {
    localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));
    set({ user });
  },

  touchSession: () => {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
    if (token) markSessionActivity();
  },

  validateSession: () => {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
    const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken);
    const lastActivity = localStorage.getItem(AUTH_STORAGE_KEYS.lastActivity);

    if (!token || !refreshToken || isSessionExpired(lastActivity)) {
      clearStoredSession();
      set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
      return false;
    }

    return true;
  },

  logout: () => {
    clearStoredSession();
    set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
