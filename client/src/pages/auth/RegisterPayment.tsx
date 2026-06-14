import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleIcon } from '../../components/ui/Icons';
import Button from '../../components/ui/Button';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuthStore } from '@/features/auth/stores/auth.store';

const RegisterPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { submitPayment, isLoading, error, clearError, user, fetchProfile } = useAuthStore();
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    // If the user's status is already ACTIVE, redirect them
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      if (error) clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    try {
      await submitPayment({ proof: file });
      navigate('/waiting-approval');
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-8 animate-fade">
        <div className="space-y-2 text-center lg:text-left">
          <h1 className="font-cinzel text-3xl font-semibold leading-tight tracking-wide text-gray-900 ">
            Instruksi Pembayaran
          </h1>
          <p className="text-[13px] text-gray-500 font-medium">
             Selesaikan pembayaran pendaftaran Anda melalui instruksi di bawah ini.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center space-y-4">
           <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Total Tagihan</p>
           <h2 className="text-4xl font-bold text-primary font-mono">Rp 50.000</h2>
           
           <div className="pt-4 border-t border-primary/10">
              <p className="text-[12px] font-semibold text-gray-700 mb-2">Transfer ke Rekening Bank BCA</p>
              <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                 <div className="text-left">
                    <p className="text-[14px] sm:text-[16px] font-bold font-mono tracking-widest text-gray-900">1234 5678 90</p>
                    <p className="text-[10px] sm:text-[11px] font-medium text-gray-500 uppercase tracking-wider">A.N. PPS PADJADJARAN PUSAT</p>
                 </div>
                 <button className="text-primary hover:bg-primary/5 p-2 rounded-md transition-colors">
                    <GoogleIcon name="content_copy" size={20} />
                 </button>
              </div>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-status-danger/5 border border-status-danger/10 text-status-danger rounded-md text-[13px] font-medium flex items-center gap-3 animate-fade shadow-sm">
              <GoogleIcon name="error_outline" size={18} strokeWidth={2.5} /> {error}
            </div>
          )}

          <div className="space-y-3 text-left">
             <label className="text-[13px] font-bold text-gray-700 ml-1">Upload Bukti Transfer</label>
             <div 
               className={`relative h-40 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-3 ${preview ? 'border-primary bg-primary/5 overflow-hidden' : 'border-gray-200 bg-gray-50 hover:bg-gray-100/50'}`}
             >
               {preview ? (
                 <>
                   <img src={preview} alt="Bukti Transfer" className="h-full w-full object-cover" />
                   <button 
                     type="button" 
                     onClick={() => { setFile(null); setPreview(''); }}
                     className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm text-status-danger hover:scale-110 transition-all"
                   >
                     <GoogleIcon name="close" size={18} />
                   </button>
                 </>
               ) : (
                 <>
                   <div className="text-center space-y-2">
                      <GoogleIcon name="receipt_long" size={32} className="text-gray-400 mx-auto" />
                      <p className="text-[11px] text-gray-400 font-medium">Klik untuk upload bukti (JPG/PNG/PDF)</p>
                   </div>
                   <input 
                     type="file" 
                     accept="image/*,application/pdf" 
                     onChange={handleFileChange} 
                     className="absolute inset-0 opacity-0 cursor-pointer"
                   />
                 </>
               )}
             </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-4 border-t border-gray-100">
             <Button type="button" variant="white" size="md" onClick={() => navigate('/register/documents')} className="sm:flex-1 font-semibold h-11 lg:h-10 text-[14px] lg:text-[13px]">
                <GoogleIcon name="arrow_back" size={16} /> Kembali
             </Button>
             <Button type="submit" size="md" disabled={isLoading || !file} className="sm:flex-[2] font-semibold h-11 lg:h-10 text-[14px] lg:text-[13px]">
                Kirim Bukti Pembayaran <GoogleIcon name="arrow_forward" size={16} />
             </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default RegisterPaymentPage;
