import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleIcon } from '../../components/ui/Icons';
import Button from '../../components/ui/Button';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuthStore } from '@/features/auth/stores/auth.store';

const AccountInactivePage: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AuthLayout>
      <div className="space-y-8 animate-fade text-center">
        <div className="space-y-4">
           <div className="mx-auto w-24 h-24 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-6 border border-gray-200">
              <GoogleIcon name="block" size={48} />
           </div>
          <h1 className="font-cinzel text-3xl font-semibold leading-tight tracking-wide text-gray-900 ">
            Akun Dinonaktifkan
          </h1>
          <p className="text-[13px] text-gray-500 font-medium leading-relaxed max-w-md mx-auto">
            Halo <strong className="text-gray-900">{user?.fullName || 'Anggota'}</strong>, akun Anda saat ini sedang dinonaktifkan sementara oleh Admin Pusat. Anda tidak dapat mengakses fitur anggota untuk sementara waktu.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-left space-y-3 flex items-start gap-4">
           <GoogleIcon name="contact_support" size={24} className="text-gray-400 mt-1" />
           <div>
             <h3 className="text-[13px] font-bold text-gray-800">Butuh Bantuan?</h3>
             <p className="text-[12px] font-medium text-gray-500 mt-1">Silakan hubungi Admin Pusat atau Pengurus Wilayah Anda untuk informasi lebih lanjut mengenai status akun Anda.</p>
           </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
             <Button type="button" variant="white" onClick={handleLogout} className="w-full h-11 lg:h-10 text-[14px] lg:text-[13px] font-semibold">
                <GoogleIcon name="logout" size={16} /> Keluar
             </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default AccountInactivePage;
