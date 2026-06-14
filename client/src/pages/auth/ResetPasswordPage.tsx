import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleIcon } from '../../components/ui/Icons';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AuthLayout from '../../components/layout/AuthLayout';
import { authApi } from '@/features/auth/services/auth.service';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Konfirmasi sandi tidak cocok.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authApi.resetPassword({ email, token, newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal mengatur ulang kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout>
         <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">Tautan Tidak Valid</h1>
            <p className="text-gray-500">Tautan pemulihan kata sandi tidak valid atau telah kedaluwarsa.</p>
            <Button onClick={() => navigate('/forgot-password')} className="h-11 lg:h-10 text-[14px] lg:text-[13px] font-semibold">Minta Tautan Baru</Button>
         </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-8 animate-fade text-center lg:text-left">
        <div className="space-y-3">
          <h1 className="font-cinzel text-3xl font-semibold leading-tight tracking-wide text-gray-900 ">
            Atur Ulang Sandi
          </h1>
          <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
            Silakan buat kata sandi baru untuk akun <strong className="text-gray-900">{email}</strong>.
          </p>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-status-success/5 border border-status-success/20 text-center space-y-3">
               <div className="mx-auto w-12 h-12 bg-status-success/10 text-status-success rounded-full flex items-center justify-center mb-2">
                  <GoogleIcon name="check_circle" size={24} />
               </div>
               <h3 className="text-[14px] font-bold text-gray-900">Sandi Diperbarui!</h3>
               <p className="text-[12px] text-gray-600 font-medium">Kata sandi Anda berhasil diubah. Mengarahkan ke halaman masuk...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-status-danger/5 border border-status-danger/10 text-status-danger rounded-md text-[13px] font-medium flex items-center gap-3 animate-fade shadow-sm">
                <GoogleIcon name="error_outline" size={18} strokeWidth={2.5} /> {error}
              </div>
            )}

            <div className="space-y-6 text-left">
              <div className="relative group text-left">
                <Input
                  label="Kata Sandi Baru"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Buat sandi yang kuat"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
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
                label="Konfirmasi Kata Sandi"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ulangi sandi baru"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                required
                icon={<GoogleIcon name="shield" size={18} strokeWidth={2.5} />}
              />
            </div>

            <div className="pt-4">
               <Button type="submit" disabled={loading || !password || !confirmPassword} className="w-full h-11 lg:h-10 text-[14px] lg:text-[13px] font-semibold">
                  Simpan Sandi Baru <GoogleIcon name="save" size={16} />
               </Button>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
