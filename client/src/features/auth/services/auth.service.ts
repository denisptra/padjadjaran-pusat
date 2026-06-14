import api from '@/services/api';

export const authApi = {
  // 1. Initial Registration
  register: (data: any) => api.post('/auth/register', data),
  
  // 2. OTP Verification (Manual input)
  verifyOtp: (data: { email: string; otp: string }) => api.post('/auth/verify-otp', data),
  
  // 3. Resend OTP
  resendOtp: (data: { email: string }) => api.post('/auth/resend-otp', data),
  
  // 4. Standard Login
  login: (data: any) => api.post('/auth/login', data),
  
  // 5. Token Refresh (Cookie-based)
  refresh: () => api.post('/auth/refresh'),
  
  // 6. Logout (Clears cookies)
  logout: () => api.post('/auth/logout'),
  
  // 7. Get Current User Sync (The most critical endpoint)
  getProfile: () => api.get('/me'),
  
  // 8. Update Profile Data (Advances registrationStep)
  updateProfile: (data: any) => api.patch('/members/profile', data),
  
  // 9. Password Management
  forgotPassword: (data: { email: string }) => api.post('/auth/forgot-password', data),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
  updatePassword: (data: any) => api.patch('/me/password', data),

  // 10. Global Settings for Registration
  getPaymentSettings: () => api.get('/auth/payment-settings'),
};

export default authApi;
