import axios from 'axios';
import useAuthStore, { AUTH_STORAGE_KEYS, clearStoredSession, isSessionExpired } from '../store/authStore.js';

const BASE = import.meta.env.VITE_API_URL || '/api/v1';

/**
 * Configured Axios client for making API requests to the backend.
 * Includes interceptors for:
 * - Automatically attaching JWT tokens to request headers.
 * - Checking for session expiration before requests.
 * - Handling 401 responses by attempting to refresh the JWT token once.
 * - Logging out and redirecting to the login page if refresh fails or the session is definitively invalid.
 */
const client = axios.create({ baseURL: BASE });

client.interceptors.request.use(config => {
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
  const lastActivity = localStorage.getItem(AUTH_STORAGE_KEYS.lastActivity);

  if (token && isSessionExpired(lastActivity)) {
    clearStoredSession();
    return config;
  }

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      const originalRequest = err.config;
      const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken);

      if (refreshToken && !originalRequest?._retry && !originalRequest?.url?.includes('/auth/refresh')) {
        originalRequest._retry = true;

        try {
          const refreshResponse = await axios.post(`${BASE}/auth/refresh`, { refresh_token: refreshToken });
          useAuthStore.getState().updateTokens(refreshResponse.data);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
          return client(originalRequest);
        } catch {
          clearStoredSession();
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
      }

      clearStoredSession();
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default client;
