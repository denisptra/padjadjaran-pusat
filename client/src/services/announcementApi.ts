import api from './api';

export const announcementApi = {
  getAll: (params?: any) => api.get('/announcements', { params }),
  getById: (id: string) => api.get(`/announcements/${id}`),
  create: (data: any) => api.post('/announcements', data),
  update: (id: string, data: any) => api.patch(`/announcements/${id}`, data),
  delete: (id: string) => api.delete(`/announcements/${id}`),
  publish: (id: string) => api.patch(`/announcements/${id}/publish`),
  unpublish: (id: string) => api.patch(`/announcements/${id}/unpublish`),
  markAsRead: (id: string) => api.post(`/announcements/${id}/read`),
};
