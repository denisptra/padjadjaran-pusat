import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleIcon } from '../../components/ui/Icons';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AuthLayout from '../../components/layout/AuthLayout';
import { authApi } from '@/features/auth/services/auth.service';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword({ email });
      setSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal mengirim tautan reset.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-8 animate-fade text-center lg:text-left">
        <div className="space-y-3">
          <h1 className="font-cinzel text-3xl font-semibold leading-tight tracking-wide text-gray-900 ">
            Lupa Kata Sandi
          </h1>
          <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
            Masukkan alamat email yang terdaftar. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-status-danger/5 border border-status-danger/10 text-status-danger rounded-xl text-[13px] font-medium flex items-center gap-3 animate-fade shadow-sm">
            <GoogleIcon name="person_off" size={18} strokeWidth={2.5} /> {error}
          </div>
        )}

        {success ? (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-status-success/5 border border-status-success/20 text-center space-y-3">
               <div className="mx-auto w-12 h-12 bg-status-success/10 text-status-success rounded-full flex items-center justify-center mb-2">
                  <GoogleIcon name="mark_email_read" size={24} />
               </div>
               <h3 className="text-[14px] font-bold text-gray-900">Email Terkirim!</h3>
               <p className="text-[12px] text-gray-600 font-medium">Jika email <strong className="text-gray-900">{email}</strong> terdaftar dalam sistem kami, Anda akan menerima tautan pemulihan sesaat lagi.</p>
            </div>
            <Button type="button" onClick={() => navigate('/login')} className="w-full h-11 lg:h-10 text-[14px] lg:text-[13px] font-semibold">
               Kembali ke Halaman Masuk
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-left">
              <Input
                label="Alamat Email"
                type="email"
                placeholder="member@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<GoogleIcon name="mail" size={18} strokeWidth={2.5} />}
              />
            </div>

            <div className="pt-4 flex flex-col gap-4">
               <Button type="submit" disabled={loading || !email} className="w-full h-11 lg:h-10 text-[14px] lg:text-[13px] font-semibold">
                  Kirim Tautan Pemulihan <GoogleIcon name="send" size={16} />
               </Button>
               <Link to="/login" className="text-[13px] text-primary font-semibold hover:underline text-center">
                  Batal dan kembali ke Login
               </Link>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
