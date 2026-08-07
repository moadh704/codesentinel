import { defineStore } from 'pinia';
import axios from '@/lib/axios';

function loadUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: loadUser(),
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },

  actions: {
    async login({ email, password }) {
      this.loading = true;
      try {
        const { data } = await axios.post('/api/auth/login', { email, password });
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
      } finally {
        this.loading = false;
      }
    },

    async register({ name, email, password }) {
      this.loading = true;
      try {
        const { data } = await axios.post('/api/auth/register', {
          name,
          email,
          password,
        });
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
      } finally {
        this.loading = false;
      }
    },

    async fetchMe() {
      if (!this.token) return null;
      const { data } = await axios.get('/api/auth/me');
      this.user = data.user || data;
      localStorage.setItem('user', JSON.stringify(this.user));
      return this.user;
    },

    async changePassword({ currentPassword, newPassword }) {
      const { data } = await axios.put('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return data;
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});
