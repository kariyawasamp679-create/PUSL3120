import api from './api';

export const recordService = {
  async getRecords(params = {}) {
    const query = new URLSearchParams();
    if (params.patientId) query.append('patientId', params.patientId);
    if (params.doctorId) query.append('doctorId', params.doctorId);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await api.get(`/medical-records${queryString}`);
  },

  async getRecordById(id) {
    return await api.get(`/medical-records/${id}`);
  },

  async createRecord(recordData) {
    return await api.post('/medical-records', recordData);
  },

  async updateRecord(id, updates) {
    return await api.put(`/medical-records/${id}`, updates);
  },

  async getPatientHistory(patientId) {
    return await api.get(`/medical-records/patient/${patientId}`);
  }
};

export default recordService;
