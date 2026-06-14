import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleIcon } from '../../components/ui/Icons';
import Button from '../../components/ui/Button';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuthStore } from '@/features/auth/stores/auth.store';

const RegisterStep3: React.FC = () => {
  const navigate = useNavigate();
  const { user, uploadDocuments, isLoading, error, clearError } = useAuthStore();
  
  const [files, setFiles] = useState({
    photo: null as File | null,
    recommendation: null as File | null,
  });

  const hasPhoto = !!user?.avatarUrl;
  const hasRecommendation = !!user?.recommendationUrl;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'photo' | 'recommendation') => {
    // If already has file in DB, don't allow changing
    if ((field === 'photo' && hasPhoto) || (field === 'recommendation' && hasRecommendation)) {
       return;
    }

    const file = e.target.files?.[0];
    if (file) {
      const maxPhotoSize = 500 * 1024; // 500 KB
      const maxDocSize = 1024 * 1024; // 1 MB

      if (field === 'photo' && file.size > maxPhotoSize) {
        useAuthStore.setState({ error: 'Ukuran pas foto terlalu besar. Maksimal 500 KB.' });
        return;
      }

      if (field === 'recommendation' && file.size > maxDocSize) {
        useAuthStore.setState({ error: 'Ukuran surat rekomendasi terlalu besar. Maksimal 1 MB.' });
        return;
      }

      setFiles(prev => ({ ...prev, [field]: file }));
      if (error) clearError();
    }
  };

  const handleRemoveFile = (field: 'photo' | 'recommendation') => {
    setFiles(prev => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If user already has both, just move to next step
    if (hasPhoto && hasRecommendation) {
        navigate('/waiting-approval');
        return;
    }

    if ((!files.photo && !hasPhoto) || (!files.recommendation && !hasRecommendation)) return;
    
    try {
      // Logic for partial uploads if needed, but for now we assume they upload what's missing
      await uploadDocuments({
          photo: files.photo,
          recommendation: files.recommendation
      });
      navigate('/waiting-approval');
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-8 animate-fade pb-12">
        <div className="space-y-3 text-center lg:text-left">
          <h1 className="font-cinzel text-3xl font-semibold leading-tight tracking-wide text-gray-900 ">
            Upload Dokumen
          </h1>
          <div className="flex items-center justify-between gap-4 pt-2">
            <p className="text-[11px] font-medium text-primary  tracking-normal">Langkah 03 / 03</p>
            <span className="text-[11px] font-medium text-gray-400 italic">Dokumen Persyaratan</span>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: '100%' }} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-status-danger/5 border border-status-danger/10 text-status-danger rounded-md text-[13px] font-medium flex items-center gap-3 animate-fade shadow-sm">
              <GoogleIcon name="error_outline" size={18} strokeWidth={2.5} /> {error}
            </div>
          )}

          <div className="space-y-6 text-left">
            {/* Pas Foto */}
            <div className="space-y-2">
               <label className="text-[13px] font-semibold text-gray-700 ml-1">Pas Foto Resmi (4x6) *</label>
               
               {hasPhoto ? (
                 <div className="p-4 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-between opacity-80">
                   <div className="flex items-center gap-3">
                      <GoogleIcon name="lock" className="text-gray-400" size={20} />
                      <div className="min-w-0">
                         <p className="text-[13px] font-bold text-gray-900">Pas Foto Terunggah</p>
                         <p className="text-[10px] text-gray-500 italic">Dokumen ini tidak dapat diubah.</p>
                      </div>
                   </div>
                   <GoogleIcon name="check_circle" className="text-status-success" size={20} />
                 </div>
               ) : files.photo ? (
                 <div className="p-4 bg-status-success/5 border border-status-success/20 rounded-md flex items-center justify-between animate-fade">
                   <div className="flex items-center gap-3">
                      <GoogleIcon name="check_circle" className="text-status-success" size={20} />
                      <div className="min-w-0">
                         <p className="text-[13px] font-bold text-gray-900 truncate max-w-[200px]">{files.photo.name}</p>
                         <p className="text-[11px] text-gray-500">Berhasil dipilih</p>
                      </div>
                   </div>
                   <button 
                     type="button" 
                     onClick={() => handleRemoveFile('photo')}
                     className="text-[12px] font-medium text-status-danger hover:text-red-700"
                   >
                     Hapus
                   </button>
                 </div>
               ) : (
                 <div className="relative h-20 rounded-md border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100/50 transition-all flex items-center gap-4 px-4 overflow-hidden">
                    <GoogleIcon name="add_a_photo" size={24} className="text-gray-400" />
                    <div className="text-left">
                       <span className="text-[13px] text-gray-500 font-medium block">Pilih File Pas Foto</span>
                       <span className="text-[10px] text-gray-400">JPG/PNG, Maks 500 KB</span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileChange(e, 'photo')} 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                 </div>
               )}
            </div>

            {/* Surat Rekomendasi */}
            <div className="space-y-2">
               <label className="text-[13px] font-semibold text-gray-700 ml-1">Surat Rekomendasi</label>
               
               {hasRecommendation ? (
                 <div className="p-4 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-between opacity-80">
                   <div className="flex items-center gap-3">
                      <GoogleIcon name="lock" className="text-gray-400" size={20} />
                      <div className="min-w-0">
                         <p className="text-[13px] font-bold text-gray-900">Surat Rekomendasi Terunggah</p>
                         <p className="text-[10px] text-gray-500 italic">Dokumen ini tidak dapat diubah.</p>
                      </div>
                   </div>
                   <GoogleIcon name="check_circle" className="text-status-success" size={20} />
                 </div>
               ) : files.recommendation ? (
                 <div className="p-4 bg-status-success/5 border border-status-success/20 rounded-md flex items-center justify-between animate-fade">
                   <div className="flex items-center gap-3">
                      <GoogleIcon name="check_circle" className="text-status-success" size={20} />
                      <div className="min-w-0">
                         <p className="text-[13px] font-bold text-gray-900 truncate max-w-[200px]">{files.recommendation.name}</p>
                         <p className="text-[11px] text-gray-500">Berhasil dipilih</p>
                      </div>
                   </div>
                   <button 
                     type="button" 
                     onClick={() => handleRemoveFile('recommendation')}
                     className="text-[12px] font-medium text-status-danger hover:text-red-700"
                   >
                     Hapus
                   </button>
                 </div>
               ) : (
                 <div className="relative h-20 rounded-md border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100/50 transition-all flex items-center gap-4 px-4 overflow-hidden">
                    <GoogleIcon name="description" size={24} className="text-gray-400" />
                    <div className="text-left">
                       <span className="text-[13px] text-gray-500 font-medium block">Pilih File Surat Rekomendasi</span>
                       <span className="text-[10px] text-gray-400">PDF/JPG/PNG, Maks 1 MB</span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*,application/pdf" 
                      onChange={(e) => handleFileChange(e, 'recommendation')} 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                 </div>
               )}
            </div>

          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
             <Button type="button" variant="white" size="md" onClick={() => navigate('/register/profile')} className="sm:flex-1 font-semibold h-11 lg:h-10 text-[14px] lg:text-[13px] rounded-md">
                Kembali
             </Button>
             <Button type="submit" size="md" disabled={isLoading || (!files.photo && !hasPhoto) || (!files.recommendation && !hasRecommendation)} className="sm:flex-[2] font-semibold h-11 lg:h-10 text-[14px] lg:text-[13px] rounded-md">
                Selesaikan Pendaftaran
             </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};


export default RegisterStep3;
