import api from './api';

export const cmsApi = {
  // Hero Sliders
  getHeroSliders: (params?: any) => api.get('/cms/hero-sliders', { params }),
  getHeroSliderById: (id: string) => api.get(`/cms/hero-sliders/${id}`),
  createHeroSlider: (data: any) => api.post('/cms/hero-sliders', data),
  updateHeroSlider: (id: string, data: any) => api.patch(`/cms/hero-sliders/${id}`, data),
  deleteHeroSlider: (id: string) => api.delete(`/cms/hero-sliders/${id}`),
  bulkActionSlider: (ids: string[], action: string) => api.post('/cms/hero-sliders/bulk-action', { ids, action }),

  // Guru Besar
  getGuruBesar: (params?: any) => api.get('/cms/guru-besar', { params }),
  getGuruBesarById: (id: string) => api.get(`/cms/guru-besar/${id}`),
  createGuruBesar: (data: any) => api.post('/cms/guru-besar', data),
  updateGuruBesar: (id: string, data: any) => api.patch(`/cms/guru-besar/${id}`, data),
  deleteGuruBesar: (id: string) => api.delete(`/cms/guru-besar/${id}`),
  bulkActionGuruBesar: (ids: string[], action: string) => api.post('/cms/guru-besar/bulk-action', { ids, action }),

  // Payment Settings
  getPaymentSettings: () => api.get('/cms/payment-settings'),
  updatePaymentSettings: (data: any) => api.put('/cms/payment-settings', data),

  // Publications (Unified News & Articles)
  getPublications: (params?: any) => api.get('/cms/publications', { params }),
  getPublicationById: (id: string) => api.get(`/cms/publications/${id}`),
  recordPublicationView: (id: string, sessionId: string) => api.post(`/cms/publications/${id}/record-view`, { sessionId }),
  createPublication: (data: any) => api.post('/cms/publications', data),
  updatePublication: (id: string, data: any) => api.patch(`/cms/publications/${id}`, data),
  deletePublication: (id: string) => api.delete(`/cms/publications/${id}`),
  bulkActionPublication: (ids: string[], action: string) => api.post('/cms/publications/bulk-action', { ids, action }),

  // Backwards compatibility aliases (optional but helpful for transition)
  getArticles: (params?: any) => api.get('/cms/publications', { params: { ...params, type: 'ARTIKEL' } }),
  getNews: (params?: any) => api.get('/cms/publications', { params: { ...params, type: 'BERITA' } }),
  createArticle: (data: any) => api.post('/cms/publications', { ...data, type: 'ARTIKEL' }),
  createNews: (data: any) => api.post('/cms/publications', { ...data, type: 'BERITA' }),
  updateArticle: (id: string, data: any) => api.patch(`/cms/publications/${id}`, data),
  updateNews: (id: string, data: any) => api.patch(`/cms/publications/${id}`, data),
  deleteArticle: (id: string) => api.delete(`/cms/publications/${id}`),
  deleteNews: (id: string) => api.delete(`/cms/publications/${id}`),

  // Gallery
  getGallery: (params?: any) => api.get('/cms/gallery', { params }),
  getGalleryById: (id: string) => api.get(`/cms/gallery/${id}`),
  createGallery: (data: any) => api.post('/cms/gallery', data),
  updateGallery: (id: string, data: any) => api.patch(`/cms/gallery/${id}`, data),
  deleteGallery: (id: string) => api.delete(`/cms/gallery/${id}`),
  bulkActionGallery: (ids: string[], action: string) => api.post('/cms/gallery/bulk-action', { ids, action }),

  // Public
  getPublicAll: () => api.get('/cms/public-all'),
};

export default cmsApi;
