import api from './api';

export const publicApi = {
  getHeroSliders: () => api.get('/public/hero-sliders'),
  getGuruBesar: () => api.get('/public/guru-besar'),
  getNews: () => api.get('/cms/publications', { params: { isPublished: true } }), // Refactored to unified publications
  getArticles: () => api.get('/cms/publications', { params: { isPublished: true } }),
  getGallery: () => api.get('/public/gallery'),
  getCmsAll: () => api.get('/public/cms-all'),
  getRegions: () => api.get('/public/regions'),
  getProvinces: () => api.get('/public/provinces'),
  getPaymentSettings: () => api.get('/public/payment-settings'),
  verifyMember: (ktaNumber: string) => api.get(`/public/verify-member/${ktaNumber}`),
};

export default publicApi;
