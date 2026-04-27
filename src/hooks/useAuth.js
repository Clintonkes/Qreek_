import { useEffect } from 'react';
import { me } from '../api/auth.js';
import useAuthStore from '../store/authStore.js';

export function useAuth() {
  const { token, updateUser, logout } = useAuthStore();

  useEffect(() => {
    if (!token) return;
    me()
      .then(user => updateUser(user))
      .catch(() => logout());
  }, []);
}
