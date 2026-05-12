import { useEffect } from 'react';
import { me } from '../api/auth.js';
import useAuthStore from '../store/authStore.js';

/**
 * Custom hook for managing the authentication lifecycle.
 * - Synchronizes the local user state with the server on mount if a token exists.
 * - Monitors user activity (clicks, keydowns, etc.) to keep the session alive.
 * - Periodically checks for session expiration and logs the user out if idle too long.
 */
export function useAuth() {
  const { token, updateUser, logout, touchSession, validateSession } = useAuthStore();

  useEffect(() => {
    if (!token) return;
    if (!validateSession()) return;

    me()
      .then(user => updateUser(user))
      .catch(() => logout());
  }, [token, updateUser, logout, validateSession]);

  useEffect(() => {
    if (!token) return undefined;

    const trackActivity = () => {
      if (validateSession()) touchSession();
    };

    const checkIdleSession = () => {
      if (!validateSession()) logout();
    };

    const activityEvents = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];
    activityEvents.forEach(eventName => {
      window.addEventListener(eventName, trackActivity, { passive: true });
    });

    document.addEventListener('visibilitychange', checkIdleSession);
    const idleCheck = window.setInterval(checkIdleSession, 60 * 1000);

    return () => {
      activityEvents.forEach(eventName => {
        window.removeEventListener(eventName, trackActivity);
      });
      document.removeEventListener('visibilitychange', checkIdleSession);
      window.clearInterval(idleCheck);
    };
  }, [token, touchSession, validateSession, logout]);
}
