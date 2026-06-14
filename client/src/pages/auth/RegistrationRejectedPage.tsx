import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleIcon } from '../../components/ui/Icons';
import Button from '../../components/ui/Button';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuthStore } from '@/features/auth/stores/auth.store';

const RegistrationRejectedPage: React.FC = () => {
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
           <div className="mx-auto w-24 h-24 bg-status-danger/10 text-status-danger rounded-full flex items-center justify-center mb-6 border border-status-danger/20">
              <GoogleIcon name="cancel" size={48} />
           </div>
          <h1 className="font-cinzel text-3xl font-semibold leading-tight tracking-wide text-gray-900 ">
            Pendaftaran Ditolak
          </h1>
          <p className="text-[13px] text-gray-500 font-medium leading-relaxed max-w-md mx-auto">
            Mohon maaf, <strong className="text-gray-900">{user?.fullName || 'Calon Anggota'}</strong>. Pendaftaran Anda tidak dapat kami setujui saat ini karena tidak memenuhi kriteria keanggotaan.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-status-danger/5 border border-status-danger/20 text-left space-y-4">
           <h3 className="text-[12px] font-bold text-status-danger uppercase tracking-widest border-b border-status-danger/20 pb-2 flex items-center gap-2">
              <GoogleIcon name="info" size={16} /> Alasan Penolakan
           </h3>
           <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
             <p className="text-[13px] font-medium text-gray-700 italic">
               "Surat rekomendasi yang dilampirkan tidak valid atau berasal dari pihak yang tidak berwenang."
             </p>
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

export default RegistrationRejectedPage;
