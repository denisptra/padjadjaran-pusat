import api from './api';

export const paymentApi = {
  getAll: (params?: any) => api.get('/payments', { params }),
  verify: (id: string) => api.patch(`/payments/${id}/verify`),
  reject: (id: string, notes: string) => api.patch(`/payments/${id}/reject`, { notes }),
};
