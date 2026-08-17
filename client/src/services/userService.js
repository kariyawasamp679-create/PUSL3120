import api from './api';

export const userService = {
  async getDoctors(params = {}) {
    const query = new URLSearchParams();
    if (params.department) query.append('department', params.department);
    if (params.search) query.append('search', params.search);
    if (params.isAvailable !== undefined) query.append('isAvailable', params.isAvailable);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await api.get(`/users/doctors${queryString}`);
  },

  async getDoctorById(id) {
    return await api.get(`/users/doctors/${id}`);
  },

  async getAllUsers(params = {}) {
    const query = new URLSearchParams();
    if (params.role) query.append('role', params.role);
    if (params.search) query.append('search', params.search);
    if (params.department) query.append('department', params.department);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await api.get(`/users${queryString}`);
  },

  async createDoctor(doctorData) {
    return await api.post('/users/doctors', doctorData);
  },

  async updateUser(id, userData) {
    return await api.put(`/users/${id}`, userData);
  },

  async deleteUser(id) {
    return await api.delete(`/users/${id}`);
  }
};

export default userService;
