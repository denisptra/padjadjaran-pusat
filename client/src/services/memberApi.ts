import api from './api';

export const memberApi = {
  getAll: (params?: any) => api.get('/members', { params }),
  getById: (id: string) => api.get(`/members/${id}`),
  create: (data: any) => api.post('/members', data),
  update: (id: string, data: any) => api.patch(`/members/${id}`, data),
  activate: (id: string) => api.patch(`/members/${id}/activate`),
  deactivate: (id: string) => api.patch(`/members/${id}/deactivate`),
  reject: (id: string) => api.post(`/members/${id}/reject`),
  changeRegion: (id: string, regionId: string) => api.patch(`/members/${id}/change-region`, { regionId }),
  assignAdminWilayah: (id: string, regionId: string) => api.patch(`/members/${id}/assign-admin-wilayah`, { regionId }),
  revokeAdminWilayah: (id: string) => api.patch(`/members/${id}/revoke-admin-wilayah`),
  bulkAction: (ids: string[], action: string) => api.post('/members/bulk-action', { ids, action }),
  uploadDocuments: (data: any) => api.post('/members/documents', data),
  updateProfile: (data: any) => api.patch('/members/profile', data),
};
