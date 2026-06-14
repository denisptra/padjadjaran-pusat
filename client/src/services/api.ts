import axios from 'axios';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { toast } from '@/stores/toastStore';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh and data unwrapping
api.interceptors.response.use(
  (response) => {
    // Automatically unwrap data from NestJS ResponseInterceptor
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      const responseBody = response.data;
      if (Object.keys(responseBody).every(k => ['data', 'meta', 'message'].includes(k))) {
        const unwrapped = responseBody.data;
        if (unwrapped && typeof unwrapped === 'object' && !('data' in unwrapped)) {
          // Define a getter property 'data' pointing back to itself,
          // so that both res.data and res.data.data access the same payload.
          Object.defineProperty(unwrapped, 'data', {
            get() { return unwrapped; },
            configurable: true,
            enumerable: false
          });
        }
        response.data = unwrapped;
        if (responseBody.meta && response.data && typeof response.data === 'object') {
          (response.data as any).meta = responseBody.meta;
        }
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent redirect loop if the failure is on the refresh endpoint itself
    if (originalRequest.url?.includes('/auth/refresh')) {
       useAuthStore.getState().setAccessToken(null);
       return Promise.reject(error);
    }

    const isAuthPath = originalRequest.url?.includes('/auth/login') || 
                       originalRequest.url?.includes('/auth/register') || 
                       originalRequest.url?.includes('/auth/verify-otp') || 
                       originalRequest.url?.includes('/auth/resend-otp');

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Avoid loops or forceful redirects on initial profile check
      if (window.location.pathname === '/login' || originalRequest.url?.includes('/me')) {
          return Promise.reject(error);
      }

      // 1. Try to refresh token ONLY once if not already retrying
      if (!originalRequest._retry && !isAuthPath) {
        originalRequest._retry = true;
        
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
          const data = response.data?.data || response.data;
          
          if (data.accessToken) {
            useAuthStore.getState().setAccessToken(data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, session is truly dead
          useAuthStore.getState().logout();
          window.location.href = '/login'; 
          return Promise.reject(refreshError);
        }
      } else {
        // 2. If it's already a retry or an auth path, just logout and redirect
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    // Global Error Handling for UI Feedback
    const errorMessage = error.response?.data?.message || 'Terjadi kesalahan pada sistem.';
    
    if (error.response?.status === 403) {
      toast.error('Anda tidak memiliki akses untuk tindakan ini.');
    } else if (error.response?.status >= 500) {
      toast.error('Gagal terhubung ke server. Silakan coba beberapa saat lagi.');
    } else if (error.code === 'ECONNABORTED' || !error.response) {
      toast.error('Koneksi terputus. Periksa jaringan internet Anda.');
    }

    return Promise.reject(error);
  }
);

export const getSecureFileUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.includes('/uploads/secure/')) {
    const filename = path.split('/').pop();
    return `${API_URL}/files/secure/${filename}`;
  }
  return `${API_URL}${path}`;
};

export default api;


