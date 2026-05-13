/**
 * @file client.js
 * @description Centralized HTTP client configuration for backend communication.
 * Provides a pre-configured Axios instance with automated authentication logic 
 * and error handling.
 * 
 * Flow:
 * 1. Request Interception: Automatically injects the active JWT access token into the 
 *    Authorization header and performs pre-flight session expiration checks.
 * 2. Response Interception: Monitors for 401 Unauthorized errors.
 * 3. Token Refresh: On a 401 error, it attempts a single transparent token refresh 
 *    using the stored refresh token.
 * 4. Error Escalation: If a refresh fails or the session is definitively invalid, 
 *    it triggers a global logout and redirects the user to the login screen.
 */

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
