import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleIcon } from '../../components/ui/Icons';
import Button from '../../components/ui/Button';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { publicApi } from '../../services/publicApi';
import { authApi } from '../../features/auth/services/auth.service';

const WhatsAppIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.982L2 22l5.233-1.371a9.994 9.994 0 0 0 4.779 1.379h.004c5.505 0 9.99-4.478 9.99-9.985A9.97 9.97 0 0 0 12.012 2zm5.727 14.13c-.244.693-1.427 1.332-1.956 1.415-.479.076-1.104.124-3.11-.703-2.564-1.059-4.21-3.67-4.338-3.842-.127-.171-1.045-1.39-1.045-2.65 0-1.26.66-1.88.895-2.13.236-.25.513-.311.683-.311.17 0 .341.002.49.009.15.007.353-.06.55.422.204.496.697 1.7.757 1.822.06.123.1.267.018.432-.082.164-.124.268-.244.407-.12.141-.252.313-.36.42-.12.12-.244.251-.106.488.137.236.608.991 1.302 1.609.893.793 1.644 1.039 1.875 1.156.23.118.366.1.503-.06.137-.158.59-.686.748-.92.158-.236.316-.2.533-.119.217.082 1.378.65 1.615.768.236.118.396.177.453.276.06.098.06.57-.183 1.264z"/>
  </svg>
);

const WaitingApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user, fetchProfile } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [paymentSetting, setPaymentSetting] = useState<any>(null);

  useEffect(() => {
    // If the user's status is already ACTIVE or role implies they shouldn't be here, redirect them
    if (user?.state === 'ACTIVE' || user?.status === 'ACTIVE' || user?.status === 'active') {
      const dashboardPath = user?.role === 'super_admin' ? '/app/super-admin' :
                            user?.role === 'admin_pusat' ? '/app/admin-pusat' :
                            user?.role === 'admin_wilayah' ? '/app/admin-wilayah' :
                            '/app/member';
      navigate(dashboardPath, { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    // Set up a polling mechanism to check if the admin has approved them
    const pollInterval = setInterval(async () => {
      try {
        await fetchProfile(); // This updates the store and triggers the effect above if status changed
      } catch (e) {
        // ignore errors during background polling
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [fetchProfile]);

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      try {
        const res = await publicApi.getPaymentSettings();
        setPaymentSetting(res.data?.data || res.data);
      } catch (err) {
        console.error('Failed to fetch payment info');
      }
    };
    fetchPaymentInfo();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCopy = () => {
    if (paymentSetting?.accountNumber) {
      navigator.clipboard.writeText(paymentSetting.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const waNumber = paymentSetting?.whatsapp || '628123456789';
  const waMessage = `Halo Admin, saya ingin konfirmasi pendaftaran anggota PPS Padjadjaran atas nama ${user?.fullName || 'Calon Anggota'} (Email: ${user?.email || ''}). Saya sudah melakukan pembayaran pendaftaran sebesar Rp ${paymentSetting?.amount?.toLocaleString() || '50.000'}.`;
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  return (
    <AuthLayout>
      <div className="space-y-8 animate-fade text-center py-4">
        <div className="space-y-4">
           <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-status-warning/10 text-status-warning rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <GoogleIcon name="hourglass_empty" size={40} className="sm:hidden" />
              <GoogleIcon name="hourglass_empty" size={48} className="hidden sm:block" />
           </div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-semibold leading-tight tracking-wide text-gray-900 ">
            Pendaftaran Hampir Selesai
          </h1>
          <p className="text-[13px] text-gray-500 font-medium leading-relaxed max-w-sm mx-auto px-4">
            Terima kasih, <strong className="text-gray-900">{user?.fullName || 'Calon Anggota'}</strong>! Langkah terakhir adalah melakukan pembayaran dan konfirmasi ke Admin.
          </p>
        </div>

        <div className="space-y-6 px-2 sm:px-0">
          {/* Status Box */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gray-50 border border-gray-100 text-left space-y-4 shadow-sm">
             <h3 className="text-[11px] sm:text-[12px] font-bold text-gray-800 uppercase tracking-widest border-b border-gray-200 pb-2">Status Pendaftaran</h3>
             <ul className="space-y-3">
                <li className="flex items-center gap-3 text-[13px] font-medium text-gray-700">
                   <GoogleIcon name="check_circle" size={18} className="text-status-success" />
                   Data Diri & Dokumen Lengkap
                </li>
                <li className="flex items-center gap-3 text-[13px] font-medium text-gray-700">
                   <GoogleIcon name="hourglass_top" size={18} className="text-status-warning" />
                   Menunggu Verifikasi Pembayaran
                </li>
                 <li className="flex items-center gap-3 text-[13px] font-medium text-gray-400">
                   <GoogleIcon name="circle" size={18} className="text-gray-300" />
                   Penerbitan E-KTA oleh Admin
                </li>
             </ul>
          </div>

          {/* Payment Detail Box (Dynamic) */}
          {paymentSetting && (
             <div className="p-5 sm:p-6 rounded-2xl bg-[#DCAF01]/5 border border-[#DCAF01]/20 text-left space-y-4">
                <div className="flex items-center justify-between border-b border-[#DCAF01]/10 pb-2">
                   <h3 className="text-[11px] sm:text-[12px] font-bold text-gray-800 uppercase tracking-widest">Instruksi Pembayaran</h3>
                </div>
                
                <div className="space-y-3">
                   <p className="text-[12px] text-gray-600 leading-relaxed">
                      Silakan lakukan transfer sesuai detail di bawah ini, lalu klik tombol <strong>Konfirmasi WhatsApp</strong> untuk mengirim bukti transfer ke Admin Pusat.
                   </p>
                   <div className="flex justify-between items-center text-[13px] pt-2">
                      <span className="text-gray-500">Biaya Pendaftaran</span>
                      <span className="text-gray-900 font-bold text-base sm:text-lg">Rp {paymentSetting.amount?.toLocaleString() || '0'}</span>
                   </div>
                   <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-500">Bank Tujuan</span>
                      <span className="text-gray-900 font-semibold uppercase">{paymentSetting.bankName || '-'}</span>
                   </div>
                   <div className="p-3 sm:p-4 bg-white rounded-xl border border-[#DCAF01]/10 flex items-center justify-between shadow-sm overflow-hidden">
                      <div className="text-left min-w-0 pr-2">
                         <p className="text-[14px] sm:text-[16px] font-bold font-mono tracking-wider text-gray-900 truncate">{paymentSetting.accountNumber || '-'}</p>
                         <p className="text-[9px] sm:text-[10px] font-medium text-gray-400 uppercase tracking-wider truncate">A.N. {paymentSetting.accountOwner || '-'}</p>
                      </div>
                      <button 
                        onClick={handleCopy}
                        className={`p-2 rounded-md transition-all shrink-0 ${copied ? 'bg-status-success/10 text-status-success' : 'text-[#DCAF01] hover:bg-[#DCAF01]/5'}`}
                      >
                         <GoogleIcon name={copied ? 'check' : 'content_copy'} size={20} />
                      </button>
                   </div>
                </div>
             </div>
          )}
        </div>

        <div className="pt-6 border-t border-gray-100 space-y-4 px-2 sm:px-0">
             {paymentSetting && (
               <a 
                 href={waUrl} 
                 target="_blank" 
                 rel="noreferrer"
                 className="flex items-center justify-center gap-3 w-full h-11 lg:h-10 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-[14px] lg:text-[13px] transition-all shadow-lg shadow-green-500/20 no-underline"
               >
                  <WhatsAppIcon /> Konfirmasi via WhatsApp
               </a>
             )}
             <Button type="button" variant="white" size="md" onClick={handleLogout} className="w-full font-semibold h-11 lg:h-10 text-[14px] lg:text-[13px]">
                <GoogleIcon name="logout" size={16} /> Keluar Sementara
             </Button>
        </div>
      </div>
    </AuthLayout>
  );

};

export default WaitingApprovalPage;
