import api from './api';

export const departmentService = {
  async getDepartments() {
    return await api.get('/departments');
  },

  async getDepartmentById(id) {
    return await api.get(`/departments/${id}`);
  },

  async createDepartment(data) {
    return await api.post('/departments', data);
  },

  async updateDepartment(id, data) {
    return await api.put(`/departments/${id}`, data);
  },

  async deleteDepartment(id) {
    return await api.delete(`/departments/${id}`);
  }
};

export default departmentService;
