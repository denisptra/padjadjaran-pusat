import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import KTACard from '@/components/ui/KTACard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import ConfirmationModal from '@/components/ui/ConfirmModal';
import { compressImage } from '@/utils/compress';
import { 
  User, Phone, MapPin, Camera, Save, Hash, Eye, EyeOff, Calendar, UserCheck, Globe,
  Lock, CheckCircle, X, FileText, Loader2
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { toast } from '@/stores/toastStore';
import { authApi } from '@/features/auth/services/auth.service';
import { regionApi } from '@/services/regionApi';
import api, { API_URL } from '@/services/api';

const MemberProfileView: React.FC = () => {
  const { user, role, fetchProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showNik, setShowNik] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [tempDocUrl, setTempDocUrl] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  
  const [provinces, setProvinces] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [overseasProvince, setOverseasProvince] = useState<any>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    birthPlace: '',
    birthDate: '',
    gender: '',
    phone: '',
    address: '',
    nik: '',
    memberType: '',
    provinceId: '',
    regionId: '',
    kewarganegaraan: 'WNI',
  });

  const isNikDisabled = !!(user as any)?.nik;
  const isMemberTypeDisabled = !!(user as any)?.memberType;
  const isKewarganegaraanDisabled = !!(user as any)?.nationality;
  const isProvinceDisabled = !!(user as any)?.region?.provinceId;
  const isRegionDisabled = !!(user as any)?.regionId;
  const isGenderDisabled = !!(user as any)?.gender;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate NIK
    if (!formData.nik) {
      newErrors.nik = 'NIK / Nomor Identitas wajib diisi.';
    } else {
      if (formData.kewarganegaraan === 'WNI') {
        if (formData.nik.length !== 16) {
          newErrors.nik = 'NIK harus tepat 16 digit.';
        }
      } else {
        if (formData.nik.length < 4) {
          newErrors.nik = 'Nomor Identitas (Paspor) minimal 4 karakter.';
        }
      }
    }

    // Validate other fields
    if (!formData.fullName.trim()) newErrors.fullName = 'Nama lengkap wajib diisi.';
    if (!formData.birthPlace.trim()) newErrors.birthPlace = 'Tempat lahir wajib diisi.';
    if (!formData.birthDate) newErrors.birthDate = 'Tanggal lahir wajib diisi.';
    if (!formData.gender) newErrors.gender = 'Jenis kelamin wajib diisi.';
    if (!formData.phone.trim()) newErrors.phone = 'Nomor WhatsApp wajib diisi.';
    if (!formData.address.trim()) newErrors.address = 'Alamat lengkap wajib diisi.';

    if (role === 'member' || role === 'admin_wilayah') {
      if (formData.kewarganegaraan === 'WNI') {
        if (!formData.provinceId) newErrors.provinceId = 'Provinsi wajib dipilih.';
        if (!formData.regionId) newErrors.regionId = 'Wilayah/Kota wajib dipilih.';
      } else {
        if (!formData.regionId) newErrors.regionId = 'Negara Domisili wajib dipilih.';
      }
    }

    // Validate documents
    const hasExistingDoc = !!(user?.documentUrl || user?.recommendationUrl);
    if (!hasExistingDoc && !tempDocUrl) {
      newErrors.documentUrl = 'Surat Rekomendasi wajib diunggah.';
    }

    const hasExistingAvatar = !!user?.avatarUrl;
    if (!hasExistingAvatar) {
      newErrors.avatarUrl = 'Pas Foto Resmi wajib diunggah.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmModal(true);
    } else {
      toast.error('Silakan lengkapi semua data dengan benar.');
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const provRes = await regionApi.getProvinces();
        const provs = provRes.data || [];
        setProvinces(provs.filter((p: any) => !p.isOverseas));
        setOverseasProvince(provs.find((p: any) => p.isOverseas));
      } catch (err) { console.error('Failed to fetch provinces', err); }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchFilteredRegions = async () => {
      let targetProvinceId = '';
      if (formData.kewarganegaraan === 'WNI') { targetProvinceId = formData.provinceId; } 
      else if (overseasProvince) { targetProvinceId = overseasProvince.id; }

      if (targetProvinceId) {
        try {
          const regRes = await regionApi.getList(targetProvinceId);
          setRegions(regRes.data || []);
        } catch (err) { console.error('Failed to fetch regions', err); }
      } else { setRegions([]); }
    };
    fetchFilteredRegions();
  }, [formData.provinceId, formData.kewarganegaraan, overseasProvince]);

  useEffect(() => {
    if ((user as any)) {
      setFormData({
        fullName: (user as any).fullName || '',
        birthPlace: (user as any).birthPlace || '',
        birthDate: (user as any).birthDate ? new Date((user as any).birthDate).toISOString().split('T')[0] : '',
        gender: (user as any).gender || '',
        phone: (user as any).phone || '',
        address: (user as any).address || '',
        nik: (user as any).nik || '',
        memberType: (user as any).memberType || '',
        provinceId: (user as any).region?.provinceId || '',
        regionId: (user as any).regionId || '',
        kewarganegaraan: (user as any).nationality || (((user as any).region?.province?.isOverseas || (user as any).country) ? 'WNA' : 'WNI'),
      });
      setTempDocUrl((user as any).documentUrl || (user as any).recommendationUrl || '');
    }
  }, [(user as any)]);

  const maskNik = (nik: string) => {
    if (!nik) return 'BELUM DIISI';
    return nik; // Tampilkan NIK asli
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      let file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        try { file = await compressImage(file, 800, 800, 0.7); } catch (err) { console.warn('Gagal mengompres pas foto:', err); }
      }
      if (file.size > 1 * 1024 * 1024) return toast.error('Berkas pas foto tidak boleh melebihi 1MB.');
      setLoading(true);
      try {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        const uploadRes = await api.post('/files/upload', formDataUpload, { headers: { 'Content-Type': 'multipart/form-data' } });
        const fileUrl = uploadRes.data.url || `/files/${uploadRes.data.filename}`;
        await authApi.updateProfile({ photoUrl: fileUrl });
        await fetchProfile();
        toast.success('Pas foto berhasil diperbarui!');
        if (errors.avatarUrl) {
          setErrors(prev => ({ ...prev, avatarUrl: '' }));
        }
      } catch (err) { toast.error('Gagal mengunggah foto.'); } finally { setLoading(false); }
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      return toast.error('Berkas surat rekomendasi tidak boleh melebihi 1MB.');
    }

    setUploadingDoc(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/files/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const path = res.data.url || `/files/${res.data.filename}`;
      setTempDocUrl(path);
      toast.success('Surat rekomendasi berhasil diunggah');
      if (errors.documentUrl) {
        setErrors(prev => ({ ...prev, documentUrl: '' }));
      }
    } catch (err) {
      toast.error('Gagal mengunggah surat rekomendasi');
    } finally {
      setUploadingDoc(false);
    }
  };

  const executeSave = async () => {
    setLoading(true);
    try {
      const updateData: any = { ...formData };
      
      // Map kewarganegaraan to nationality for backend
      updateData.nationality = formData.kewarganegaraan;
      delete updateData.kewarganegaraan;

      // Delete disabled fields to prevent overwriting or validation/security issues
      if (isNikDisabled) {
        delete updateData.nik;
      }
      if (isMemberTypeDisabled) {
        delete updateData.memberType;
      }
      if (isKewarganegaraanDisabled) {
        delete updateData.nationality;
      }
      if (isProvinceDisabled) {
        delete updateData.provinceId;
      }
      if (isRegionDisabled) {
        delete updateData.regionId;
      }
      if (isGenderDisabled) {
        delete updateData.gender;
      }

      // Add new document if uploaded
      if (!user?.documentUrl && !user?.recommendationUrl && tempDocUrl) {
        updateData.documentUrl = tempDocUrl;
        updateData.recommendationUrl = tempDocUrl;
      }

      await authApi.updateProfile(updateData);
      await fetchProfile();
      toast.success('Biodata berhasil disimpan.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil.');
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const getFullFileUrl = (path: string | undefined | null) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left pb-10">
        <div className="lg:col-span-4 space-y-6">
          <Card>
             <div className="flex flex-col items-center py-2">
                 <div className="relative mb-6">
                    <div className="h-32 w-32 bg-gray-100 rounded-full border-2 border-gray-200 flex items-center justify-center overflow-hidden shadow-inner">
                       {user?.avatarUrl ? (
                         <img src={getFullFileUrl(user.avatarUrl)} alt="Avatar" className="h-full w-full object-cover" />
                       ) : (
                         <User size={64} className="text-gray-300" />
                       )}
                    </div>
                    <>
                       <input type="file" accept="image/*" onChange={handleUploadAvatar} className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full" />
                       <button className="absolute bottom-0 right-0 h-9 w-9 bg-[#DCAF01] text-gray-900 rounded-full shadow-md flex items-center justify-center border-2 border-white pointer-events-none" type="button">
                            <Camera size={16} />
                       </button>
                    </>
                 </div>
                 {errors.avatarUrl && (
                    <p className="text-[11px] text-red-500 text-center -mt-4 mb-4">{errors.avatarUrl}</p>
                 )}
                <div className="text-center space-y-1 w-full px-2">
                   <h2 className="text-[18px] font-semibold text-gray-900 truncate uppercase tracking-tight">{formData.fullName}</h2>
                   <div className="flex items-center justify-center gap-2">
                      <Badge variant="info" className="capitalize font-semibold uppercase tracking-widest text-[9px]">{role?.replace('_', ' ')}</Badge>
                      <Badge variant={(user as any)?.status === 'ACTIVE' ? 'success' : 'warning'} className="font-semibold uppercase tracking-widest text-[9px]">
                        {(user as any)?.status === 'ACTIVE' ? 'Aktif' : 'Pending'}
                      </Badge>
                   </div>
                </div>

                <div className="w-full mt-6 space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center text-[12px]">
                        <span className="text-gray-500 font-medium">Email</span>
                        <span className="text-gray-900 font-semibold">{(user as any)?.email}</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px]">
                        <span className="text-gray-500 font-medium">No. KTA</span>
                        <span className="text-gray-900 font-semibold font-mono tracking-widest">{(user as any)?.ktaNumber || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px]">
                        <span className="text-gray-500 font-medium">Kategori</span>
                        <span className="text-gray-900 font-semibold uppercase">{(user as any)?.memberType?.replace('_', ' ') || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px]">
                        <span className="text-gray-500 font-medium">Wilayah</span>
                        <span className="text-gray-900 font-semibold uppercase truncate max-w-[120px]">{(user as any)?.region?.name || 'Pusat'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px]">
                        <span className="text-gray-500 font-medium">Bergabung</span>
                        <span className="text-gray-900 font-semibold">{(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString('id-ID') : '-'}</span>
                    </div>
                </div>
             </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card title="Informasi Biodata" subtitle="Data personal lengkap sesuai identitas resmi.">
               <div className="space-y-6">
                  {/* Row 1: Kewarganegaraan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Select
                       label="Kewarganegaraan"
                       disabled={isKewarganegaraanDisabled}
                       value={formData.kewarganegaraan}
                       required
                       error={errors.kewarganegaraan}
                       onChange={(e) => {
                         handleChange('kewarganegaraan', e.target.value);
                         setFormData(prev => ({ ...prev, provinceId: '', regionId: '', nik: '' }));
                       }}
                     >
                        <option value="WNI">WNI</option>
                        <option value="WNA">WNA / Luar Negeri</option>
                     </Select>
                  </div>

                  {/* Row 2: Nama Lengkap */}
                  <Input
                    label="Nama Lengkap"
                    value={formData.fullName}
                    required
                    error={errors.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    icon={<User size={16} />}
                  />

                  {/* Row 3: NIK & Nomor WhatsApp */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="relative group w-full text-left">
                       <Input
                         label={formData.kewarganegaraan === 'WNI' ? "Nomor Induk Kependudukan (NIK) *" : "Nomor Paspor / Identitas Negara *"}
                         type={showNik ? "text" : "password"}
                         value={formData.nik}
                         disabled={isNikDisabled}
                         required
                         error={errors.nik}
                         onChange={(e) => {
                           const val = e.target.value;
                           const cleanVal = formData.kewarganegaraan === 'WNI' ? val.replace(/\D/g, '') : val;
                           if (formData.kewarganegaraan === 'WNI' && cleanVal.length > 16) return;
                           handleChange('nik', cleanVal);
                         }}
                         icon={<Hash size={16} />}
                         placeholder={formData.kewarganegaraan === 'WNI' ? "16 digit NIK..." : "Nomor Paspor / ID..."}
                         rightElement={
                           <button
                             type="button"
                             onClick={() => setShowNik(!showNik)}
                             className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                           >
                             {showNik ? <EyeOff size={16} /> : <Eye size={16} />}
                           </button>
                         }
                       />
                     </div>
                     <Input
                       label="Nomor WhatsApp"
                       value={formData.phone}
                       required
                       error={errors.phone}
                       onChange={(e) => {
                         let val = e.target.value.replace(/\D/g, '');
                         if (val.startsWith('0')) {
                           val = '62' + val.substring(1);
                         } else if (!val.startsWith('62') && val.length > 0) {
                           val = '62' + val;
                         }
                         const formattedVal = val ? '+' + val : '';
                         handleChange('phone', formattedVal);
                       }}
                       icon={<Phone size={16} />}
                     />
                  </div>

                  {/* Row 4: Tempat Lahir & Tanggal Lahir */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Input
                       label="Tempat Lahir"
                       value={formData.birthPlace}
                       required
                       error={errors.birthPlace}
                       onChange={(e) => handleChange('birthPlace', e.target.value)}
                     />
                     <Input
                       label="Tanggal Lahir"
                       type="date"
                       value={formData.birthDate}
                       required
                       error={errors.birthDate}
                       onChange={(e) => handleChange('birthDate', e.target.value)}
                       icon={<Calendar size={16} />}
                     />
                  </div>

                  {/* Row 5: Jenis Kelamin & Kategori Anggota */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Select
                       label="Jenis Kelamin"
                       disabled={isGenderDisabled}
                       value={formData.gender}
                       required
                       error={errors.gender}
                       onChange={(e) => handleChange('gender', e.target.value)}
                     >
                        <option value="">-- Pilih --</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                     </Select>
                     <Select
                       label="Kategori Anggota"
                       disabled={isMemberTypeDisabled}
                       value={formData.memberType}
                       required
                       error={errors.memberType}
                       onChange={(e) => handleChange('memberType', e.target.value)}
                     >
                        <option value="">-- Pilih --</option>
                        <option value="umum">Umum</option>
                        <option value="khusus">Khusus</option>
                        <option value="pencak_silat">Pencak Silat</option>
                     </Select>
                  </div>

                  {/* Row 6: Domisili / Wilayah / Negara */}
                  {formData.kewarganegaraan === 'WNI' ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <Select
                         label="Provinsi"
                         disabled={isProvinceDisabled}
                         value={formData.provinceId}
                         required
                         error={errors.provinceId}
                         onChange={(e) => {
                           handleChange('provinceId', e.target.value);
                           setFormData(prev => ({ ...prev, regionId: '' }));
                         }}
                       >
                         <option value="">-- Pilih Provinsi --</option>
                         {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                       </Select>
                       <Select
                         label="Wilayah / Kota"
                         disabled={isRegionDisabled}
                         value={formData.regionId}
                         required
                         error={errors.regionId}
                         onChange={(e) => handleChange('regionId', e.target.value)}
                       >
                         <option value="">-- Pilih Wilayah --</option>
                         {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                       </Select>
                     </div>
                  ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <Select
                         label="Negara Domisili"
                         disabled={isRegionDisabled}
                         value={formData.regionId}
                         required
                         error={errors.regionId}
                         onChange={(e) => handleChange('regionId', e.target.value)}
                       >
                         <option value="">-- Pilih Negara --</option>
                         {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                       </Select>
                     </div>
                  )}

                  {/* Row 7: Alamat Lengkap */}
                  <Input
                    label="Alamat Lengkap"
                    as="textarea"
                    value={formData.address}
                    required
                    error={errors.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    icon={<MapPin size={16} />}
                    rows={3}
                  />
               </div>
               
               <div className="flex items-center justify-end pt-6 mt-8 border-t border-gray-100 gap-4">
                  <Button type="submit" isLoading={loading} className="px-12 font-semibold shadow-lg shadow-[#DCAF01]/10 uppercase tracking-wider h-11">
                    <Save size={18} className="mr-2" /> Simpan Biodata
                  </Button>
               </div>
            </Card>

            <Card title="Dokumen Persyaratan" subtitle="Berkas resmi yang telah diunggah pada saat pendaftaran.">
               <div className="space-y-4 text-left">
                  <div>
                     <label className="text-[13px] font-bold text-gray-700 ml-1 block mb-2">Surat Rekomendasi / Dokumen Pendukung</label>
                     {user?.documentUrl || user?.recommendationUrl ? (
                       <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                <Lock size={18} />
                             </div>
                             <div>
                                <p className="text-[13px] font-bold text-gray-900">Surat Rekomendasi (Terkunci)</p>
                                <p className="text-[11px] text-gray-500">Berkas telah diunggah dan tidak dapat diubah.</p>
                             </div>
                          </div>
                          <Button type="button" variant="outline" size="sm" className="bg-white" onClick={() => window.open(getFullFileUrl(user.documentUrl || user.recommendationUrl), '_blank')}>
                             Lihat Dokumen
                          </Button>
                       </div>
                     ) : (
                       <div className="space-y-3">
                         {tempDocUrl ? (
                           <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-md flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                 <CheckCircle className="text-emerald-500" size={18} />
                                 <div className="min-w-0">
                                   <p className="text-[12px] font-bold text-gray-900 truncate">Surat Terunggah</p>
                                   <a href={getFullFileUrl(tempDocUrl)} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline">Lihat File</a>
                                 </div>
                             </div>
                             <button type="button" onClick={() => setTempDocUrl('')} className="text-gray-400 hover:text-red-500 transition-colors border-0 bg-transparent cursor-pointer">
                                 <X size={16} />
                             </button>
                           </div>
                         ) : (
                           <label className="flex flex-col items-center justify-center h-32 w-full border-2 border-dashed border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer group transition-all">
                             <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleDocumentUpload} />
                             {uploadingDoc ? (
                                 <Loader2 className="animate-spin text-[#DCAF01]" size={24} />
                             ) : (
                                 <>
                                   <FileText className="text-gray-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
                                   <span className="text-[12px] font-medium text-gray-500">Pilih File PDF/Gambar *</span>
                                   <span className="text-[10px] text-gray-400">Maksimal 1 MB (Wajib Diisi)</span>
                                 </>
                             )}
                           </label>
                         )}
                         {errors.documentUrl && (
                           <p className="text-[11px] text-red-500 mt-1">{errors.documentUrl}</p>
                         )}
                       </div>
                     )}
                  </div>
               </div>
            </Card>
          </form>
        </div>
        <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={executeSave}
        title="Simpan Perubahan"
        message="Apakah Anda yakin ingin menyimpan perubahan data profil?"
        confirmLabel="Ya, Simpan"
        cancelLabel="Batal"
        variant="primary"
        isLoading={loading}
      />
    </div>
  );
};

export default MemberProfileView;
