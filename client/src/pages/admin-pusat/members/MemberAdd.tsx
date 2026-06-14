import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { 
  ChevronLeft, 
  UserPlus, 
  User, 
  Mail, 
  ShieldCheck, 
  Phone,
  Lock,
  Loader2
} from 'lucide-react';
import { toast } from '../../../stores/toastStore';
import { memberApi } from '@/services/memberApi';
import { regionApi } from '@/services/regionApi';

const CreateMember: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [regions, setRegions] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'Laki-laki',
    memberType: 'umum',
    regionId: '',
    status: 'ACTIVE',
    address: '',
    nik: '',
    password: ''
  });

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      setFetching(true);
      const regionsRes = await regionApi.getList();
      setRegions(regionsRes.data || []);
      if (regionsRes.data && regionsRes.data.length > 0) {
        setFormData(prev => ({ ...prev, regionId: regionsRes.data[0].id }));
      }
    } catch (err) {
      toast.error('Gagal memuat daftar wilayah');
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const payload: any = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        memberType: formData.memberType,
        regionId: formData.regionId || null,
        status: formData.status,
        address: formData.address,
        nik: formData.nik,
        password: formData.password || 'Padjadjaran123'
      };

      await memberApi.create(payload);
      toast.success('Anggota baru berhasil ditambahkan.');
      navigate('/app/admin-pusat/members');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan anggota.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center text-gray-400 gap-4">
        <Loader2 size={40} className="animate-spin text-[#DCAF01] opacity-60" />
        <p className="font-semibold text-[13px]">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade pb-10 text-left w-full">
      {/* Page Header */}
      <div className="flex items-center gap-4">
         <button 
           type="button"
           onClick={() => navigate(-1)}
           className="h-9 w-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
         >
            <ChevronLeft size={20} />
         </button>
         <PageHeader 
           title="Tambah Anggota Baru" 
           subtitle="Daftarkan anggota baru langsung ke sistem secara administratif."
         />
      </div>

      {/* Split Form Layout */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
         
         {/* LEFT COLUMN: Data Organisasi (5 columns) */}
         <div className="lg:col-span-5 space-y-6">
            <Card title="Data Organisasi" subtitle="Pengaturan wilayah dan status keanggotaan anggota baru.">
               <div className="space-y-5">
                  <Select 
                    label="Tipe Anggota"
                    value={formData.memberType}
                    onChange={(e: any) => setFormData({ ...formData, memberType: e.target.value })}
                    options={[
                      { label: 'Umum', value: 'umum' },
                      { label: 'Khusus', value: 'khusus' },
                      { label: 'Pencak Silat', value: 'pencak_silat' },
                    ]}
                  />
                  <Select 
                    label="Wilayah"
                    value={formData.regionId}
                    onChange={(e: any) => setFormData({ ...formData, regionId: e.target.value })}
                    options={[
                      { label: '-- Pilih Wilayah --', value: '' },
                      ...regions.map(r => ({ label: r.name, value: r.id }))
                    ]}
                  />
                  <Select 
                    label="Status Anggota"
                    value={formData.status}
                    onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                    options={[
                      { label: 'Aktif', value: 'ACTIVE' },
                      { label: 'Belum Aktif (Pending)', value: 'PENDING' },
                      { label: 'Nonaktif', value: 'INACTIVE' },
                    ]}
                  />
               </div>
            </Card>
         </div>

         {/* RIGHT COLUMN: Profil, Kontak & Domisili (Merged) (7 columns) */}
         <div className="lg:col-span-7 space-y-6">
            <Card title="Profil & Kontak Anggota" subtitle="Gabungan data identitas diri dan alamat domisili anggota baru.">
               <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <Input 
                       label="Nama Lengkap" 
                       value={formData.fullName}
                       onChange={(e: any) => setFormData({ ...formData, fullName: e.target.value })}
                       icon={<User size={16} />}
                       required
                     />
                     <Input 
                       label="Alamat Email" 
                       type="email"
                       value={formData.email}
                       onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
                       icon={<Mail size={16} />}
                       required
                     />
                     <Input 
                       label="Nomor Telepon" 
                       value={formData.phone}
                       onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })}
                       icon={<Phone size={16} />}
                     />
                     <Select 
                       label="Jenis Kelamin"
                       value={formData.gender}
                       onChange={(e: any) => setFormData({ ...formData, gender: e.target.value })}
                       options={[
                         { label: 'Laki-laki', value: 'Laki-laki' },
                         { label: 'Perempuan', value: 'Perempuan' },
                       ]}
                     />
                     <Input 
                       label="NIK (Nomor Induk Kependudukan)" 
                       value={formData.nik}
                       onChange={(e: any) => setFormData({ ...formData, nik: e.target.value })}
                     />
                     <Input 
                       label="Kata Sandi (Default: Padjadjaran123)" 
                       type="password"
                       placeholder="Padjadjaran123"
                       value={formData.password}
                       onChange={(e: any) => setFormData({ ...formData, password: e.target.value })}
                       icon={<Lock size={16} />}
                     />
                  </div>

                  <div className="space-y-1.5 text-left">
                     <label className="text-[13px] font-semibold text-gray-700">Alamat Lengkap Domisili</label>
                     <textarea 
                       rows={4}
                       value={formData.address}
                       onChange={(e: any) => setFormData({ ...formData, address: e.target.value })}
                       className="w-full p-4 bg-gray-50 border border-gray-200 rounded-md text-[13px] outline-none focus:border-[#DCAF01] transition-all font-medium leading-relaxed font-inter"
                       placeholder="Masukkan alamat domisili lengkap..."
                     />
                  </div>
               </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
               <Button variant="white" type="button" onClick={() => navigate('/app/admin-pusat/members')}>Batal</Button>
               <Button type="submit" isLoading={loading} className="px-10 font-semibold shadow-md shadow-[#DCAF01]/10">
                  <UserPlus size={18} className="mr-2" /> Daftarkan Anggota
               </Button>
            </div>
         </div>

      </form>
    </div>
  );
};

export default CreateMember;
