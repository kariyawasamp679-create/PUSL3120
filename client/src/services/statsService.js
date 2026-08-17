import api from './api';

export const statsService = {
  async getAdminStats() {
    return await api.get('/stats/admin');
  },

  async getDoctorStats() {
    return await api.get('/stats/doctor');
  },

  async resetDatabase() {
    return await api.post('/stats/reset-db');
  }
};

export default statsService;

