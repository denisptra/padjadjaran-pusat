import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import ImageUpload from '../../../components/ui/ImageUpload';
import Skeleton from '../../../components/ui/Skeleton';
import { 
  Save, 
  ArrowLeft, 
  Loader2, 
  User as UserIcon,
  FileText,
  CheckCircle,
  X,
  Lock
} from 'lucide-react';
import { memberApi } from '../../../services/memberApi';
import { regionApi } from '../../../services/regionApi';
import { toast } from '../../../stores/toastStore';
import api, { API_URL } from '../../../services/api';

import { useAuthStore } from '@/features/auth/stores/auth.store';

const MemberForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const isEdit = !!id;
  const isAdminPusat = currentUser?.role === 'admin_pusat' || currentUser?.role === 'super_admin';
  const isAdminWilayah = currentUser?.role === 'admin_wilayah';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [hasInitialPhoto, setHasInitialPhoto] = useState(false);
  const [hasInitialDoc, setHasInitialDoc] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    memberType: 'umum',
    gender: 'Laki-laki',
    nationality: 'WNI',
    role: 'member',
    birthPlace: '',
    birthDate: '',
    regionId: '',
    provinceId: '',
    nik: '',
    photoUrl: '',
    documentUrl: '',
    password: '',
    status: 'PENDING',
  });

  const [provinces, setProvinces] = useState<any[]>([]);
  const [regionsList, setRegionsList] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();
    if (isEdit) {
      fetchMember();
    }
  }, [id]);

  useEffect(() => {
    if (!isEdit && isAdminWilayah && currentUser?.regionId) {
      setFormData(prev => ({ 
        ...prev, 
        regionId: (currentUser as any)?.regionId || '',
        provinceId: (currentUser as any).profile?.region?.provinceId || '' 
      }));
    }
  }, [isEdit, isAdminWilayah, currentUser]);

  const fetchInitialData = async () => {
    try {
      const [provRes] = await Promise.all([
        regionApi.getProvinces()
      ]);
      const provData = provRes.data?.data || provRes.data || [];
      setProvinces(provData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (provinces.length === 0) return;
    
    if (formData.nationality === 'WNA') {
      const luarNegeriProv = provinces.find(p => p.isOverseas || p.name === 'Luar Negeri');
      if (luarNegeriProv && formData.provinceId !== luarNegeriProv.id) {
        setFormData(prev => ({
          ...prev,
          provinceId: luarNegeriProv.id,
          regionId: isEdit ? prev.regionId : ''
        }));
      }
    } else {
      const luarNegeriProv = provinces.find(p => p.isOverseas || p.name === 'Luar Negeri');
      if (luarNegeriProv && formData.provinceId === luarNegeriProv.id) {
        setFormData(prev => ({
          ...prev,
          provinceId: '',
          regionId: ''
        }));
      }
    }
  }, [formData.nationality, provinces, formData.provinceId, isEdit]);

  useEffect(() => {
    if (formData.provinceId) {
      fetchRegionsForProvince(formData.provinceId);
    } else {
      setRegionsList([]);
    }
  }, [formData.provinceId]);

  const fetchRegionsForProvince = async (provId: string) => {
    try {
      const res = await regionApi.getList(provId);
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : (data.data && Array.isArray(data.data) ? data.data : []);
      setRegionsList(list.map((r: any) => ({ label: r.name, value: r.id })));
    } catch (err) {
      console.error('Failed to fetch regions:', err);
      setRegionsList([]);
    }
  };

  const fetchMember = async () => {
    try {
      setLoading(true);
      const res = await memberApi.getById(id!);
      const data = res.data?.data || res.data;
      if (data) {
        setFormData({
          fullName: data.fullName || '',
          email: data.user?.email || '',
          phone: data.phone || '',
          address: data.address || '',
          memberType: data.memberType || 'umum',
          gender: data.gender || 'Laki-laki',
          nationality: data.nationality || 'WNI',
          role: data.user?.role || 'member',
          birthPlace: data.birthPlace || '',
          birthDate: data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : '',
          provinceId: data.region?.provinceId || '',
          regionId: data.regionId || '',
          nik: data.nik || '',
          photoUrl: data.photoUrl || '',
          documentUrl: data.documentUrl || '',
          password: '',
          status: data.user?.status || 'PENDING',
        });
        setHasInitialPhoto(!!data.photoUrl);
        setHasInitialDoc(!!data.documentUrl);
      }
    } catch (err) {
      toast.error('Gagal mengambil data anggota');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/files/upload-secure', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData({ ...formData, documentUrl: res.data.storagePath });
      toast.success('Surat rekomendasi berhasil diunggah');
    } catch (err) {
      toast.error('Gagal mengunggah surat rekomendasi');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Safety check for admin wilayah
    const payload = { ...formData };
    if (isAdminWilayah && !isEdit && currentUser?.regionId) {
      payload.regionId = currentUser.regionId;
    }

    if (!formData.photoUrl) {
      toast.error('Pas Foto Resmi wajib diunggah!');
      return;
    }

    if (!formData.documentUrl) {
      toast.error('Surat Rekomendasi wajib diunggah!');
      return;
    }

    try {
      setSaving(true);
      if (isEdit) {
        await memberApi.update(id!, payload);
        toast.success('Profil anggota berhasil diperbarui');
      } else {
        await memberApi.create(payload);
        toast.success('Anggota baru berhasil ditambahkan');
      }
      navigate(-1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data anggota');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade pb-10 text-left">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="h-10 w-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm transition-all">
          <ArrowLeft size={20} />
        </button>
        <PageHeader 
          title={isEdit ? "Edit anggota" : "Tambah anggota baru"} 
          subtitle="Kelola informasi biodata dan penempatan wilayah anggota."
        />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Card title="Akun & Biodata" subtitle="Informasi autentikasi dan identitas dasar.">
             <div className="space-y-5">
                {loading ? (
                   <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-50 pb-5">
                         <div className="space-y-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-11 w-full rounded-xl" />
                         </div>
                         <div className="space-y-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-11 w-full rounded-xl" />
                         </div>
                      </div>
                   </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-50 pb-5">
                      <Input label="Email resmi" type="email" required disabled={isEdit && !isAdminPusat} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="email@contoh.com" />
                      {!isEdit ? (
                        <Input label="Kata sandi sementara" type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Buat sandi awal..." />
                      ) : (
                        <Input label="ID / Nomor KTA" value={formData.nik ? 'Tersedia' : '-'} disabled placeholder="Hanya untuk tampilan" />
                      )}
                    </div>

                    <Input label="Nama lengkap" required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} placeholder="Nama sesuai KTP" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input 
                        label={formData.nationality === 'WNI' ? "Nomor Identitas (NIK)" : "Nomor Paspor / Identitas Negara"} 
                        required 
                        value={formData.nik} 
                        onChange={(e) => {
                          const val = e.target.value;
                          if (formData.nationality === 'WNI') {
                            setFormData({...formData, nik: val.replace(/\D/g, '').slice(0, 16)});
                          } else {
                            setFormData({...formData, nik: val.slice(0, 30)});
                          }
                        }} 
                        placeholder={formData.nationality === 'WNI' ? "16 digit angka" : "Masukkan nomor identitas/paspor"} 
                      />
                      <Select 
                        label="Kebangsaan" 
                        value={formData.nationality} 
                        onChange={(e) => {
                          const newNat = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            nationality: newNat,
                            provinceId: '',
                            regionId: '',
                            nik: '',
                          }));
                        }} 
                        options={[
                          {label: 'WNI (Warga Negara Indonesia)', value: 'WNI'}, 
                          {label: 'WNA (Warga Negara Asing)', value: 'WNA'}
                        ]} 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="Nomor WhatsApp" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="628..." />
                      <Select 
                        label="Peran Sistem (Role)" 
                        value={formData.role} 
                        disabled={isAdminWilayah}
                        onChange={(e) => setFormData({...formData, role: e.target.value})} 
                        options={[
                          {label: 'Member (Anggota)', value: 'member'}, 
                          {label: 'Admin Wilayah', value: 'admin_wilayah'},
                          {label: 'Admin Pusat', value: 'admin_pusat'}
                        ]} 
                      />
                    </div>

                    {isAdminPusat && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select 
                          label="Status Keaktifan" 
                          value={formData.status} 
                          onChange={(e) => setFormData({...formData, status: e.target.value})} 
                          options={[
                            {label: 'AKTIF', value: 'ACTIVE'}, 
                            {label: 'NONAKTIF / BLOCKED', value: 'INACTIVE'},
                            {label: 'MENUNGGU VERIFIKASI', value: 'PENDING'}
                          ]} 
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="Tempat lahir" value={formData.birthPlace} onChange={(e) => setFormData({...formData, birthPlace: e.target.value})} />
                      <Input label="Tanggal lahir" type="date" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Select 
                        label="Gender" 
                        value={formData.gender} 
                        onChange={(e) => setFormData({...formData, gender: e.target.value})} 
                        options={[
                          {label: 'Laki-laki', value: 'Laki-laki'}, 
                          {label: 'Perempuan', value: 'Perempuan'}
                        ]} 
                      />
                      <Select 
                        label="Jenis keanggotaan" 
                        value={formData.memberType} 
                        onChange={(e) => setFormData({...formData, memberType: e.target.value})} 
                        options={[
                          {label: 'Umum', value: 'umum'}, 
                          {label: 'Khusus', value: 'khusus'}, 
                          {label: 'Pencak Silat', value: 'pencak_silat'}
                        ]} 
                      />
                    </div>
                  </>
                )}
             </div>
          </Card>

          <Card title="Domisili & Lokasi" subtitle="Penempatan wilayah administrasi anggota.">
             <div className="space-y-5">
                {loading ? (
                   <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-11 w-full rounded-xl" />
                         </div>
                      </div>
                   </>
                ) : (
                   <>
                      {formData.nationality === 'WNI' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Select 
                            label="Provinsi Domisili" 
                            value={formData.provinceId} 
                            disabled={isAdminWilayah}
                            onChange={(e) => setFormData({...formData, provinceId: e.target.value, regionId: ''})} 
                            options={[
                              { label: 'Pilih Provinsi', value: '' },
                              ...provinces
                                .filter((p: any) => !p.isOverseas && p.name !== 'Pusat')
                                .map((p: any) => ({ label: p.name, value: p.id }))
                            ]}
                          />
                          <Select 
                            label="Kota/Kabupaten" 
                            required 
                            value={formData.regionId} 
                            onChange={(e) => setFormData({...formData, regionId: e.target.value})} 
                            options={[
                              { label: 'Pilih Kota/Kab', value: '' },
                              ...regionsList
                            ]} 
                            disabled={!formData.provinceId || isAdminWilayah}
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          <Select 
                            label="Negara Domisili" 
                            required 
                            value={formData.regionId} 
                            onChange={(e) => setFormData({...formData, regionId: e.target.value})} 
                            options={[
                              { label: 'Pilih Negara', value: '' },
                              ...regionsList
                            ]} 
                            disabled={!formData.provinceId || isAdminWilayah}
                          />
                        </div>
                      )}

                      <Input 
                        as="textarea"
                        label="Alamat lengkap domisili"
                        className="min-h-[100px]"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="Jalan, No Rumah, RT/RW..."
                      />
                   </>
                )}
             </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <Card title="Dokumen Persyaratan" subtitle="Upload file fisik anggota.">
              <div className="space-y-6 text-left">
                 {loading ? (
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-32 w-full rounded-md" />
                       </div>
                    </div>
                  ) : (
                    <>
                       {hasInitialPhoto && !isAdminPusat ? (
                         <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between opacity-80 mb-6">
                           <div className="flex items-center gap-3">
                              <Lock className="text-gray-400" size={18} />
                              <div className="min-w-0">
                                 <p className="text-[12px] font-bold text-gray-900">Pas Foto Resmi (Terkunci)</p>
                                 <p className="text-[10px] text-gray-500 italic">Dokumen ini tidak dapat diubah.</p>
                              </div>
                           </div>
                           <CheckCircle className="text-emerald-500" size={20} />
                         </div>
                       ) : (
                         <ImageUpload 
                           value={formData.photoUrl} 
                           onChange={(val) => setFormData({...formData, photoUrl: val})} 
                           label="Pas Foto Resmi (4x6) *" 
                           hint="JPG/PNG, Maks 500 KB"
                         />
                       )}
                       
                       <div className="space-y-2">
                           <label className="text-[13px] font-semibold text-gray-700 block">
                             Surat Rekomendasi {!hasInitialDoc && '*'}
                           </label>
                           {hasInitialDoc && !isAdminPusat ? (
                             <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between opacity-80">
                               <div className="flex items-center gap-3">
                                  <Lock className="text-gray-400" size={18} />
                                  <div className="min-w-0">
                                     <p className="text-[12px] font-bold text-gray-900">Surat Rekomendasi (Terkunci)</p>
                                     <a href={`${API_URL}${formData.documentUrl}`} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline block mt-0.5">Lihat File</a>
                                  </div>
                               </div>
                               <CheckCircle className="text-emerald-500" size={20} />
                             </div>
                           ) : formData.documentUrl ? (
                             <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-md flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                   <CheckCircle className="text-emerald-500" size={18} />
                                   <div className="min-w-0">
                                     <p className="text-[12px] font-bold text-gray-900 truncate">Surat Terunggah</p>
                                     <a href={`${API_URL}${formData.documentUrl}`} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline">Lihat File</a>
                                   </div>
                               </div>
                               <button type="button" onClick={() => setFormData({...formData, documentUrl: ''})} className="text-gray-400 hover:text-red-500 transition-colors border-0 bg-transparent cursor-pointer">
                                   <X size={16} />
                               </button>
                             </div>
                           ) : (
                             <label className="flex flex-col items-center justify-center h-32 w-full border-2 border-dashed border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer group transition-all">
                               <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileUpload} />
                               {uploadingDoc ? (
                                   <Loader2 className="animate-spin text-[#DCAF01]" size={24} />
                               ) : (
                                   <>
                                     <FileText className="text-gray-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
                                     <span className="text-[12px] font-medium text-gray-500">Pilih File PDF/Gambar</span>
                                     <span className="text-[10px] text-gray-400">Maksimal 1 MB</span>
                                   </>
                               )}
                             </label>
                           )}
                       </div>
                    </>
                  )}

                 <div className="pt-4 border-t border-gray-50">
                    <Button type="submit" className="w-full h-12 font-bold text-[13px] shadow-lg shadow-[#DCAF01]/10" isLoading={saving} icon={<Save size={18} />}>
                       {isEdit ? 'Simpan Perubahan' : 'Selesaikan & Buat Anggota'}
                    </Button>
                 </div>
              </div>
           </Card>
        </div>
      </form>
    </div>
  );
};

export default MemberForm;
