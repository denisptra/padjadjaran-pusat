import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { 
  ChevronLeft, 
  Save, 
  Megaphone,
  MessageSquare,
  Eye,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { toast } from '../../stores/toastStore';
import { useAuthStore } from '../../features/auth/stores/auth.store';
import { cn } from '../../utils/cn';
import { announcementApi } from '../../services/announcementApi';
import TinyMCEEditor from '../../components/ui/TinyMCEEditor';

const AnnouncementForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { role, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scope, setScope] = useState('national');
  const [status, setStatus] = useState<'Terbit' | 'Draf' | 'Nonaktif'>('Terbit');
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>(['Jawa Barat']);
  const [selectedCities, setSelectedCities] = useState<string[]>(['Kota Tasikmalaya']);

  useEffect(() => {
    if (isEdit && id) {
      const fetchAnnouncementData = async () => {
        try {
          setFetching(true);
          const res = await announcementApi.getById(id);
          const data = res.data;
          setTitle(data.title || '');
          setContent(data.content || '');
          setScope(data.scope || 'national');
          setStatus(data.status === 'published' ? 'Terbit' : data.status === 'draft' ? 'Draf' : 'Nonaktif');
          setShowModal(!!data.showModal);
        } catch (err) {
          toast.error('Gagal memuat data pengumuman.');
        } finally {
          setFetching(false);
        }
      };
      fetchAnnouncementData();
    }
  }, [id, isEdit]);

  const toggleProvince = (prov: string) => {
     if (selectedProvinces.includes(prov)) {
        setSelectedProvinces(prev => prev.filter(p => p !== prov));
     } else {
        setSelectedProvinces(prev => [...prev, prov]);
     }
  };

  const toggleCity = (city: string) => {
     if (selectedCities.includes(city)) {
        setSelectedCities(prev => prev.filter(c => c !== city));
     } else {
        setSelectedCities(prev => [...prev, city]);
     }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Judul pengumuman wajib diisi.');
      return;
    }

    try {
      setLoading(true);
      const apiStatus = status === 'Terbit' ? 'published' : status === 'Draf' ? 'draft' : 'inactive';
      const payload = {
        title,
        content,
        scope: role === 'admin_wilayah' ? 'wilayah' : scope,
        wilayahId: role === 'admin_wilayah' ? (user as any)?.wilayahId || '10' : (scope === 'wilayah' ? selectedCities[0] || '10' : undefined),
        status: apiStatus,
        showModal
      };

      if (isEdit && id) {
        await announcementApi.update(id, payload);
        toast.success('Pengumuman berhasil diperbarui.');
      } else {
        await announcementApi.create(payload);
        toast.success('Pengumuman berhasil dipublikasikan.');
      }
      navigate(-1);
    } catch (err) {
      toast.error('Gagal menyimpan pengumuman.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-4">
        <Loader2 size={32} className="animate-spin opacity-40" />
        <p className="text-[13px] font-medium">Memuat data pengumuman...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade pb-10 text-left">
      {/* Header */}
      <div className="flex items-center gap-4">
         <button 
           type="button"
           onClick={() => navigate(-1)}
           className="h-9 w-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
         >
            <ChevronLeft size={20} />
         </button>
         <PageHeader 
           title={isEdit ? "Edit Pengumuman" : "Buat Pengumuman Baru"} 
           subtitle={isEdit ? `Memperbarui pengumuman: ${title}` : "Publikasikan informasi resmi untuk anggota nasional atau wilayah tertentu."}
         />
      </div>

      {/* Main CMS Dual Column Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
        
        {/* LEFT COLUMN: Editor Workspace (Spacious 8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          <Card title="Workspace Editor Konten" subtitle="Tulis dan sesuaikan informasi pengumuman Anda.">
             <div className="space-y-6">
                <Input 
                  label="Judul Pengumuman" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masukkan judul yang jelas, singkat, dan menarik..."
                  icon={<Megaphone size={16} />}
                  required
                />
                
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide">
                    Isi Detail Pengumuman
                  </label>
                  <TinyMCEEditor 
                    value={content} 
                    onChange={setContent} 
                    placeholder="Tuliskan detail pengumuman di sini dengan kaya format..." 
                  />
                </div>
             </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Settings Sidebar (Neat 4 columns) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          
          {/* Publication Controls Sidebar */}
          <Card title="Pengaturan Publikasi" subtitle="Kelola cakupan & visibilitas.">
             <div className="space-y-6">
                
                {/* Scope Selection / Region Lock */}
                {role !== 'admin_wilayah' ? (
                  <div className="space-y-4">
                    <Select 
                      label="Cakupan Publikasi (Scope)"
                      value={scope}
                      onChange={(e) => setScope(e.target.value)}
                      options={[
                        { label: 'Nasional (Seluruh Indonesia)', value: 'national' },
                        { label: 'Wilayah Tertentu', value: 'wilayah' },
                      ]}
                    />
                    
                    {scope === 'wilayah' && (
                       <div className="space-y-4 pt-3 border-t border-gray-100 animate-fade">
                         {/* Province Targets */}
                         <div className="space-y-2 text-left">
                            <label className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide">Pilih Target Provinsi</label>
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md max-h-40 overflow-y-auto space-y-2.5 no-scrollbar">
                               {['Jawa Barat', 'DKI Jakarta', 'Banten', 'Jawa Tengah', 'Jawa Timur'].map((prov) => {
                                  const isSelected = selectedProvinces.includes(prov);
                                  return (
                                     <label key={prov} className="flex items-center gap-2.5 text-[12.5px] font-semibold text-gray-700 cursor-pointer select-none leading-none">
                                        <input 
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={() => toggleProvince(prov)}
                                          className="h-4 w-4 rounded border-gray-300 text-[#DCAF01] focus:ring-[#DCAF01]/20 cursor-pointer"
                                        />
                                        <span>{prov}</span>
                                     </label>
                                  );
                               })}
                            </div>
                         </div>

                         {/* City Targets */}
                         <div className="space-y-2 text-left">
                            <label className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide">Pilih Target Kota / Kabupaten</label>
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md max-h-40 overflow-y-auto space-y-2.5 no-scrollbar font-inter">
                               {['Kota Tasikmalaya', 'Kota Bandung', 'Kab. Garut', 'Kota Bogor', 'Kab. Ciamis', 'Kota Bekasi', 'Kota Cirebon'].map((city) => {
                                  const isSelected = selectedCities.includes(city);
                                  return (
                                     <label key={city} className="flex items-center gap-2.5 text-[12.5px] font-semibold text-gray-700 cursor-pointer select-none leading-none">
                                        <input 
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={() => toggleCity(city)}
                                          className="h-4 w-4 rounded border-gray-300 text-[#DCAF01] focus:ring-[#DCAF01]/20 cursor-pointer"
                                        />
                                        <span>{city}</span>
                                     </label>
                                  );
                               })}
                            </div>
                         </div>
                       </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide">
                      Cakupan Publikasi (Scope)
                    </label>
                    <div className="min-h-11 px-4 py-2 bg-amber-50 border border-amber-200 rounded-md flex items-center justify-between text-[12.5px] text-amber-900 font-semibold font-inter leading-tight">
                       <span>Khusus Wilayah Anda ({(user as any)?.wilayahName || 'Kota Tasikmalaya'})</span>
                       <span className="text-[8px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider shrink-0">LOCKED</span>
                    </div>
                  </div>
                )}

                {/* Status Selection */}
                <Select 
                  label="Status Publikasi"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Terbit' | 'Draf' | 'Nonaktif')}
                  options={[
                    { label: 'Terbit (Aktif)', value: 'Terbit' },
                    { label: 'Draf (Internal)', value: 'Draf' },
                    { label: 'Nonaktif', value: 'Nonaktif' },
                  ]}
                />

                {/* Engagement Trigger Options */}
                <div className="p-4 bg-gray-50 rounded border border-gray-200 space-y-4">
                   <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                         <MessageSquare size={16} className="text-blue-500" />
                         <span className="text-[11.5px] font-semibold text-gray-700 leading-none">Modal Pop-up Penting</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setShowModal(!showModal)}
                        className={cn(
                          "w-10 h-5 rounded-full relative transition-all border-0 cursor-pointer shadow-inner",
                          showModal ? "bg-[#DCAF01]" : "bg-gray-300"
                        )}
                      >
                         <div className={cn(
                           "absolute top-0.5 h-4 w-4 bg-white rounded-full transition-all shadow-md",
                           showModal ? "right-0.5" : "left-0.5"
                         )} />
                      </button>
                   </div>
                   <p className="text-[10px] text-gray-500 font-medium leading-normal">
                      Memunculkan pengumuman ini sebagai modal popup otomatis saat pengguna membuka dashboard pertama kali.
                   </p>
                </div>
             </div>
          </Card>

          {/* Action Control Panel */}
          <Card title="Aksi Kontrol" subtitle="Finalisasi pengumuman Anda.">
             <div className="space-y-3">
                <Button 
                  type="submit" 
                  isLoading={loading} 
                  className="w-full h-11 font-semibold shadow-md shadow-[#DCAF01]/10 flex items-center justify-center gap-2"
                >
                   <Save size={16} /> {isEdit ? 'Simpan Perubahan' : 'Publikasikan Sekarang'}
                </Button>
                <div className="grid grid-cols-2 gap-3">
                   <Button 
                     type="button" 
                     variant="white" 
                     onClick={() => navigate(-1)} 
                     className="h-10 text-[11.5px] font-semibold border-gray-200 hover:bg-gray-50 text-gray-600 flex items-center justify-center"
                   >
                      Batal
                   </Button>
                   <Button 
                     type="button" 
                     variant="white" 
                     className="h-10 text-[11.5px] font-semibold border-gray-200 hover:bg-gray-50 text-gray-600 flex items-center justify-center"
                   >
                      <Eye size={14} className="mr-1.5" /> Pratinjau
                   </Button>
                </div>
             </div>
          </Card>

          {/* Security details info */}
          <div className="p-4 bg-amber-50/50 border border-amber-100/80 rounded-lg flex gap-3 text-left">
             <ShieldCheck size={18} className="text-amber-600 shrink-0 mt-0.5" />
             <p className="text-[10.5px] text-amber-800 leading-normal font-medium italic">
                Setiap informasi yang dipublikasikan akan tercatat dalam log audit sistem untuk menjamin kepatuhan regulasi internal PPS Padjadjaran.
             </p>
          </div>
        </div>

      </form>
    </div>
  );
};

export default AnnouncementForm;
