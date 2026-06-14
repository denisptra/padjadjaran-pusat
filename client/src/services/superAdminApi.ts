import api from './api';

export const superAdminApi = {
  getUsers: (params?: any) => api.get('/super/users', { params }),
  activateUser: (id: string) => api.patch(`/super/users/${id}/activate`),
  deactivateUser: (id: string) => api.patch(`/super/users/${id}/deactivate`),
  
  getActionMatrix: () => api.get('/super/action-matrix'),
  updateActionMatrix: (data: any) => api.patch('/super/action-matrix', data),
  
  getFeatureControl: () => api.get('/super/feature-control'),
  updateFeatureControl: (key: string, data: any) => api.patch(`/super/feature-control/${key}`, data),
  
  startImpersonate: (id: string) => api.post('/super/impersonate/start', { userId: id }),
  stopImpersonate: () => api.post('/super/impersonate/stop'),
  
  getAuditLogs: (params?: any) => api.get('/super/audit-logs', { params }),
  
  getBackup: () => api.get('/super/backup'), // Placeholder in backend controller
  createBackup: () => api.post('/super/backup'), // Placeholder
  
  getPaymentSettings: () => api.get('/super/payment-settings'),
  updatePaymentSettings: (data: any) => api.patch('/super/payment-settings', data),

  getSystemSettings: () => api.get('/super/system-settings'), // Placeholder
  updateSystemSettings: (data: any) => api.patch('/super/system-settings', data), // Placeholder
};

