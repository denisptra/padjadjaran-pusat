import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { cn } from '../../utils/cn';
import { 
  Lock, 
  Mail, 
  Shield, 
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Send
} from 'lucide-react';
import { authApi } from '@/features/auth/services/auth.service';
import { toast } from '../../stores/toastStore';

const SettingsPage: React.FC = () => {
  const { user, fetchProfile } = useAuthStore();
  
  // States for Password
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState('');
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });
  const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });

  // States for Email
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Password Logic
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);

    if (!passData.old || !passData.new || !passData.confirm) {
      setPassError('Seluruh field password wajib diisi.');
      return;
    }
    if (passData.new.length < 8) {
      setPassError('Password baru minimal 8 karakter.');
      return;
    }
    if (passData.new !== passData.confirm) {
      setPassError('Konfirmasi password tidak sama.');
      return;
    }
    if (passData.new === passData.old) {
      setPassError('Password baru tidak boleh sama dengan password lama.');
      return;
    }

    setPassLoading(true);
    try {
      await (authApi as any).updatePassword({
        oldPassword: passData.old,
        newPassword: passData.new
      });
      setPassSuccess(true);
      setPassData({ old: '', new: '', confirm: '' });
      toast.success('Kata sandi baru Anda telah berhasil diperbarui.');
      setTimeout(() => setPassSuccess(false), 3000);
    } catch (err: any) {
      setPassError(err.response?.data?.message || 'Gagal memperbarui kata sandi.');
    } finally {
      setPassLoading(false);
    }
  };

  // Email Logic
  const handleSendOtp = async () => {
    setEmailError('');
    if (!newEmail) {
      setEmailError('Email baru wajib diisi.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      setEmailError('Format email tidak valid.');
      return;
    }
    if (newEmail === user?.email) {
      setEmailError('Email baru tidak boleh sama dengan email saat ini.');
      return;
    }

    setEmailLoading(true);
    try {
      await (authApi as any).requestEmailChange(newEmail);
      setOtpSent(true);
      toast.success('Kode OTP telah dikirim ke email baru Anda.');
    } catch (err: any) {
      setEmailError(err.response?.data?.message || 'Gagal mengirim OTP.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    
    if (!otpCode) {
      setEmailError('Masukkan kode OTP.');
      return;
    }

    setEmailLoading(true);
    try {
      await (authApi as any).verifyEmailChange({ email: newEmail, otp: otpCode });
      await fetchProfile();
      setEmailSuccess(true);
      setNewEmail('');
      setOtpCode('');
      setOtpSent(false);
      toast.success('Email utama Anda telah berhasil diperbarui.');
      setTimeout(() => setEmailSuccess(false), 3000);
    } catch (err: any) {
      setEmailError(err.response?.data?.message || 'Kode OTP salah atau sudah kedaluwarsa.');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade pb-10">
      <PageHeader 
        title="Pusat Keamanan Akun" 
        subtitle="Kelola kredensial login, kata sandi, dan proteksi email untuk menjamin keamanan akses portal Anda."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
        
        {/* 1. GANTI PASSWORD SECTION */}
        <Card title="Pembaruan Kata Sandi" subtitle="Ganti password Anda secara berkala dengan kombinasi karakter yang kuat.">
          <form onSubmit={handleSavePassword} className="space-y-6 h-full flex flex-col">
            {passSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-700 animate-fade">
                <CheckCircle2 size={18} />
                <span className="text-[13px] font-semibold">Kata sandi baru Anda telah berhasil diperbarui.</span>
              </div>
            )}
            {passError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 animate-fade">
                <AlertCircle size={18} />
                <span className="text-[13px] font-semibold">{passError}</span>
              </div>
            )}

            <div className="space-y-5 flex-1">
              <div className="relative">
                <Input 
                  label="Kata Sandi Saat Ini" 
                  type={showPass.old ? 'text' : 'password'}
                  placeholder="Masukkan password lama Anda"
                  value={passData.old}
                  onChange={(e) => setPassData({...passData, old: e.target.value})}
                  icon={<Key size={16} />}
                  className="h-11"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass({...showPass, old: !showPass.old})}
                  className="absolute right-3 top-[32px] p-2 text-gray-400 hover:text-gray-600 border-0 bg-transparent cursor-pointer"
                >
                  {showPass.old ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="relative">
                <Input 
                  label="Kata Sandi Baru" 
                  type={showPass.new ? 'text' : 'password'}
                  placeholder="Minimal 8 karakter unik"
                  value={passData.new}
                  onChange={(e) => setPassData({...passData, new: e.target.value})}
                  icon={<Shield size={16} />}
                  className="h-11"
                  helper="Gunakan minimal 8 karakter dengan kombinasi huruf, angka, dan simbol."
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass({...showPass, new: !showPass.new})}
                  className="absolute right-3 top-[32px] p-2 text-gray-400 hover:text-gray-600 border-0 bg-transparent cursor-pointer"
                >
                  {showPass.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="relative">
                <Input 
                  label="Konfirmasi Kata Sandi Baru" 
                  type={showPass.confirm ? 'text' : 'password'}
                  placeholder="Ulangi kembali kata sandi baru"
                  value={passData.confirm}
                  onChange={(e) => setPassData({...passData, confirm: e.target.value})}
                  icon={<Shield size={16} />}
                  className="h-11"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})}
                  className="absolute right-3 top-[32px] p-2 text-gray-400 hover:text-gray-600 border-0 bg-transparent cursor-pointer"
                >
                  {showPass.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end mt-auto">
              <Button type="submit" isLoading={passLoading} className="px-10 h-11 font-semibold shadow-lg shadow-[#DCAF01]/10 uppercase">
                Simpan Kata Sandi
              </Button>
            </div>
          </form>
        </Card>

        {/* 2. GANTI EMAIL SECTION */}
        <Card title="Perubahan Alamat Email" subtitle="Proses perubahan email login memerlukan verifikasi OTP demi keamanan akun.">
          <form onSubmit={handleVerifyEmail} className="space-y-6 h-full flex flex-col">
            {emailSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-700 animate-fade">
                <CheckCircle2 size={18} />
                <span className="text-[13px] font-semibold">Email utama untuk login telah berhasil diubah.</span>
              </div>
            )}
            {emailError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 animate-fade">
                <AlertCircle size={18} />
                <span className="text-[13px] font-semibold">{emailError}</span>
              </div>
            )}

            <div className="space-y-6 flex-1">
              <Input 
                label={
                    <div className="flex items-center gap-1.5 uppercase tracking-wide font-semibold text-[11px]">
                       Email Terdaftar Saat Ini <Lock size={12} className="text-gray-400" />
                    </div>
                }
                value={user?.email || ''} 
                disabled 
                className="bg-gray-50 h-11 font-medium"
                icon={<Mail size={16} />}
              />
              
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-gray-700 block ml-0.5 uppercase tracking-wide text-[11px]">Alamat Email Baru</label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#DCAF01] transition-colors flex items-center justify-center">
                        <Mail size={16} />
                      </div>
                      <input 
                        type="email"
                        placeholder="member@email-baru.com" 
                        className={cn(
                          "w-full h-11 pl-11 pr-4 bg-white border border-gray-300 rounded-lg text-[13px] font-medium font-inter transition-all outline-none",
                          "focus:border-[#DCAF01] focus:ring-4 focus:ring-[#DCAF01]/5 placeholder:text-gray-400 placeholder:font-normal hover:border-gray-400",
                          otpSent && "bg-gray-50 text-gray-500"
                        )}
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        disabled={otpSent}
                      />
                    </div>
                  </div>
                  {!otpSent && (
                    <Button 
                      type="button" 
                      variant="white" 
                      className="h-11 px-5 border-gray-200 shrink-0 font-semibold uppercase text-[11px]"
                      onClick={handleSendOtp}
                      isLoading={emailLoading && !otpSent}
                    >
                      KIRIM KODE
                    </Button>
                  )}
                </div>
                {!otpSent && (
                  <p className="text-[11px] text-gray-400 font-medium ml-1">
                    Kami akan mengirimkan kode verifikasi 6 digit ke alamat email baru Anda.
                  </p>
                )}
              </div>

              {otpSent && (
                <div className="p-5 bg-amber-50 border border-amber-100 rounded-xl animate-fade space-y-4 shadow-sm shadow-amber-100/50">
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-amber-900 block text-center uppercase tracking-widest">Masukkan Kode Verifikasi (OTP)</label>
                    <div className="flex flex-col items-center gap-4">
                      <input 
                        type="text"
                        placeholder="0 0 0 0 0 0" 
                        maxLength={6}
                        className="w-full max-w-[200px] h-12 px-4 bg-white border-2 border-amber-200 rounded-lg text-[18px] font-semibold font-mono tracking-[0.5em] text-center outline-none focus:border-[#DCAF01] shadow-inner"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      />
                      <Button 
                        type="submit" 
                        className="w-full h-11 font-semibold shadow-md shadow-amber-200/50 uppercase"
                        isLoading={emailLoading}
                      >
                        Konfirmasi Perubahan
                      </Button>
                    </div>
                    <div className="flex justify-between items-center mt-2 px-1">
                       <p className="text-[10px] text-amber-700 font-semibold italic">
                          Kode dikirim ke: {newEmail}
                       </p>
                       <button 
                          type="button" 
                          onClick={() => { setOtpSent(false); setOtpCode(''); }}
                          className="text-[10px] text-[#DCAF01] hover:text-[#C49C00] font-semibold border-0 bg-transparent cursor-pointer underline uppercase tracking-tighter"
                       >
                          Ganti Email
                       </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100 mt-auto">
               <p className="text-[11px] text-gray-400 italic leading-relaxed font-medium">
                  Demi keamanan, pastikan Anda memiliki akses penuh ke kotak masuk email baru sebelum memulai proses verifikasi.
               </p>
            </div>
          </form>
        </Card>

      </div>
    </div>
  );
};

export default SettingsPage;


