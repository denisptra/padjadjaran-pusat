import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleIcon } from '../../components/ui/Icons';
import Button from '../../components/ui/Button';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuthStore } from '@/features/auth/stores/auth.store';

const RevisionRequiredPage: React.FC = () => {
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
           <div className="mx-auto w-24 h-24 bg-status-warning/10 text-status-warning rounded-full flex items-center justify-center mb-6 border border-status-warning/20">
              <GoogleIcon name="edit_document" size={48} />
           </div>
          <h1 className="font-cinzel text-3xl font-semibold leading-tight tracking-wide text-gray-900 ">
            Revisi Data Diperlukan
          </h1>
          <p className="text-[13px] text-gray-500 font-medium leading-relaxed max-w-md mx-auto">
            Halo <strong className="text-gray-900">{user?.fullName || 'Calon Anggota'}</strong>, Admin Pusat telah meninjau pendaftaran Anda. Terdapat beberapa data yang perlu diperbaiki sebelum pendaftaran dapat disetujui.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-status-warning/5 border border-status-warning/20 text-left space-y-4">
           <h3 className="text-[12px] font-bold text-gray-800 uppercase tracking-widest border-b border-gray-200 pb-2 flex items-center gap-2">
              <GoogleIcon name="chat" size={16} className="text-status-warning" /> Catatan Admin
           </h3>
           <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
             <p className="text-[13px] font-medium text-gray-700 italic">
               "Mohon unggah ulang foto profil dengan latar belakang merah dan pakaian resmi PPS Padjadjaran."
             </p>
           </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row gap-4 border-t border-gray-100">
             <Button type="button" variant="white" onClick={handleLogout} className="sm:flex-1 h-11 lg:h-10 text-[14px] lg:text-[13px] font-semibold">
                Keluar Sementara
             </Button>
             <Button type="button" onClick={() => navigate('/register/profile')} className="sm:flex-[2] h-11 lg:h-10 text-[14px] lg:text-[13px] font-semibold bg-status-warning hover:bg-yellow-600 text-white border-0">
                Mulai Revisi Data <GoogleIcon name="arrow_forward" size={16} />
             </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RevisionRequiredPage;
