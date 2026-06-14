import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import ImageUpload from '../../../components/ui/ImageUpload';
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Award
} from 'lucide-react';
import { toast } from '../../../stores/toastStore';
import { cmsApi } from '../../../services/cmsApi';

const GuruBesarForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    imageUrl: '',
    order: 0,
  });

  const [status, setStatus] = useState<'aktif' | 'nonaktif'>('aktif');

  useEffect(() => {
    if (isEdit) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    try {
      setFetching(true);
      const res = await cmsApi.getGuruBesarById(id!);
      const item = res.data?.data || res.data;

      if (item) {
        setFormData({
          name: item.name || '',
          title: item.title || '',
          description: item.description || '',
          imageUrl: item.imageUrl || '',
          order: item.order || 0,
        });
        setStatus(item.isActive ? 'aktif' : 'nonaktif');
      }
    } catch (err: any) {
      toast.error('Gagal memuat data profil');
      navigate('/app/admin-pusat/cms/guru-besar');
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...formData,
        isActive: status === 'aktif'
      };

      if (isEdit) {
        await cmsApi.updateGuruBesar(id!, payload);
        toast.success('Data diperbarui');
      } else {
        await cmsApi.createGuruBesar(payload);
        toast.success('Data ditambahkan');
      }
      navigate('/app/admin-pusat/cms/guru-besar');
    } catch (err: any) {
      toast.error('Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-4">
        <Loader2 size={32} className="animate-spin opacity-40" />
        <p className="text-[13px] font-medium">Memuat data profil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade pb-10 text-left font-inter">
      <div className="flex items-center gap-4">
        <button 
          type="button"
          onClick={() => navigate('/app/admin-pusat/cms/guru-besar')} 
          className="h-9 w-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <PageHeader 
          title={isEdit ? "Edit guru besar" : "Tambah guru besar"} 
          subtitle="Kelola profil tokoh dan guru besar PPS Padjadjaran." 
        />
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           <div className="lg:col-span-8 space-y-6">
              <Card title="Profil Guru Besar" subtitle="Nama, gelar, dan biografi lengkap.">
                  <div className="space-y-6">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 text-left">
                           <label className="text-[13px] font-medium text-gray-700 ml-1">Nama Lengkap</label>
                           <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Masukkan nama lengkap..." />
                        </div>
                        <div className="space-y-1.5 text-left">
                           <label className="text-[13px] font-medium text-gray-700 ml-1">Gelar / Jabatan</label>
                           <Input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Contoh: Guru Besar Utama" />
                        </div>
                     </div>
                  </div>
              </Card>
           </div>

           <div className="lg:col-span-4 space-y-6">
              <Card title="Foto & Status">
                  <div className="space-y-6 text-left">
                     <ImageUpload 
                       value={formData.imageUrl} 
                       onChange={(val) => setFormData({...formData, imageUrl: val})} 
                       label="Foto Profil Resmi" 
                       hint="JPG, PNG, WebP — Maks 5MB"
                       aspectHint="Rekomendasi 1:1 atau 4:5"
                     />

                     <div className="pt-4 border-t border-gray-100 space-y-4">
                        <div className="space-y-1.5 text-left">
                           <label className="text-[13px] font-medium text-gray-700 ml-1">Urutan Tampilan</label>
                           <Input 
                             type="number" 
                             value={formData.order} 
                             onChange={(e) => setFormData({...formData, order: Number(e.target.value)})} 
                           />
                        </div>

                        <div className="space-y-1.5 text-left">
                          <label className="text-[13px] font-medium text-gray-700 block ml-1">Status Publikasi</label>
                          <Select 
                            value={status}
                            onChange={(e) => setStatus(e.target.value as 'aktif' | 'nonaktif')}
                            options={[
                              { label: 'Aktif (Tampil di Web)', value: 'aktif' },
                              { label: 'Nonaktif (Sembunyikan)', value: 'nonaktif' },
                            ]}
                          />
                        </div>
                     </div>
                  </div>
              </Card>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 text-left">
                 <Award size={18} className="text-blue-600 shrink-0 mt-0.5" />
                 <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                    Profil guru besar akan ditampilkan secara publik di halaman "Tentang Kami". Pastikan informasi biografi akurat.
                 </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                 <Button 
                   type="submit" 
                   className="w-full h-12 font-medium text-[14px] shadow-lg shadow-[#DCAF01]/10"
                   isLoading={loading}
                   icon={<Save size={18} />}
                 >
                   {isEdit ? 'Simpan Perubahan' : 'Tambahkan Profil'}
                 </Button>
                 <Button 
                   type="button" 
                   variant="white" 
                   className="w-full h-12 font-medium text-[13px] text-gray-400 border-gray-100 hover:text-gray-600 shadow-sm"
                   onClick={() => navigate('/app/admin-pusat/cms/guru-besar')}
                 >
                   Batalkan
                 </Button>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
};

export default GuruBesarForm;
