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
  Image as ImageIcon,
} from 'lucide-react';
import { cmsApi } from '../../../services/cmsApi';
import { toast } from '../../../stores/toastStore';
import ImageUpload from '../../../components/ui/ImageUpload';
import { cn } from '../../../utils/cn';

const GalleryForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [categories, setCategories] = useState<string[]>(['umum', 'kegiatan', 'prestasi', 'fasilitas']);
  const [selectedCategory, setSelectedCategory] = useState('umum');
  const [customCategory, setCustomCategory] = useState('');
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [status, setStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: 'umum',
    isActive: true,
  });

  useEffect(() => {
    fetchExistingCategories();
    if (isEdit) {
      fetchGallery();
    }
  }, [id]);

  const fetchExistingCategories = async () => {
    try {
      const res = await cmsApi.getGallery();
      const unwrapped = res.data?.data || res.data || [];
      const items = Array.isArray(unwrapped) ? unwrapped : [];
      const existingCats = Array.from(new Set(items.map((item: any) => item.category?.toLowerCase()).filter(Boolean) as string[]));
      
      setCategories(prev => {
        const combined = Array.from(new Set([...prev, ...existingCats]));
        return combined.sort();
      });
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const fetchGallery = async () => {
    try {
      setFetching(true);
      const res = await cmsApi.getGalleryById(id!);
      const item = res.data?.data || res.data;
      if (item) {
        setFormData({
          title: item.title,
          description: item.description || '',
          imageUrl: item.imageUrl,
          category: item.category || 'umum',
          isActive: item.isActive,
        });
        
        if (['umum', 'kegiatan', 'prestasi', 'fasilitas'].includes(item.category)) {
          setSelectedCategory(item.category);
        } else {
          setSelectedCategory('CREATE_NEW');
          setCustomCategory(item.category);
          setIsCreatingNewCategory(true);
        }
        
        setStatus(item.isActive ? 'Aktif' : 'Nonaktif');
      }
    } catch (err: any) {
      toast.error('Gagal mengambil data galeri');
      navigate('/app/admin-pusat/cms/gallery');
    } finally {
      setFetching(false);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCategory(val);
    if (val === 'CREATE_NEW') {
      setIsCreatingNewCategory(true);
    } else {
      setIsCreatingNewCategory(false);
      setFormData({ ...formData, category: val });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      toast.error('Harap unggah gambar galeri');
      return;
    }
    try {
      setLoading(true);
      const finalCategory = isCreatingNewCategory ? customCategory : selectedCategory;
      const payload = {
        ...formData,
        category: finalCategory,
        isActive: status === 'Aktif'
      };

      if (isEdit) {
        await cmsApi.updateGallery(id!, payload);
        toast.success('Galeri berhasil diperbarui');
      } else {
        await cmsApi.createGallery(payload);
        toast.success('Galeri berhasil ditambahkan');
      }
      navigate('/app/admin-pusat/cms/gallery');
    } catch (err: any) {
      toast.error('Gagal menyimpan galeri');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-4">
        <Loader2 className="animate-spin opacity-40" size={32} />
        <p className="text-[13px] font-medium font-inter">Memuat data galeri...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade pb-10 text-left font-inter">
      <div className="flex items-center gap-4">
        <button 
          type="button"
          onClick={() => navigate('/app/admin-pusat/cms/gallery')} 
          className="h-9 w-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-900 transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <PageHeader 
          title={isEdit ? "Edit Galeri" : "Tambah Foto Galeri"} 
          subtitle="Manajemen visual kegiatan perguruan untuk website utama." 
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           <div className="lg:col-span-8 space-y-6">
              <Card title="Informasi Visual" subtitle="Judul dan deskripsi lengkap kegiatan.">
                  <div className="space-y-6">
                     <div className="space-y-1.5 text-left">
                        <label className="text-[13px] font-medium text-gray-700 ml-1">Judul Foto / Kegiatan</label>
                        <Input 
                          required 
                          value={formData.title} 
                          onChange={(e) => setFormData({...formData, title: e.target.value})} 
                          placeholder="Contoh: Latihan Gabungan Nasional 2026" 
                        />
                     </div>
                     
                     <div className="space-y-1.5 text-left">
                        <label className="text-[13px] font-medium text-gray-700 block ml-1">Deskripsi Singkat (Opsional)</label>
                        <textarea 
                          className="w-full p-4 border-2 border-gray-100 rounded-xl text-[13px] font-medium outline-none focus:border-[#DCAF01] min-h-[150px] transition-all"
                          placeholder="Ceritakan momen dalam foto ini secara detail..."
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                     </div>
                  </div>
              </Card>
           </div>

           <div className="lg:col-span-4 space-y-6">
              <Card title="File & Metadata">
                  <div className="space-y-6 text-left">
                     <ImageUpload 
                       value={formData.imageUrl} 
                       onChange={(url) => setFormData({...formData, imageUrl: url})} 
                       label="File Foto" 
                       hint="JPG, PNG, WebP — Maks 5MB"
                       aspectHint="Rekomendasi 16:9 atau 4:3" 
                     />

                     <div className="pt-4 border-t border-gray-100 space-y-5">
                        <div className="space-y-1.5 text-left">
                           <label className="text-[13px] font-medium text-gray-700 block ml-1">Kategori Galeri</label>
                           <select 
                             value={selectedCategory} 
                             onChange={handleCategoryChange}
                             className="w-full px-3 h-11 bg-gray-50 border border-gray-200 rounded-md text-[13px] font-medium outline-none focus:border-[#DCAF01] focus:bg-white transition-all cursor-pointer"
                           >
                             {categories.map(cat => (
                               <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                             ))}
                             <option value="CREATE_NEW">[+] BUAT KATEGORI BARU</option>
                           </select>

                           {isCreatingNewCategory && (
                             <div className="pt-2 animate-fade">
                               <Input 
                                 label="Nama Kategori Baru" 
                                 placeholder="Misal: UKT, Pelantikan" 
                                 value={customCategory}
                                 onChange={(e) => setCustomCategory(e.target.value)}
                                 required
                               />
                             </div>
                           )}
                        </div>

                        <div className="space-y-1.5 text-left">
                          <label className="text-[13px] font-medium text-gray-700 block ml-1">Status Publikasi</label>
                          <Select 
                            value={status}
                            onChange={(e) => setStatus(e.target.value as 'Aktif' | 'Nonaktif')}
                            options={[
                              { label: 'Aktif (Tampil di Web)', value: 'Aktif' },
                              { label: 'Nonaktif (Sembunyikan)', value: 'Nonaktif' },
                            ]}
                          />
                        </div>
                     </div>
                  </div>
              </Card>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 text-left">
                 <ImageIcon size={18} className="text-blue-600 shrink-0 mt-0.5" />
                 <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                    Foto yang diterbitkan akan otomatis muncul pada halaman <strong>"Galeri"</strong> website utama secara instan.
                 </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                 <Button 
                   type="submit" 
                   className="w-full h-12 font-medium text-[14px] shadow-lg shadow-[#DCAF01]/10"
                   isLoading={loading}
                   icon={<Save size={18} />}
                 >
                   {isEdit ? 'Simpan Perubahan' : 'Terbitkan Foto'}
                 </Button>
                 <Button 
                   type="button" 
                   variant="white" 
                   className="w-full h-12 font-medium text-[13px] text-gray-400 border-gray-100 hover:text-gray-600 shadow-sm"
                   onClick={() => navigate('/app/admin-pusat/cms/gallery')}
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

export default GalleryForm;
