import api from './api';

export const messageService = {
  async getMessages(appointmentId) {
    return await api.get(`/messages/appointment/${appointmentId}`);
  },

  async sendMessage(messageData) {
    return await api.post('/messages', messageData);
  }
};

export default messageService;
