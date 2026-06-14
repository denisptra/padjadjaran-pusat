import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleIcon } from '../../components/ui/Icons';
import Button from '../../components/ui/Button';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuthStore } from '@/features/auth/stores/auth.store';

const VerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const { verifyOtp, resendOtp, user, isLoading, error, clearError } = useAuthStore();
  const [otpCode, setOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(60);

  const email = user?.email || sessionStorage.getItem('pending_verification_email') || '';

  useEffect(() => {
    let interval: any = null;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((p: number) => p - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) return;
    try {
      await verifyOtp({ email, otp: otpCode });
      sessionStorage.removeItem('pending_verification_email');
      navigate('/register/profile');
    } catch (err) {
      // Error handled by store
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await resendOtp({ email });
      setResendTimer(60);
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-10 animate-fade text-stone-900">
        <form onSubmit={handleVerify} className="space-y-10">
          <div className="space-y-3 text-center lg:text-left">
            <h1 className="font-cinzel text-3xl font-semibold leading-tight  tracking-normal text-gray-900">Verifikasi Akun</h1>
            <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
              Silakan masukkan 6-digit kode verifikasi yang telah dikirimkan ke <strong className="text-gray-900 font-medium tracking-tight underline decoration-primary/30 decoration-4 underline-offset-4">{email || 'email Anda'}</strong>.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-status-danger/5 border border-status-danger/10 text-status-danger rounded-md text-[13px] font-medium flex items-center gap-3 animate-fade shadow-sm">
              <GoogleIcon name="error_outline" size={18} strokeWidth={2.5} /> {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-[12px] font-medium text-gray-400 uppercase tracking-widest block text-center">Kode Verifikasi Rahasia</label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value.replace(/\D/g, ''));
                    if (error) clearError();
                  }}
                  placeholder="000000"
                  className="w-full h-16 rounded-2xl border border-gray-200 bg-gray-50/50 text-3xl font-medium font-mono tracking-[0.4em] text-center outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm placeholder:text-gray-200"
                  autoFocus
                />
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                disabled={resendTimer > 0 || isLoading}
                onClick={handleResend}
                className={`text-[11px] font-semibold uppercase tracking-wider border-0 bg-transparent cursor-pointer transition-all ${resendTimer > 0 ? 'text-gray-300' : 'text-primary hover:text-primary-dark'}`}
              >
                {resendTimer > 0 ? `Kirim ulang dalam ${resendTimer} detik` : 'Kirim ulang kode OTP'}
              </button>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center gap-4 border-t border-gray-100">
            <Button type="button" variant="white" size="md" onClick={() => navigate('/login')} className="w-full sm:w-auto h-11 lg:h-10 px-8 border-gray-200 font-semibold tracking-normal text-[14px] lg:text-[13px]">
              <GoogleIcon name="arrow_back" size={16} /> Batal
            </Button>
            <Button type="submit" size="md" disabled={isLoading || otpCode.length < 6} className="w-full h-11 lg:h-10 sm:flex-1 font-semibold tracking-normal text-[14px] lg:text-[13px]">
              Konfirmasi Kode <GoogleIcon name="arrow_forward" size={16} />
            </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default VerifyOtpPage;
