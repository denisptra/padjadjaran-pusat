import api from './api';

export const paymentSettingsApi = {
  getAll: (params?: any) => api.get('/payment-settings', { params }),
  update: (id: string, data: any) => api.patch(`/payment-settings/${id}`, data),
};
