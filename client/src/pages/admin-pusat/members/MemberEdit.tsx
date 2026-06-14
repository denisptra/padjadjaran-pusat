import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import { 
  Save, 
  ChevronLeft, 
  Loader2, 
  MapPin,
  ShieldCheck,
  Phone,
  Mail,
  Home,
  User as UserIcon,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { memberApi } from '@/services/memberApi';
import { toast } from '../../../stores/toastStore';

const EditMember: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    memberType: '',
    gender: '',
    birthPlace: '',
    birthDate: '',
  });

  useEffect(() => {
    fetchMember();
  }, [id]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const res = await memberApi.getById(id!);
      const data = res.data?.data || res.data;
      setFormData({
        fullName: data.fullName || '',
        phone: data.phone || '',
        address: data.address || '',
        memberType: data.memberType || '',
        gender: data.gender || 'Laki-laki',
        birthPlace: data.birthPlace || '',
        birthDate: data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : '',
      });
    } catch (err) {
      toast.error('Gagal mengambil data anggota');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await memberApi.update(id!, formData);
      toast.success('Profil anggota berhasil diperbarui');
      navigate(-1);
    } catch (err) {
      toast.error('Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade pb-10 text-left">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="h-10 w-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm transition-all">
          <ChevronLeft size={20} />
        </button>
        <PageHeader title="Edit Profil Anggota" subtitle="Perbarui data biodata resmi anggota." />
      </div>

      <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-6">
        <Card title="Biodata Utama" subtitle="Informasi identitas yang dapat diubah.">
           <div className="space-y-5">
              {loading ? (
                <>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-11 w-full rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-11 w-full rounded-xl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-11 w-full rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-11 w-full rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                  </div>
                </>
              ) : (
                <>
                  <Input label="Nama Lengkap" required value={formData.fullName} onChange={(e: any) => setFormData({...formData, fullName: e.target.value.toUpperCase()})} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="No. WhatsApp" required value={formData.phone} onChange={(e: any) => setFormData({...formData, phone: e.target.value})} />
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Jenis Kelamin</label>
                        <select 
                          className="w-full h-11 px-4 border-2 border-gray-100 rounded-xl text-[13px] font-semibold outline-none focus:border-[#DCAF01]"
                          value={formData.gender}
                          onChange={(e: any) => setFormData({...formData, gender: e.target.value})}
                        >
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Tempat Lahir" value={formData.birthPlace} onChange={(e: any) => setFormData({...formData, birthPlace: e.target.value.toUpperCase()})} />
                    <Input label="Tanggal Lahir" type="date" value={formData.birthDate} onChange={(e: any) => setFormData({...formData, birthDate: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Alamat Domisili</label>
                    <textarea 
                      className="w-full p-4 border-2 border-gray-100 rounded-2xl text-[13px] font-medium outline-none focus:border-[#DCAF01] min-h-[100px]"
                      value={formData.address}
                      onChange={(e: any) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </>
              )}
           </div>
        </Card>

        <div className="flex justify-end gap-3">
           <Button variant="white" type="button" onClick={() => navigate(-1)}>Batalkan</Button>
           <Button type="submit" isLoading={saving} icon={<Save size={18} />}>Simpan Perubahan</Button>
        </div>
      </form>

      <div className="p-5 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-4 max-w-4xl mx-auto">
         <AlertCircle className="text-amber-500 shrink-0" size={24} />
         <p className="text-[12px] text-amber-700 font-medium leading-relaxed">Perubahan pada nama lengkap akan berdampak pada tampilan di **E-KTA**. Pastikan data sudah benar sebelum menyimpan.</p>
      </div>
    </div>
  );
};

export default EditMember;
EditMember;
