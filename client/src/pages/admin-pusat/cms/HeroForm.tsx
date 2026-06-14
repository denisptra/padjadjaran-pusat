import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  AlertCircle,
  Settings2
} from 'lucide-react';
import { cmsApi } from '../../../services/cmsApi';
import { toast } from '../../../stores/toastStore';
import ImageUpload from '../../../components/ui/ImageUpload';

const HeroForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '',
    order: 0,
  });

  const [status, setStatus] = useState<'aktif' | 'nonaktif'>('aktif');

  useEffect(() => {
    if (isEdit) {
      fetchSlider();
    }
  }, [id]);

  const fetchSlider = async () => {
    try {
      setFetching(true);
      const res = await cmsApi.getHeroSliderById(id!);
      const item = res.data?.data || res.data;
      
      if (item) {
        setFormData({
          title: item.title || '',
          subtitle: item.subtitle || '',
          imageUrl: item.imageUrl || '',
          linkUrl: item.linkUrl || '',
          order: item.order || 0,
        });
        setStatus(item.isActive ? 'aktif' : 'nonaktif');
      }
    } catch (err: any) {
      toast.error('Gagal memuat data slider');
      navigate('/app/admin-pusat/cms/hero-slider');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imageUrl) {
        toast.error('Harap unggah gambar banner terlebih dahulu.');
        return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        isActive: status === 'aktif'
      };

      if (isEdit) {
        await cmsApi.updateHeroSlider(id!, payload);
        toast.success('Slider berhasil diperbarui');
      } else {
        await cmsApi.createHeroSlider(payload);
        toast.success('Slider baru berhasil ditambahkan');
      }
      navigate('/app/admin-pusat/cms/hero-slider');
    } catch (err: any) {
      toast.error('Gagal menyimpan slider');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-4">
        <Loader2 className="animate-spin opacity-40" size={32} />
        <p className="text-[13px] font-medium font-inter">Memuat data slider...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade pb-10 text-left font-inter">
      <div className="flex items-center gap-4">
        <button 
          type="button"
          onClick={() => navigate('/app/admin-pusat/cms/hero-slider')} 
          className="h-9 w-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-900 transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <PageHeader 
          title={isEdit ? "Edit hero slider" : "Tambah slide baru"} 
          subtitle="Visual utama yang muncul di halaman beranda PPS Padjadjaran." 
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           <div className="lg:col-span-8 space-y-6">
              <Card title="Konten Slide" subtitle="Informasi teks dan headline banner.">
                  <div className="space-y-6">
                     <div className="space-y-1.5 text-left">
                        <label className="text-[13px] font-medium text-gray-700 ml-1">Judul Utama (Headline)</label>
                        <Input 
                          required 
                          value={formData.title} 
                          onChange={(e) => setFormData({...formData, title: e.target.value})} 
                          placeholder="Contoh: Tradisi & Kekuatan PPS Padjadjaran" 
                        />
                     </div>
                     
                     <div className="space-y-1.5 text-left">
                        <label className="text-[13px] font-medium text-gray-700 block ml-1">Subtitle / Deskripsi</label>
                        <textarea 
                          className="w-full p-4 border-2 border-gray-100 rounded-xl text-[13px] font-medium outline-none focus:border-[#DCAF01] min-h-[120px] transition-all"
                          placeholder="Penjelasan singkat di bawah judul..."
                          value={formData.subtitle}
                          onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                        />
                     </div>

                     <div className="space-y-1.5 text-left">
                        <label className="text-[13px] font-medium text-gray-700 block ml-1">Tautan Tombol (URL)</label>
                        <Input 
                          value={formData.linkUrl} 
                          onChange={(e) => setFormData({...formData, linkUrl: e.target.value})} 
                          placeholder="https://example.com/info" 
                          icon={<Settings2 size={16} />}
                        />
                     </div>
                  </div>
              </Card>
           </div>

           <div className="lg:col-span-4 space-y-6">
              <Card title="Visual & Status">
                  <div className="space-y-6 text-left">
                     <ImageUpload 
                       value={formData.imageUrl} 
                       onChange={(url) => setFormData({...formData, imageUrl: url})} 
                       label="Gambar Banner" 
                       hint="JPG, PNG, WebP — Maks 5MB"
                       aspectHint="Rekomendasi 16:9"
                     />

                     <div className="pt-4 border-t border-gray-100 space-y-4">
                        <div className="space-y-1.5 text-left">
                           <label className="text-[13px] font-medium text-gray-700 ml-1">Urutan Tampil</label>
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
                 <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
                 <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                    Slide dengan urutan paling kecil akan muncul pertama kali. Pastikan visual memiliki kontras yang baik untuk teks headline.
                 </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                 <Button 
                   type="submit" 
                   className="w-full h-12 font-medium text-[14px] shadow-lg shadow-[#DCAF01]/10"
                   isLoading={loading}
                   icon={<Save size={18} />}
                 >
                   {isEdit ? 'Simpan Perubahan' : 'Terbitkan Slide'}
                 </Button>
                 <Button 
                   type="button" 
                   variant="white" 
                   className="w-full h-12 font-medium text-[13px] text-gray-400 border-gray-100 hover:text-gray-600 shadow-sm"
                   onClick={() => navigate('/app/admin-pusat/cms/hero-slider')}
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

export default HeroForm;
