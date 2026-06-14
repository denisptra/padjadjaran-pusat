import api from './api';

export const regionApi = {
  getProvinces: () => api.get('/regions/provinces'),
  createProvince: (data: any) => api.post('/regions/provinces', data),
  updateProvince: (id: string, data: any) => api.patch(`/regions/provinces/${id}`, data),
  deleteProvince: (id: string) => api.delete(`/regions/provinces/${id}`),
  getList: (provinceId?: string) => api.get('/regions/list', { params: { provinceId } }),
  getAll: (params?: any) => api.get('/regions', { params }),
  getById: (id: string) => api.get(`/regions/${id}`),
  create: (data: any) => api.post('/regions', data),
  update: (id: string, data: any) => api.patch(`/regions/${id}`, data),
  activate: (id: string) => api.patch(`/regions/${id}/activate`),
  deactivate: (id: string) => api.patch(`/regions/${id}/deactivate`),
  remove: (id: string) => api.delete(`/regions/${id}`),
  bulkAction: (ids: string[], action: string) => api.post('/regions/bulk-action', { ids, action }),
  assignAdmin: (id: string, adminId: string) => api.patch(`/regions/${id}/assign-admin`, { adminId }),
  getProfile: () => api.get('/regions/profile'),
  updateProfile: (data: any) => api.patch('/regions/profile', data),
  getMembers: () => api.get('/region-members'),
};
