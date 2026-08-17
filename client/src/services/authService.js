import api from './api';

export const authService = {
  async register(userData) {
    const res = await api.post('/auth/register', userData);
    if (res.token) {
      localStorage.setItem('medipulse_token', res.token);
      localStorage.setItem('medipulse_user', JSON.stringify(res.user));
    }
    return res;
  },

  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    if (res.token) {
      localStorage.setItem('medipulse_token', res.token);
      localStorage.setItem('medipulse_user', JSON.stringify(res.user));
    }
    return res;
  },

  async getMe() {
    return await api.get('/auth/me');
  },

  async updateProfile(updates) {
    const res = await api.put('/auth/profile', updates);
    if (res.user) {
      localStorage.setItem('medipulse_user', JSON.stringify(res.user));
    }
    return res;
  },

  logout() {
    localStorage.removeItem('medipulse_token');
    localStorage.removeItem('medipulse_user');
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem('medipulse_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('medipulse_token');
  }
};

export default authService;
