import api from './api';

export const appointmentService = {
  async createAppointment(appointmentData) {
    return await api.post('/appointments', appointmentData);
  },

  async getAppointments(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.date) query.append('date', params.date);
    if (params.doctorId) query.append('doctorId', params.doctorId);
    if (params.patientId) query.append('patientId', params.patientId);
    if (params.departmentId) query.append('departmentId', params.departmentId);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await api.get(`/appointments${queryString}`);
  },

  async getAppointmentById(id) {
    return await api.get(`/appointments/${id}`);
  },

  async updateStatus(id, statusData) {
    return await api.patch(`/appointments/${id}/status`, statusData);
  },

  async reschedule(id, rescheduleData) {
    return await api.patch(`/appointments/${id}/reschedule`, rescheduleData);
  },

  async getAvailableSlots(doctorId, date) {
    return await api.get(`/appointments/available-slots?doctorId=${doctorId}&date=${date}`);
  }
};

export default appointmentService;
