import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleIcon } from '../../components/ui/Icons';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import AuthLayout from '../../components/layout/AuthLayout';
import { ROUTES } from '../../config/routes';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  const validateForm = () => {
    const errors: { email?: string; password?: string; confirmPassword?: string } = {};
    if (!email) {
      errors.email = 'Alamat email wajib diisi.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Format email tidak valid.';
    }
    
    if (!password) {
      errors.password = 'Kata sandi wajib diisi.';
    } else if (password.length < 8) {
      errors.password = 'Kata sandi minimal 8 karakter.';
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Konfirmasi sandi tidak cocok.';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      await register({ email, password });
      sessionStorage.setItem('pending_verification_email', email);
      navigate(ROUTES.AUTH.VERIFY_OTP);
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-10 animate-fade">
        <div className="space-y-3 text-center lg:text-left">
          <h1 className="font-cinzel text-3xl font-semibold leading-tight tracking-wide text-gray-900 ">
            Daftar Akun Baru
          </h1>
          <div className="flex items-center justify-between gap-4 pt-2">
            <p className="text-[11px] font-medium text-primary  tracking-normal">Langkah 01 / 03</p>
            <span className="text-[11px] font-medium text-gray-400 italic">Informasi Akun</span>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: '33%' }} />
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-8">
          {error && (
            <div className="p-4 bg-status-danger/5 border border-status-danger/10 text-status-danger rounded-md text-[13px] font-medium flex items-center gap-3 animate-fade shadow-sm">
              <GoogleIcon name={error.includes('sudah terdaftar') ? 'person_add_disabled' : 'error_outline'} size={18} strokeWidth={2.5} /> {error}
            </div>
          )}

          <div className="space-y-6 text-left">
            <Input
              label="Alamat Email *"
              type="email"
              placeholder="member@domain.com"
              value={email}
              onChange={(e) => { 
                setEmail(e.target.value); 
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                if (error) clearError(); 
              }}
              error={fieldErrors.email}
              required
              icon={<GoogleIcon name="mail" size={18} strokeWidth={2.5} />}
            />

            <div className="relative group text-left">
              <Input
                label="Kata Sandi *"
                type={showPassword ? 'text' : 'password'}
                placeholder="Buat sandi yang kuat"
                value={password}
                onChange={(e) => { 
                  setPassword(e.target.value); 
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                  if (error) clearError(); 
                }}
                error={fieldErrors.password}
                required
                icon={<GoogleIcon name="lock" size={18} strokeWidth={2.5} />}
                helper="Minimal 8 karakter."
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[32px] p-2 text-gray-300 hover:text-gray-500 bg-transparent border-0 cursor-pointer transition-colors"
              >
                <GoogleIcon name={showPassword ? 'visibility_off' : 'visibility'} size={18} strokeWidth={2} />
              </button>
            </div>

            <Input
              label="Konfirmasi Kata Sandi *"
              type={showPassword ? 'text' : 'password'}
              placeholder="Ulangi sandi"
              value={confirmPassword}
              onChange={(e) => { 
                setConfirmPassword(e.target.value); 
                if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: undefined });
                if (error) clearError(); 
              }}
              error={fieldErrors.confirmPassword}
              required
              icon={<GoogleIcon name="shield" size={18} strokeWidth={2.5} />}
            />

            <label className="flex items-start gap-3.5 text-gray-500 font-medium text-[13px] leading-relaxed pt-2 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="rounded-md border-gray-300 text-primary focus:ring-primary/20 h-5 w-5 mt-0.5 transition-all cursor-pointer"
                required
              />
              <span className="group-hover:text-gray-700 transition-colors">Saya menyetujui seluruh <Link to="/syarat-ketentuan" className="text-primary font-medium hover:underline underline-offset-4">Syarat & Ketentuan</Link> serta Kebijakan Privasi perguruan.</span>
            </label>
          </div>

          <div className="pt-8 flex flex-col gap-5 border-t border-gray-100">
            <Button
              type="submit"
              size="md"
              disabled={isLoading || !acceptTerms}
              className="w-full h-11 lg:h-10 text-[14px] lg:text-[13px] font-semibold"
            >
              Daftarkan Akun <GoogleIcon name="arrow_forward" size={16} />
            </Button>
            <p className="text-center text-[13px] text-gray-500 font-normal">
              Sudah memiliki akun?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline underline-offset-4">Masuk Portal</Link>
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
