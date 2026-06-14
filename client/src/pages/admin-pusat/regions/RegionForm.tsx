import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { 
  Save, 
  ArrowLeft, 
  Loader2, 
  ShieldCheck,
  User as UserIcon,
  Search,
  AlertCircle
} from 'lucide-react';
import { regionApi } from '../../../services/regionApi';
import { memberApi } from '../../../services/memberApi';
import { toast } from '../../../stores/toastStore';
import { cn } from '../../../utils/cn';
import { getSecureFileUrl } from '../../../services/api';

const RegionForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchingAdmins, setFetchingAdmins] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [provinces, setProvinces] = useState<any[]>([]);
  const [regionType, setRegionType] = useState<'LOKAL' | 'WNA'>('LOKAL');
  
  const [formData, setFormData] = useState({
    name: '',
    provinceId: '',
    isActive: true,
    adminId: '',
    leaderName: '',
    phone: '',
    description: '',
    address: '',
  });

  useEffect(() => {
    fetchProvinces();
    fetchPotentialAdmins();
    if (isEdit) {
      fetchRegion();
    }
  }, [id]);

  const fetchPotentialAdmins = async () => {
    if (!isEdit) {
      setAdmins([]);
      return;
    }
    
    try {
      setFetchingAdmins(true);
      // Fetch ONLY active members belonging to this specific region
      const res = await memberApi.getAll({ 
        limit: 500, 
        status: 'ACTIVE',
        regionId: id
      });
      const data = res.data?.data?.data || res.data?.data || res.data || [];
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch members for admin assignment', err);
    } finally {
      setFetchingAdmins(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      const res = await regionApi.getProvinces();
      const data = res.data?.data || res.data || [];
      setProvinces(data);
      
      // If creating new, set default local province (excluding 'Pusat' or WNA 'Luar Negeri')
      if (!isEdit) {
        const localDefault = data.find((p: any) => !p.isOverseas && p.name !== 'Pusat') || data.find((p: any) => !p.isOverseas);
        if (localDefault) {
          setFormData(prev => ({ ...prev, provinceId: localDefault.id }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch provinces', err);
    }
  };

  const fetchRegion = async () => {
    try {
      setLoading(true);
      const res = await regionApi.getById(id!);
      const data = res.data?.data || res.data;
      if (data) {
        setFormData({
          name: data.name || '',
          provinceId: data.provinceId || '',
          isActive: data.isActive ?? true,
          adminId: data.adminId || '',
          leaderName: data.leaderName || '',
          phone: data.phone || '',
          description: data.description || '',
          address: data.address || '',
        });
        
        if (data.province?.isOverseas || data.province?.name === 'Luar Negeri') {
          setRegionType('WNA');
        } else {
          setRegionType('LOKAL');
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(`Gagal memuat data wilayah: ${msg}`);
      navigate('/app/admin-pusat/regions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(regionType === 'LOKAL' ? 'Nama wilayah wajib diisi.' : 'Nama negara wajib diisi.');
      return;
    }
    if (regionType === 'LOKAL' && !formData.provinceId) {
      toast.error('Provinsi wajib dipilih.');
      return;
    }

    try {
      setSaving(true);
      let regionId = id;
      
      const payload = {
        name: formData.name,
        provinceId: formData.provinceId,
        isActive: formData.isActive,
        leaderName: formData.leaderName,
        phone: formData.phone,
        description: formData.description,
        address: formData.address,
      };

      if (isEdit) {
        await regionApi.update(id!, payload);
      } else {
        const res = await regionApi.create(payload);
        regionId = res.data?.data?.id || res.data?.id;
      }

      // Handle admin assignment if provided
      if (regionId && formData.adminId) {
         await regionApi.assignAdmin(regionId, formData.adminId);
      }

      toast.success(isEdit ? 'Wilayah berhasil diperbarui' : 'Wilayah berhasil ditambahkan');
      navigate('/app/admin-pusat/regions');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(`Gagal menyimpan data: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredAdmins = admins.filter(a => 
    (a.fullName || '').toLowerCase().includes(adminSearch.toLowerCase()) ||
    (a.user?.email || '').toLowerCase().includes(adminSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-4">
        <Loader2 className="animate-spin opacity-40" size={32} />
        <p className="text-[13px] font-medium font-inter">Memuat data wilayah...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade pb-10 text-left font-inter">
      <div className="flex items-center gap-4">
        <button 
          type="button"
          onClick={() => navigate('/app/admin-pusat/regions')}
          className="h-9 w-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-900 transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <PageHeader 
          title={isEdit ? "Edit Wilayah" : "Tambah Wilayah Baru"} 
          subtitle="Daftarkan wilayah operasional atau tentukan otoritas admin wilayah."
        />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-8 space-y-6">
          <Card title="Informasi Wilayah" subtitle="Detail nama wilayah operasional atau negara mitra.">
            <div className="space-y-6">
              {/* Region Type Selector */}
              <div className="space-y-1.5 text-left">
                <label className="text-[13px] font-semibold text-gray-700 ml-1">Kategori Wilayah</label>
                <div className="flex gap-6 mt-1 ml-1">
                   <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="regionType" 
                        value="LOKAL" 
                        checked={regionType === 'LOKAL'}
                        onChange={() => {
                          setRegionType('LOKAL');
                          const local = provinces.find(p => !p.isOverseas && p.name !== 'Pusat') || provinces.find(p => !p.isOverseas);
                          if (local) {
                            setFormData(prev => ({ ...prev, provinceId: local.id }));
                          }
                        }}
                        className="text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-[13px] font-medium text-gray-700">Lokal (Indonesia)</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="regionType" 
                        value="WNA" 
                        checked={regionType === 'WNA'}
                        onChange={() => {
                          setRegionType('WNA');
                          const overseas = provinces.find(p => p.isOverseas || p.name === 'Luar Negeri');
                          if (overseas) {
                            setFormData(prev => ({ ...prev, provinceId: overseas.id }));
                          }
                        }}
                        className="text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-[13px] font-medium text-gray-700">Luar Negeri (WNA)</span>
                   </label>
                </div>
              </div>

              {/* Province Dropdown - Local Only */}
              {regionType === 'LOKAL' && (
                <div className="space-y-1.5 text-left">
                  <label className="text-[13px] font-medium text-gray-700 ml-1">Provinsi Domisili *</label>
                  <select
                    required
                    className="w-full px-4 h-11 bg-white border border-gray-200 rounded-xl text-[13px] font-medium outline-none focus:border-[#DCAF01] transition-all"
                    value={formData.provinceId}
                    onChange={(e) => setFormData({ ...formData, provinceId: e.target.value })}
                  >
                    <option value="">Pilih Provinsi</option>
                    {provinces.filter(p => !p.isOverseas && p.name !== 'Pusat').map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5 text-left">
                <label className="text-[13px] font-medium text-gray-700 ml-1">
                  {regionType === 'LOKAL' ? 'Nama Wilayah / Kabupaten / Kota *' : 'Nama Negara *'}
                </label>
                <input 
                  type="text"
                  required
                  placeholder={regionType === 'LOKAL' ? "Contoh: Tasikmalaya atau Bandung" : "Contoh: Malaysia atau Singapore"}
                  className="w-full px-4 h-12 bg-white border border-gray-200 rounded-xl text-base font-medium outline-none focus:border-[#DCAF01] transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-gray-700 ml-1">Nama Pimpinan / Ketua Wilayah</label>
                  <input 
                    type="text"
                    placeholder="Nama lengkap pimpinan..."
                    className="w-full px-4 h-11 bg-white border border-gray-200 rounded-xl text-[13px] font-medium outline-none focus:border-[#DCAF01] transition-all"
                    value={formData.leaderName}
                    onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-gray-700 ml-1">Nomor Kontak Wilayah (WhatsApp)</label>
                  <input 
                    type="text"
                    placeholder="Contoh: 628..."
                    className="w-full px-4 h-11 bg-white border border-gray-200 rounded-xl text-[13px] font-medium outline-none focus:border-[#DCAF01] transition-all"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[13px] font-medium text-gray-700 ml-1">Deskripsi / Keterangan Wilayah</label>
                <textarea 
                  placeholder="Tulis keterangan atau profil singkat wilayah..."
                  className="w-full p-4 min-h-[100px] bg-white border border-gray-200 rounded-xl text-[13px] font-medium outline-none focus:border-[#DCAF01] transition-all resize-y"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[13px] font-medium text-gray-700 ml-1">Alamat Kantor / Sekretariat Wilayah</label>
                <textarea 
                  placeholder="Alamat lengkap sekretariat..."
                  className="w-full p-4 min-h-[80px] bg-white border border-gray-200 rounded-xl text-[13px] font-medium outline-none focus:border-[#DCAF01] transition-all resize-y"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <Card title="Penugasan Admin" subtitle="Pilih anggota untuk menjadi otoritas wilayah." noPadding className="border-0 shadow-none">
                 <div className="space-y-4">
                    <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                       <input 
                         type="text"
                         className="w-full pl-9 pr-4 h-10 bg-gray-50 border border-gray-200 rounded-lg text-[12px] outline-none focus:border-[#DCAF01] transition-all"
                         placeholder="Cari nama anggota untuk admin wilayah..."
                         value={adminSearch}
                         onChange={(e) => setAdminSearch(e.target.value)}
                       />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                       {fetchingAdmins ? (
                          <div className="col-span-2 py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto text-gray-300" /></div>
                       ) : !isEdit ? (
                          <div className="col-span-2 py-12 text-center text-gray-400 text-[12px] px-6 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                             <ShieldCheck size={28} className="mx-auto mb-3 text-gray-300" />
                             <p>Wilayah ini belum disimpan dan belum memiliki anggota.</p>
                             <p className="mt-1 text-gray-500">Silakan simpan wilayah ini terlebih dahulu. Setelah ada anggota yang mendaftar ke wilayah ini, Anda dapat menunjuknya sebagai Admin Wilayah melalui halaman Edit.</p>
                          </div>
                       ) : filteredAdmins.length > 0 ? (
                          filteredAdmins.map((adm) => (
                            <label key={adm.id} className={cn(
                              "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group",
                              formData.adminId === adm.userId ? "border-[#DCAF01] bg-[#DCAF01]/5 shadow-sm" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                            )}>
                               <input 
                                 type="radio"
                                 name="adminSelection"
                                 className="sr-only"
                                 checked={formData.adminId === adm.userId}
                                 onChange={() => setFormData({ ...formData, adminId: adm.userId })}
                               />
                               <div className="h-10 w-10 rounded-full bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                  {adm.photoUrl ? <img src={getSecureFileUrl(adm.photoUrl) || adm.photoUrl} className="h-full w-full object-cover" alt="" /> : <UserIcon size={16} className="text-gray-300" />}
                               </div>
                               <div className="flex-1 min-w-0">
                                  <p className={cn("text-[13px] font-bold truncate", formData.adminId === adm.userId ? "text-gray-900" : "text-gray-700")}>{adm.fullName}</p>
                                  <p className="text-[11px] text-gray-400 truncate">{adm.user?.email}</p>
                               </div>
                               {formData.adminId === adm.userId && (
                                  <div className="h-5 w-5 rounded-full bg-[#DCAF01] flex items-center justify-center text-white shrink-0">
                                     <ShieldCheck size={12} strokeWidth={3} />
                                  </div>
                               )}
                            </label>
                          ))
                       ) : (
                          <div className="col-span-2 py-10 text-center text-gray-400 italic text-[11px]">Anggota aktif tidak ditemukan.</div>
                       )}
                    </div>
                 </div>
              </Card>
            </div>
          </Card>
        </div>

        {/* Right Column: Status & Actions */}
        <div className="lg:col-span-4 space-y-6">
           <Card title="Status & Otoritas">
              <div className="space-y-6 text-left">
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="space-y-0.5">
                       <p className="text-[13px] font-medium text-gray-900">Aktifkan Wilayah</p>
                       <p className="text-[11px] text-gray-400 font-normal leading-tight">Dapat dipilih saat pendaftaran</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                 </div>

                 <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
                    <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                       Admin Wilayah memiliki wewenang untuk mengelola data anggota dan menyetujui pendaftaran di wilayahnya masing-masing.
                    </p>
                 </div>

                 <div className="flex flex-col gap-3 pt-2">
                    <Button 
                      type="submit" 
                      className="w-full h-12 font-medium text-[14px] shadow-lg shadow-[#DCAF01]/10"
                      isLoading={saving}
                      icon={<Save size={18} />}
                    >
                      {isEdit ? 'Simpan Perubahan' : 'Daftarkan Wilayah'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="white" 
                      className="w-full h-12 font-medium text-[13px] text-gray-400 border-gray-100 hover:text-gray-600 shadow-sm"
                      onClick={() => navigate('/app/admin-pusat/regions')}
                    >
                      Batalkan
                    </Button>
                 </div>
              </div>
           </Card>
        </div>
      </form>
    </div>
  );
};

export default RegionForm;
