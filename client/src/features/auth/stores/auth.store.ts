import { create } from 'zustand';
import { authApi } from '../services/auth.service';
import api from '../../../services/api';
import { compressImage } from '../../../utils/compress';

export enum AuthState {
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  PROFILE_INCOMPLETE = 'PROFILE_INCOMPLETE',
  WAITING_APPROVAL = 'WAITING_APPROVAL',
  REVISION_REQUIRED = 'REVISION_REQUIRED',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  INACTIVE = 'INACTIVE',
}

export interface User {
  id: string;
  fullName?: string;
  email: string;
  role: string;
  state?: AuthState;
  status?: string;
  displayStatus?: string;
  registrationStep?: number;
  isApproved?: boolean;
  avatarUrl?: string;
  recommendationUrl?: string;
  documentUrl?: string;
  nik?: string;
  phone?: string;
  gender?: string;
  birthPlace?: string;
  birthDate?: string;
  address?: string;
  regionId?: string;
  region?: any;
  ktaNumber?: string;
  memberType?: string;
}

export interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  originalUser: User | null;
  isImpersonating: boolean;
  role: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  verifyOtp: (data: { email: string, otp: string } | string) => Promise<any>;
  resendOtp: (data: { email: string }) => Promise<any>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<any>;
  uploadDocuments: (data: any) => Promise<any>;
  submitPayment: (data: any) => Promise<any>;
  setRole: (role: string) => void;
  setAccessToken: (token: string | null) => void;
  startImpersonate: (user: any) => void;
  stopImpersonate: () => Promise<void>;
  
  // Helpers
  clearError: () => void;
  resetInactivityTimer: () => void;
}

const extractErrorMsg = (err: any) => {
  const status = err.response?.status;
  const message = err.response?.data?.message;
  if (message) {
    if (message.includes('not found') || message.includes('tidak ditemukan')) return 'Email tidak terdaftar dalam sistem kami.';
    if (message.includes('invalid credentials') || message.includes('salah')) return 'Email atau kata sandi yang Anda masukkan salah.';
    if (message.includes('inactive') || message.includes('nonaktif')) return 'Akun Anda sedang dinonaktifkan. Silakan hubungi admin.';
    if (message.includes('already exists') || message.includes('sudah digunakan')) return 'Email ini sudah terdaftar. Silakan gunakan email lain.';
    return message;
  }
  if (status === 404) return 'Email tidak ditemukan.';
  if (status === 401) return 'Email atau kata sandi salah.';
  if (status === 403) return 'Akses ditolak. Akun Anda mungkin belum aktif.';
  if (status >= 500) return 'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.';
  return 'Terjadi kesalahan tidak terduga.';
};

const getInitialUser = (): User | null => {
  try {
    const saved = sessionStorage.getItem('pps_auth_user');
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
};

const getInitialOriginalUser = (): User | null => {
  try {
    const saved = sessionStorage.getItem('pps_original_user');
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
};

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export const useAuthStore = create<AuthStore>((set, get) => {
  let inactivityTimer: NodeJS.Timeout;

  const resetInactivityTimer = () => {
    if (typeof window !== 'undefined') {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (get().user) {
          get().logout();
          window.location.href = '/login';
        }
      }, INACTIVITY_TIMEOUT);
    }
  };

  if (typeof window !== 'undefined') {
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      window.addEventListener(event, resetInactivityTimer);
    });
    resetInactivityTimer();
  }

  return {
    user: getInitialUser(),
    accessToken: null,
    isLoading: false,
    isInitialized: false,
    error: null,
    originalUser: getInitialOriginalUser(),
    isImpersonating: !!getInitialOriginalUser(),
    role: getInitialUser()?.role || null,

    resetInactivityTimer,

    setAccessToken: (token) => set({ accessToken: token }),
    setRole: (role) => set({ role }),
    clearError: () => set({ error: null }),

    startImpersonate: (impersonatedUser) => {
        const currentUser = get().user;
        if (!currentUser) return;
        if (!get().originalUser) {
          sessionStorage.setItem('pps_original_user', JSON.stringify(currentUser));
          set({ originalUser: currentUser, isImpersonating: true });
        }
        sessionStorage.setItem('pps_auth_user', JSON.stringify(impersonatedUser));
        set({ user: impersonatedUser, role: impersonatedUser.role });
    },

    stopImpersonate: async () => {
        const originalUser = get().originalUser;
        if (originalUser) {
          sessionStorage.removeItem('pps_original_user');
          sessionStorage.setItem('pps_auth_user', JSON.stringify(originalUser));
          set({ user: originalUser, role: originalUser.role, originalUser: null, isImpersonating: false });
          try {
            const { superAdminApi } = await import('@/services/superAdminApi');
            await superAdminApi.stopImpersonate();
          } catch (err) {}
        }
    },

    login: async (email, password) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authApi.login({ email, password });
        const data = response.data?.data || response.data;
        if (data.accessToken) set({ accessToken: data.accessToken });
        const activeUser = { ...data.user, state: data.state, registrationStep: data.registrationStep || 0 };
        sessionStorage.setItem('pps_auth_user', JSON.stringify(activeUser));
        set({ user: activeUser, role: activeUser.role, isLoading: false });
        if (data.state === 'ACTIVE') await get().fetchProfile();
        return data;
      } catch (err: any) {
        set({ error: extractErrorMsg(err), isLoading: false });
        throw err;
      }
    },

    register: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authApi.register(data);
        const resData = response.data?.data || response.data;
        if (resData.accessToken) set({ accessToken: resData.accessToken });
        const activeUser = { ...resData.user, state: resData.state, registrationStep: resData.registrationStep || 0 };
        sessionStorage.setItem('pps_auth_user', JSON.stringify(activeUser));
        set({ user: activeUser, role: activeUser.role, isLoading: false });
        return resData;
      } catch (err: any) {
        set({ error: extractErrorMsg(err), isLoading: false });
        throw err;
      }
    },

    verifyOtp: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const payload: any = typeof data === 'string' ? { email: get().user?.email, otp: data } : data;
        const response = await authApi.verifyOtp(payload);
        const resData = response.data?.data || response.data;
        if (resData.accessToken) set({ accessToken: resData.accessToken });
        await get().fetchProfile();
        return resData;
      } catch (err: any) {
        set({ error: extractErrorMsg(err), isLoading: false });
        throw err;
      }
    },

    resendOtp: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authApi.resendOtp({ email: data?.email || get().user?.email || '' });
        set({ isLoading: false });
        return response.data;
      } catch (err: any) {
        set({ error: extractErrorMsg(err), isLoading: false });
        throw err;
      }
    },

    fetchProfile: async () => {
      if (get().isImpersonating) { set({ isLoading: false, isInitialized: true }); return; }
      
      const token = get().accessToken;
      if (!token) {
        set({ user: null, role: null, isLoading: false, isInitialized: true });
        return;
      }

      set({ isLoading: true });
      try {
        const response = await authApi.getProfile();
        const userData = response.data?.data || response.data;
        sessionStorage.setItem('pps_auth_user', JSON.stringify(userData));
        set({ user: userData, role: userData.role, isLoading: false, isInitialized: true });
      } catch (err) {
        sessionStorage.removeItem('pps_auth_user');
        set({ user: null, role: null, accessToken: null, isLoading: false, isInitialized: true });
      }
    },

    logout: async () => {
      clearTimeout(inactivityTimer);
      set({ isLoading: true });
      try { await authApi.logout(); } catch {}
      sessionStorage.removeItem('pps_auth_user');
      sessionStorage.removeItem('pps_original_user');
      set({ user: null, accessToken: null, role: null, originalUser: null, isImpersonating: false, isLoading: false, error: null });
    },

    updateProfile: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authApi.updateProfile(data);
        await get().fetchProfile();
        return response.data;
      } catch (err: any) {
        set({ error: extractErrorMsg(err), isLoading: false });
        throw err;
      }
    },

    uploadDocuments: async (data) => {
      set({ isLoading: true, error: null });
      try {
        let photoUrl = get().user?.avatarUrl || (get().user as any)?.photoUrl || null;
        if (data.photo) {
          const photoFormData = new FormData();
          photoFormData.append('file', await compressImage(data.photo, 800, 800, 0.7));
          const photoRes = await api.post('/files/upload', photoFormData, { headers: { 'Content-Type': 'multipart/form-data' } });
          photoUrl = photoRes.data.url;
        }

        let documentUrl = get().user?.recommendationUrl || (get().user as any)?.documentUrl || null;
        if (data.recommendation) {
          const recFormData = new FormData();
          recFormData.append('file', await compressImage(data.recommendation, 1200, 1200, 0.7));
          const recRes = await api.post('/files/upload', recFormData, { headers: { 'Content-Type': 'multipart/form-data' } });
          documentUrl = recRes.data.url;
        }

        await api.post('/members/documents', { photoUrl, documentUrl });
        await get().fetchProfile();
        set({ isLoading: false });
        return {};
      } catch (err: any) {
        set({ error: extractErrorMsg(err), isLoading: false });
        throw err;
      }
    },

    submitPayment: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const formData = new FormData();
        formData.append('file', data.proof);
        const uploadRes = await api.post('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        await api.post('/payments/confirm', { amount: 50000, proofUrl: uploadRes.data.url, notes: 'Konfirmasi' });
        await get().fetchProfile();
        set({ isLoading: false });
        return {};
      } catch (err: any) {
        set({ error: extractErrorMsg(err), isLoading: false });
        throw err;
      }
    },
  };
});
