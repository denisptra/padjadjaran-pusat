import api from './api';

export const dashboardApi = {
  getSummary: (regionName?: string) => api.get('/dashboard/summary', { params: { regionName } }),
  getAdminPusatSummary: () => api.get('/dashboard/summary'),
  getAdminWilayahSummary: () => api.get('/dashboard/summary'),
  getSuperAdminSummary: () => api.get('/dashboard/summary'),
  getMemberSummary: () => api.get('/dashboard/summary'),
};
