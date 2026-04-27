import { create } from 'zustand';

const stored = (() => {
  try {
    const token = localStorage.getItem('qreek_token');
    const user  = JSON.parse(localStorage.getItem('qreek_user') || 'null');
    return { token, user };
  } catch { return { token: null, user: null }; }
})();

const useAuthStore = create(set => ({
  token:           stored.token,
  user:            stored.user,
  isAuthenticated: !!stored.token,

  setAuth: ({ token, user }) => {
    localStorage.setItem('qreek_token', token);
    localStorage.setItem('qreek_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  updateUser: (user) => {
    localStorage.setItem('qreek_user', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('qreek_token');
    localStorage.removeItem('qreek_user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
