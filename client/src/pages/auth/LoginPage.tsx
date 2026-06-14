import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { GoogleIcon } from '../../components/ui/Icons';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import AuthLayout from '../../components/layout/AuthLayout';
import { getAuthRedirectPath } from '../../utils/authRedirect';
import { cn } from '../../utils/cn';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    // Handle messages passed through navigation state (e.g. from logout or session expiry)
    if (location.state?.message) {
      setInfoMessage(location.state.message);
    }
  }, [location]);

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email) {
      errors.email = 'Alamat email wajib diisi.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Format email tidak valid.';
    }
    
    if (!password) {
      errors.password = 'Kata sandi wajib diisi.';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setInfoMessage(null);
    try {
      const res = await login(email, password);
      navigate(getAuthRedirectPath(res.user));
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-8 animate-fade">
        <div className="space-y-2 text-center lg:text-left">
          <h1 className="font-cinzel text-3xl font-semibold leading-tight tracking-wide text-gray-900 ">
            Masuk Portal
          </h1>
          <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
            Silakan masukkan kredensial resmi Anda untuk mengakses akun Anggota.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {infoMessage && !error && (
            <div className="p-4 bg-primary/5 border border-primary/10 text-primary-dark rounded-md text-[13px] font-medium flex items-center gap-3 animate-fade shadow-sm">
              <GoogleIcon name="info" size={18} strokeWidth={2.5} /> {infoMessage}
            </div>
          )}

          {error && (
            <div className="p-4 bg-status-danger/5 border border-status-danger/10 text-status-danger rounded-md text-[13px] font-medium flex items-center gap-3 animate-fade shadow-sm">
              <GoogleIcon name={error.includes('tidak terdaftar') ? 'person_off' : 'error_outline'} size={18} strokeWidth={2.5} /> {error}
            </div>
          )}

          <div className="space-y-5 text-left">
            <Input
              label="Alamat Email *"
              type="email"
              placeholder="member@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
              }}
              error={fieldErrors.email}
              required
              icon={<GoogleIcon name="mail" size={16} strokeWidth={2.5} />}
            />

            <div className="relative group text-left">
              <Input
                label="Kata sandi *"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan sandi Anda"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                }}
                error={fieldErrors.password}
                required
                icon={<GoogleIcon name="lock" size={16} strokeWidth={2.5} />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  "absolute right-3 top-[32px] p-2 text-gray-300 hover:text-gray-500 bg-transparent border-0 cursor-pointer transition-colors",
                  fieldErrors.password && "top-[32px]" // Adjust position if there is an error
                )}
              >
                <GoogleIcon name={showPassword ? 'visibility_off' : 'visibility'} size={18} strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[13px] pt-1">
            <label className="flex items-center gap-2.5 text-gray-600 font-medium cursor-pointer select-none group">
              <input
                type="checkbox"
                className="rounded-md border-gray-300 text-primary focus:ring-primary/20 h-4.5 w-4.5 transition-all cursor-pointer"
              />
              <span className="group-hover:text-gray-900 transition-colors">Ingat saya</span>
            </label>
            <Link to="/forgot-password"  className="text-primary font-medium text-[13px] hover:underline">
              Lupa sandi?
            </Link>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              size="md"
              disabled={isLoading}
              className="w-full h-11 lg:h-10 text-[14px] lg:text-[13px] font-semibold"
            >
              Masuk Sekarang <GoogleIcon name="arrow_forward" size={16} />
            </Button>
          </div>
        </form>

        <p className="text-center text-[13px] text-gray-500 font-normal pt-1 animate-fade">
          Belum memiliki akun?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline underline-offset-4">
            Daftar Akun Baru
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
