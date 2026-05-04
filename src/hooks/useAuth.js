import { useEffect } from 'react';
import { me } from '../api/auth.js';
import useAuthStore from '../store/authStore.js';

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
