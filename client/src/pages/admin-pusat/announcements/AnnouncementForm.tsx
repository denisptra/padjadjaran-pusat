import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import TinyMCEEditor from '../../../components/ui/TinyMCEEditor';
import { 
  Save, 
  ArrowLeft, 
  Loader2, 
  Globe, 
  Map as MapIcon, 
  MapPin,
} from 'lucide-react';
import { announcementApi } from '../../../services/announcementApi';
import { regionApi } from '../../../services/regionApi';
import { toast } from '../../../stores/toastStore';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { cn } from '../../../utils/cn';
import Select from '../../../components/ui/Select';

const AnnouncementForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isEdit = !!id;
  
  const isAdminWilayah = user?.role === 'admin_wilayah';
  const basePath = isAdminWilayah ? '/app/admin-wilayah' : '/app/admin-pusat';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scope, setScope] = useState<'national' | 'region'>(isAdminWilayah ? 'region' : 'national');
  const [targetRegions, setTargetRegions] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchLocationData();
    if (isEdit) {
      fetchAnnouncement();
    }
  }, [id]);

  const toTitleCase = (str: string) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const fetchLocationData = async () => {
    try {
      const [provRes, regRes] = await Promise.all([
        regionApi.getProvinces(),
        regionApi.getAll({ limit: 1000 })
      ]);
      
      const provData = provRes.data?.data?.data || provRes.data?.data || provRes.data || [];
      const regData = regRes.data?.data?.data || regRes.data?.data || regRes.data || [];
      
      setProvinces(Array.isArray(provData) ? provData : []);
      setRegions(Array.isArray(regData) ? regData : []);
    } catch (err) {
      console.error('Failed to fetch location data', err);
    }
  };

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const res = await announcementApi.getById(id!);
      const data = res.data?.data || res.data;
      
      if (data) {
        setTitle(data.title || '');
        setContent(data.content || '');
        setScope(data.scope || (isAdminWilayah ? 'region' : 'national'));
        setTargetRegions(data.targetRegions || []);
        setIsPublished(data.isPublished ?? true);
        setShowModal(data.showModal ?? false);
      }
    } catch (err: any) {
      toast.error('Gagal mengambil data pengumuman');
      navigate(`${basePath}/announcements`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTarget = (targetId: string) => {
    setTargetRegions(prev => {
      const current = [...prev];
      const index = current.indexOf(targetId);
      
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(targetId);
      }
      
      return current;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Judul pengumuman wajib diisi.');
      return;
    }

    if (scope === 'region' && targetRegions.length === 0 && !isAdminWilayah) {
      toast.error('Pilih setidaknya satu wilayah target.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title,
        content,
        scope,
        targetRegions,
        isPublished,
        showModal,
        targetProvinces: []
      };

      if (isEdit) {
        await announcementApi.update(id!, payload);
        toast.success('Pengumuman diperbarui');
      } else {
        await announcementApi.create(payload);
        toast.success('Pengumuman berhasil dibuat');
      }
      navigate(`${basePath}/announcements`);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(`Gagal menyimpan: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-4">
        <Loader2 className="animate-spin opacity-40" size={32} />
        <p className="text-[13px] font-medium font-inter">Memuat data pengumuman...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade pb-10 text-left font-inter">
      <div className="flex items-center gap-4">
        <button 
          type="button"
          onClick={() => navigate(`${basePath}/announcements`)}
          className="h-9 w-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-900 transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <PageHeader 
          title={isEdit ? "Edit Pengumuman" : "Buat Pengumuman Baru"} 
          subtitle={isAdminWilayah ? "Kirim pengumuman khusus untuk anggota di wilayah Anda." : "Tentukan target audiens dan isi informasi resmi nasional."}
        />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6 text-[13px] font-medium">
          <Card title="Konten Pengumuman" subtitle="Tulis judul dan isi pesan dengan format kalimat.">
            <div className="space-y-6 font-inter text-left">
               <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-gray-700 ml-1">Judul Utama</label>
                  <input 
                    type="text"
                    required
                    placeholder="Contoh: Jadwal Pelantikan Anggota Baru 2026"
                    className="w-full px-4 h-12 bg-white border border-gray-200 rounded-xl text-base font-medium outline-none focus:border-[#DCAF01] transition-all"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-gray-700 block ml-1">Isi Pesan Lengkap</label>
                  <TinyMCEEditor 
                    placeholder="Tulis pesan lengkap di sini..."
                    value={content}
                    onChange={(val) => setContent(val)}
                  />
               </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6 text-[13px] font-medium">
          <Card title="Target Audiens" subtitle={isAdminWilayah ? "Cakupan wilayah Anda" : "Pilih jangkauan pembaca."}>
            <div className="space-y-6">
               {!isAdminWilayah ? (
                 <>
                   <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'national', label: 'Nasional', icon: <Globe size={18} /> },
                        { id: 'region', label: 'Kota/Kab', icon: <MapPin size={18} /> },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setScope(s.id as any)}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1 text-center font-medium",
                            scope === s.id 
                              ? "border-[#DCAF01] bg-[#DCAF01]/5 text-gray-900" 
                              : "border-gray-50 bg-gray-50/50 text-gray-400 hover:border-gray-200"
                          )}
                        >
                          {s.icon}
                          <span className="text-[11px] font-medium">{s.label}</span>
                        </button>
                      ))}
                   </div>

                   {scope === 'region' && (
                     <div className="space-y-4 animate-fade">
                        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Pilih Wilayah Target</p>
                        <div className="grid grid-cols-1 gap-6 p-1">
                           {provinces.map((province) => {
                             const provinceRegions = regions.filter(r => r.provinceId === province.id);
                             if (provinceRegions.length === 0) return null;

                             return (
                               <div key={province.id} className="space-y-3">
                                  <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-md border border-gray-100 shadow-sm">
                                     <MapIcon size={12} className="text-[#DCAF01]" />
                                     <span className="text-[10px] font-bold text-gray-900 tracking-tighter uppercase italic">{toTitleCase(province.name)}</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-1.5 ml-1">
                                     {provinceRegions.map((r) => (
                                       <label key={r.id} className={cn(
                                         "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all",
                                         targetRegions.includes(r.id) ? "border-blue-200 bg-blue-50" : "border-transparent hover:bg-gray-50"
                                       )}>
                                          <input 
                                            type="checkbox" 
                                            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                                            checked={targetRegions.includes(r.id)}
                                            onChange={() => handleToggleTarget(r.id)}
                                          />
                                          <span className="text-[10px] font-medium text-gray-700 leading-none truncate" title={toTitleCase(r.name)}>{toTitleCase(r.name)}</span>
                                       </label>
                                     ))}
                                  </div>
                               </div>
                             );
                           })}
                        </div>
                     </div>
                   )}

                   {scope === 'national' && (
                     <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3 animate-fade">
                        <Globe className="text-blue-500 shrink-0" size={18} />
                        <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                          Target <strong>Nasional</strong> berarti pengumuman akan muncul di seluruh dashboard anggota tanpa pengecualian wilayah.
                        </p>
                     </div>
                   )}
                 </>
               ) : (
                 <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 animate-fade">
                    <MapPin className="text-emerald-500 shrink-0" size={18} />
                    <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
                      Sebagai <strong>Admin Wilayah</strong>, pengumuman ini secara otomatis akan dikirimkan kepada seluruh anggota yang terdaftar di wilayah Anda.
                    </p>
                 </div>
               )}
            </div>
          </Card>

          <Card title="Konfigurasi Rilis" subtitle="Pengaturan rilis dan interaksi.">
              <div className="space-y-5 font-medium">
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                    <div className="space-y-0.5 text-left">
                       <p className="text-[13px] font-medium text-gray-900">Aktifkan Pop-up</p>
                       <p className="text-[11px] text-gray-400 font-normal leading-tight">Muncul otomatis saat login</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={showModal}
                        onChange={(e) => setShowModal(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                    </label>
                 </div>

                 <div className="space-y-2 text-left">
                    <label className="text-[12px] font-medium text-gray-700 ml-1">Status Publikasi</label>
                    <Select 
                      value={isPublished ? 'Terbit' : 'Draf'}
                      onChange={(e) => setIsPublished(e.target.value === 'Terbit')}
                      options={[
                        { label: 'Terbitkan Sekarang', value: 'Terbit' },
                        { label: 'Simpan sebagai Draf', value: 'Draf' },
                      ]}
                    />
                 </div>
              </div>
          </Card>

          <div className="flex flex-col gap-3 pt-2">
             <Button 
               type="submit" 
               className="w-full h-12 font-medium text-[14px] shadow-lg shadow-[#DCAF01]/10"
               isLoading={saving}
               icon={<Save size={18} />}
             >
               {isEdit ? 'Simpan Perubahan' : 'Terbitkan Sekarang'}
             </Button>
             <Button 
               type="button" 
               variant="white" 
               className="w-full h-12 font-medium text-[13px] text-gray-400 border-gray-100 hover:text-gray-600 shadow-sm"
               onClick={() => navigate(`${basePath}/announcements`)}
             >
               Batalkan
             </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AnnouncementForm;
