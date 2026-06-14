import React, { useState } from 'react';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { 
  MapPin, 
  Phone, 
  User, 
  FileText, 
  Save, 
  Calendar,
  Users,
  ShieldCheck,
  Info,
  Clock,
  Loader2
} from 'lucide-react';
import { toast } from '../../../stores/toastStore';
import { regionApi } from '../../../services/regionApi';

const RegionProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [regionInfo, setRegionInfo] = useState<any>({});

  // Editable fields for Admin Wilayah
  const [formData, setFormData] = useState({
    leaderName: '',
    phone: '',
    address: '',
    description: '',
  });

  React.useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setFetching(true);
      const res = await regionApi.getProfile();
      const data = res.data?.data || res.data;
      
      setRegionInfo({
        name: data?.name || (user as any)?.wilayahName || 'Wilayah',
        code: data?.id?.substring(0, 8).toUpperCase() || '-',
        status: data?.isActive ? 'AKTIF' : 'NONAKTIF',
        totalMembers: data?._count?.members || 0,
        createdAt: data?.createdAt ? new Date(data.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'
      });

      // We might not have a separate table for leaderName/phone yet, so we use dummy data or empty if backend doesn't support
      // If we expand Region model later, we can map it here. For now, just set empty strings to allow them to type.
      setFormData({
        leaderName: data?.leaderName || '',
        phone: data?.phone || '',
        address: data?.address || '',
        description: data?.description || '',
      });
    } catch (error) {
      toast.error('Gagal memuat profil wilayah');
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Wait for backend to support updating these fields if needed
      await regionApi.updateProfile(formData);
      toast.success('Informasi profil wilayah berhasil diperbarui.');
    } catch (error) {
      toast.error('Fitur update profil sedang disiapkan atau terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-[#DCAF01]" size={32} /></div>;
  }

  return (
    <div className="space-y-8 animate-fade pb-10 text-left">
      <PageHeader 
        title="Profil Wilayah" 
        subtitle="Kelola informasi publik dan data kepengurusan operasional wilayah Anda."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Read-Only Info (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
           <Card title="Data Terkunci" subtitle="Informasi identitas wilayah permanen.">
              <div className="space-y-6">
                 <div className="flex flex-col items-center py-6 border-b border-gray-50">
                    <div className="h-20 w-20 rounded-xl bg-[#DCAF01]/10 text-[#DCAF01] flex items-center justify-center mb-4 border border-[#DCAF01]/20 shadow-inner">
                       <MapPin size={36} />
                    </div>
                    <h2 className="text-[20px] font-semibold text-gray-900 text-center uppercase tracking-tight">
                       {regionInfo.name}
                    </h2>
                    <p className="text-[12px] font-mono font-semibold text-gray-400 mt-1 uppercase tracking-widest">
                       KODE: {regionInfo.code}
                    </p>
                 </div>

                 <div className="grid grid-cols-1 gap-5">
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                       <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <ShieldCheck size={14} /> Status Wilayah
                       </span>
                       <Badge variant="success" className="font-semibold">{regionInfo.status}</Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                       <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <Users size={14} /> Jumlah Anggota
                       </span>
                       <span className="text-[14px] font-semibold text-gray-900">{regionInfo.totalMembers} Anggota</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                       <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <Calendar size={14} /> Tanggal Dibuat
                       </span>
                       <span className="text-[14px] font-semibold text-gray-900">{regionInfo.createdAt}</span>
                    </div>
                 </div>

                 <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex gap-3 text-gray-500">
                    <Info size={18} className="text-gray-400 shrink-0" />
                    <p className="text-[11px] leading-relaxed font-medium">
                       Data di atas bersifat permanen dan hanya dapat diubah melalui pengajuan resmi ke <strong>Admin Pusat</strong>.
                    </p>
                 </div>
              </div>
           </Card>
        </div>

        {/* RIGHT COLUMN: Editable Form (7 columns) */}
        <div className="lg:col-span-7">
           <form onSubmit={handleSave} className="space-y-6">
              <Card title="Informasi Kepengurusan" subtitle="Data operasional yang dapat diperbarui secara mandiri.">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input 
                       label="Nama Ketua / Pimpinan Wilayah"
                       value={formData.leaderName}
                       onChange={(e) => setFormData({...formData, leaderName: e.target.value})}
                       icon={<User size={16} />}
                       placeholder="Masukkan nama ketua..."
                       disabled
                    />
                    <Input 
                       label="Nomor Telepon Sekretariat"
                       value={formData.phone}
                       onChange={(e) => setFormData({...formData, phone: e.target.value})}
                       icon={<Phone size={16} />}
                       placeholder="Contoh: 0265-xxxxxx"
                       disabled
                    />
                    <div className="sm:col-span-2">
                       <Input 
                          label="Alamat Lengkap Sekretariat"
                          as="textarea"
                          rows={3}
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          icon={<MapPin size={16} />}
                          placeholder="Tuliskan alamat lengkap kantor sekretariat wilayah..."
                          disabled
                       />
                    </div>
                 </div>
              </Card>

              <Card title="Profil & Deskripsi" subtitle="Gunakan deskripsi menarik untuk memperkenalkan wilayah ke publik.">
                 <textarea 
                   className="w-full p-4 bg-white border border-gray-300 rounded-md text-[13px] outline-none focus:border-[#DCAF01] focus:ring-4 focus:ring-[#DCAF01]/5 transition-all font-medium leading-relaxed"
                   rows={6}
                   value={formData.description}
                   onChange={(e) => setFormData({...formData, description: e.target.value})}
                   placeholder="Tuliskan sejarah singkat, pencapaian, atau profil umum wilayah Anda..."
                 />
                 <p className="text-[11px] text-gray-400 mt-2 font-medium">
                    Deskripsi ini akan tampil di halaman daftar cabang pada website utama.
                 </p>
              </Card>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                 <Button variant="white" type="button" onClick={() => window.location.reload()} className="px-8 font-semibold border-gray-200">Batal</Button>
                 <Button type="submit" isLoading={loading} className="px-12 font-semibold shadow-md shadow-[#DCAF01]/10">
                    <Save size={18} className="mr-2" /> Perbarui Profil
                 </Button>
              </div>
           </form>
        </div>

      </div>
    </div>
  );
};

export default RegionProfilePage;

