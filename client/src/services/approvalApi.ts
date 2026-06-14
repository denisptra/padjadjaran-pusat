import api from './api';

export const approvalApi = {
  getAll: (params?: any) => api.get('/approvals', { params }),
  getById: (id: string) => api.get(`/approvals/${id}`),
  approve: (id: string) => api.patch(`/approvals/${id}/approve`),
  reject: (id: string, notes: string) => api.patch(`/approvals/${id}/reject`, { notes }),
  requestRevision: (id: string, notes: string) => api.patch(`/approvals/${id}/request-revision`, { notes }),
  close: (id: string, notes: string) => api.patch(`/approvals/${id}/close`, { notes }),
  
  // Payments
  getAllPayments: (params?: any) => api.get('/approvals/payments', { params }),
  verifyPayment: (id: string) => api.patch(`/approvals/payments/${id}/verify`),
  rejectPayment: (id: string, notes: string) => api.patch(`/approvals/payments/${id}/reject`, { notes }),
};
