import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import ImageUpload from '../../../components/ui/ImageUpload';
import { 
  ChevronLeft, 
  Save, 
  Globe,
  Loader2,
  Newspaper,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { toast } from '../../../stores/toastStore';
import TinyMCEEditor from '../../../components/ui/TinyMCEEditor';
import { cmsApi } from '../../../services/cmsApi';
import { cn } from '../../../utils/cn';

const NewsForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const isEdit = !!id;

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'BERITA' | 'ARTIKEL'>('BERITA');
  const [selectedCategory, setSelectedCategory] = useState('Kegiatan');
  const [customCategory, setCustomCategory] = useState('');
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [status, setStatus] = useState<'Terbit' | 'Draf'>('Terbit');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchItemData();
    }
  }, [id]);

  const fetchItemData = async () => {
    try {
      setFetching(true);
      const res = await cmsApi.getPublicationById(id!);
      const found = res.data?.data || res.data;

      if (found) {
        setTitle(found.title || '');
        setType(found.type);
        setSelectedCategory(found.category || 'Kegiatan');
        setStatus(found.isPublished ? 'Terbit' : 'Draf');
        setContent(found.content || '');
        setImageUrl(found.imageUrl || '');
        setSlug(found.slug || found.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      }
    } catch (err: any) {
      toast.error('Gagal memuat data konten');
    } finally {
      setFetching(false);
    }
  };

  const categoriesList = [
    { label: 'Prestasi', value: 'Prestasi' },
    { label: 'Kegiatan', value: 'Kegiatan' },
    { label: 'Pendaftaran', value: 'Pendaftaran' },
    { label: 'Wawasan', value: 'Wawasan' },
    { label: 'Budaya', value: 'Budaya' },
    { label: 'Kesehatan', value: 'Kesehatan' },
    { label: 'Umum', value: 'Umum' },
    { label: '[+] Buat Kategori Baru', value: 'CREATE_NEW' }
  ];

  const convertToSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManual) {
      setSlug(convertToSlug(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlug(convertToSlug(val));
    setIsSlugManual(true);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCategory(val);
    setIsCreatingNewCategory(val === 'CREATE_NEW');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Judul dan isi konten wajib diisi.');
      return;
    }

    try {
      setLoading(true);
      const isPublished = status === 'Terbit';
      const finalCategory = isCreatingNewCategory ? customCategory : selectedCategory;
      const payload = {
        title,
        slug,
        content,
        type,
        category: finalCategory || 'Umum',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800',
        isPublished,
      };

      if (isEdit) {
        await cmsApi.updatePublication(id!, payload);
        toast.success(`Konten berhasil diperbarui.`);
      } else {
        await cmsApi.createPublication(payload);
        toast.success(`Konten berhasil dipublikasikan.`);
      }
      navigate('/app/admin-pusat/cms/news');
    } catch (err: any) {
      toast.error('Gagal menyimpan konten');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-4">
        <Loader2 size={32} className="animate-spin opacity-40" />
        <p className="text-[13px] font-medium">Memuat data konten...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade pb-10 text-left font-inter">
      <div className="flex items-center gap-4">
         <button 
           type="button"
           onClick={() => navigate('/app/admin-pusat/cms/news')}
           className="h-9 w-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer shadow-sm"
         >
            <ArrowLeft size={20} />
         </button>
         <PageHeader 
           title={isEdit ? `Edit ${type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}` : "Tambah Publikasi Baru"} 
           subtitle="Kelola dan publikasikan wawasan, artikel edukatif, atau informasi berita kegiatan resmi."
         />
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 space-y-6">
              <Card title="Workspace Konten" subtitle="Tuliskan judul utama dan isi lengkap tulisan Anda.">
                  <div className="space-y-6">
                     <div className="space-y-1.5 text-left">
                        <label className="text-[13px] font-medium text-gray-700 ml-1">Judul Utama Publikasi</label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          placeholder="Tuliskan judul yang menarik dan informatif..."
                          className="w-full px-4 h-12 bg-white border border-gray-200 rounded-xl text-base font-medium outline-none focus:border-[#DCAF01] transition-all"
                          required
                        />
                     </div>
                     
                     <div className="space-y-1.5 text-left">
                        <label className="text-[13px] font-medium text-gray-700 block ml-1">Isi Konten Lengkap</label>
                        <TinyMCEEditor 
                          value={content}
                          onChange={setContent}
                          placeholder="Tuliskan artikel atau berita detail di sini..."
                        />
                     </div>
                  </div>
              </Card>
           </div>

           <div className="lg:col-span-4 space-y-6">
              <Card title="Publikasi & Visual">
                  <div className="space-y-6">
                     <div className="space-y-1.5 text-left">
                       <label className="text-[13px] font-medium text-gray-700 block ml-1">Status Rilis</label>
                       <Select 
                         value={status}
                         onChange={(e) => setStatus(e.target.value as 'Terbit' | 'Draf')}
                         options={[
                           { label: 'Terbitkan Sekarang', value: 'Terbit' },
                           { label: 'Simpan sebagai Draf', value: 'Draf' },
                         ]}
                       />
                     </div>

                     <div className="pt-2">
                        <ImageUpload 
                          value={imageUrl}
                          onChange={setImageUrl}
                          label="Gambar Unggulan"
                          hint="JPG, PNG, WebP — Maks 5MB"
                          aspectHint="Rekomendasi 16:9"
                        />
                     </div>

                     <div className="pt-4 border-t border-gray-100 space-y-5">
                        <div className="space-y-1.5 text-left">
                          <label className="text-[13px] font-medium text-gray-700 block ml-1">Tipe Publikasi</label>
                          <div className="grid grid-cols-2 gap-2">
                             {['BERITA', 'ARTIKEL'].map((t) => (
                               <button
                                 key={t}
                                 type="button"
                                 onClick={() => setType(t as any)}
                                 className={cn(
                                   "py-2 rounded-lg border-2 text-[11px] font-bold transition-all",
                                   type === t ? "border-[#DCAF01] bg-[#DCAF01]/5 text-gray-900" : "border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200"
                                 )}
                               >
                                 {t}
                               </button>
                             ))}
                          </div>
                        </div>

                        <div className="space-y-1.5 text-left">
                           <label className="text-[13px] font-medium text-gray-700 block ml-1">Kategori Konten</label>
                           <select 
                             value={selectedCategory} 
                             onChange={handleCategoryChange}
                             className="w-full px-3 h-11 bg-gray-50 border border-gray-200 rounded-md text-[13px] font-medium outline-none focus:border-[#DCAF01] focus:bg-white transition-all cursor-pointer"
                           >
                             {categoriesList.map(opt => (
                               <option key={opt.value} value={opt.value}>{opt.label}</option>
                             ))}
                           </select>

                           {isCreatingNewCategory && (
                             <div className="pt-2 animate-fade">
                               <Input 
                                 label="Kategori Baru" 
                                 placeholder="Misal: Filosofi, Latihan" 
                                 value={customCategory}
                                 onChange={(e) => setCustomCategory(e.target.value)}
                                 required
                               />
                             </div>
                           )}
                        </div>

                        <div className="space-y-1.5 text-left">
                           <label className="text-[13px] font-medium text-gray-700 block ml-1">URL Slug Tautan</label>
                           <input 
                             type="text" 
                             value={slug}
                             onChange={(e) => handleSlugChange(e.target.value)}
                             placeholder="url-slug-konten" 
                             className="w-full px-4 h-11 bg-gray-50 border border-gray-200 rounded-md text-[12px] font-mono outline-none focus:border-[#DCAF01] focus:bg-white transition-all text-gray-600"
                             required
                           />
                        </div>
                     </div>
                  </div>
              </Card>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 text-left">
                 <Globe size={18} className="text-blue-600 shrink-0 mt-0.5" />
                 <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                    Konten berstatus <strong>Terbit</strong> akan otomatis dirilis dan tersinkron ke halaman <strong>"Publikasi"</strong> di website utama secara instan.
                 </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                 <Button 
                   type="submit" 
                   className="w-full h-12 font-medium text-[14px] shadow-lg shadow-[#DCAF01]/10"
                   isLoading={loading}
                   icon={<Save size={18} />}
                 >
                   {isEdit ? 'Simpan Perubahan' : 'Terbitkan Sekarang'}
                 </Button>
                 <Button 
                   type="button" 
                   variant="white" 
                   className="w-full h-12 font-medium text-[13px] text-gray-400 border-gray-100 hover:text-gray-600 shadow-sm"
                   onClick={() => navigate('/app/admin-pusat/cms/news')}
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

export default NewsForm;
