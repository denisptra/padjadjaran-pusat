import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import StatCard from '../../../components/ui/StatCard';
import { 
  MapPin, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  Users,
  ShieldAlert,
  ShieldCheck,
  CheckSquare,
  Square
} from 'lucide-react';
import { regionApi } from '../../../services/regionApi';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { toast } from '../../../stores/toastStore';
import { cn } from '../../../utils/cn';
import DataTable from '../../../components/ui/DataTable';
import { ActionIconButton } from '../../../components/ui/ActionIconButton';
import { getSecureFileUrl } from '../../../services/api';
import Select from '../../../components/ui/Select';
import Card from '../../../components/ui/Card';

const Regions: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Regions State
  const [regions, setRegions] = useState<any[]>([]);
  const [regionMeta, setRegionMeta] = useState<any>({ total: 0 });
  const [regionSearch, setRegionSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [confirmDelete, setConfirmDelete] = useState<any>(null);

  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  useEffect(() => {
    fetchRegions();
  }, [regionSearch]);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const res = await regionApi.getAll({ limit: 100, search: regionSearch });
      const unwrapped = res.data?.data?.data || res.data?.data || res.data || [];
      const meta = res.data?.data?.meta || res.data?.meta;
      setRegions(Array.isArray(unwrapped) ? unwrapped : []);
      if (meta) setRegionMeta(meta);
    } catch (err: any) {
      toast.error('Gagal memuat data wilayah');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await regionApi.deactivate(id);
      toast.success('Wilayah berhasil dinonaktifkan');
      fetchRegions();
    } catch (err) {
      toast.error('Gagal menonaktifkan wilayah');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await regionApi.activate(id);
      toast.success('Wilayah berhasil diaktifkan');
      fetchRegions();
    } catch (err) {
      toast.error('Gagal mengaktifkan wilayah');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await regionApi.remove(confirmDelete.id);
      toast.success('Wilayah berhasil dihapus');
      fetchRegions();
      setConfirmDelete(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menghapus data');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredRegions.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedIds.length === 0) return;
    try {
      setIsBulkProcessing(true);
      await regionApi.bulkAction(selectedIds, action);
      toast.success(`Berhasil memproses aksi massal pada ${selectedIds.length} wilayah.`);
      setSelectedIds([]);
      setIsSelectionMode(false);
      fetchRegions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal memproses aksi massal');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const filteredRegions = regions.filter(r => {
    if (statusFilter === 'active') return r.isActive;
    if (statusFilter === 'inactive') return !r.isActive;
    return true;
  });

  const regionColumns = [
    ...(isSelectionMode ? [{
      key: 'select',
      label: (
        <button 
          onClick={() => handleSelectAll(selectedIds.length !== filteredRegions.length)}
          className="p-1 hover:bg-gray-100 rounded transition-colors bg-transparent border-0 cursor-pointer"
        >
          {selectedIds.length === filteredRegions.length && filteredRegions.length > 0 ? (
            <CheckSquare size={16} className="text-[#DCAF01]" />
          ) : (
            <Square size={16} className="text-gray-400" />
          )}
        </button>
      ),
      render: (_: any, row: any) => (
        <button 
          onClick={(e) => { e.stopPropagation(); toggleSelect(row.id); }}
          className="p-1 hover:bg-gray-100 rounded transition-colors bg-transparent border-0 cursor-pointer"
        >
          {selectedIds.includes(row.id) ? (
            <CheckSquare size={16} className="text-[#DCAF01]" />
          ) : (
            <Square size={16} className="text-gray-400" />
          )}
        </button>
      ),
      className: 'w-10'
    }] : []),
    { 
      key: 'name', 
      label: 'Nama Wilayah / Negara',
      render: (val: string) => (
        <div className="flex items-center gap-3 text-left">
          <div className="h-9 w-9 rounded-lg bg-[#DCAF01]/10 text-[#DCAF01] flex items-center justify-center shrink-0">
            <MapPin size={18} />
          </div>
          <p className="text-[13px] font-semibold text-gray-900 tracking-tight">{val}</p>
        </div>
      )
    },
    { 
      key: 'admin', 
      label: 'Admin Wilayah',
      render: (val: any) => val ? (
        <div className="flex items-center gap-2 text-left">
           <div className="h-6 w-6 rounded-full bg-gray-100 border border-gray-100 overflow-hidden flex items-center justify-center shrink-0">
              {val.profile?.photoUrl ? (
                <img src={getSecureFileUrl(val.profile.photoUrl) || val.profile.photoUrl} className="h-full w-full object-cover" alt="" />
              ) : (
                <div className="h-full w-full bg-emerald-100 text-emerald-600 text-[10px] font-bold flex items-center justify-center">
                  {val.profile?.fullName?.[0] || val.email?.[0]}
                </div>
              )}
           </div>
           <span className="text-[12px] font-medium text-gray-700">{val.profile?.fullName || val.email}</span>
        </div>
      ) : (
        <Badge variant="gray">Belum ditugaskan</Badge>
      )
    },
    { 
        key: '_count', 
        label: 'Anggota', 
        render: (val: any) => (
            <div className="flex items-center gap-1.5 font-medium text-gray-600">
                <Users size={14} className="text-gray-400" />
                <span>{val?.members || 0}</span>
            </div>
        )
    },
    { key: 'isActive', label: 'Status', render: (val: boolean) => <Badge variant={val ? 'success' : 'danger'}>{val ? 'Aktif' : 'Non-aktif'}</Badge> },
    { 
      key: 'actions', 
      label: 'Aksi',
      align: 'right' as const,
      render: (_: any, row: any) => (
        <div className="flex justify-end gap-1">
          <ActionIconButton icon={Eye} label="Detail" variant="primary" onClick={() => navigate(`/app/admin-pusat/regions/${row.id}`)} />
          <ActionIconButton icon={Edit} label="Edit" variant="primary" onClick={() => navigate(`/app/admin-pusat/regions/${row.id}/edit`)} />
          {row.isActive ? (
             <ActionIconButton icon={XCircle} label="Non-aktifkan" variant="warning" onClick={() => handleDeactivate(row.id)} />
          ) : (
             <ActionIconButton icon={CheckCircle2} label="Aktifkan" variant="success" onClick={() => handleActivate(row.id)} />
          )}
          <ActionIconButton icon={Trash2} label="Hapus" variant="danger" onClick={() => setConfirmDelete(row)} />
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade pb-10 text-left">
      <PageHeader 
        title="Manajemen Wilayah" 
        subtitle="Kelola database wilayah operasional dan negara mitra PPS Padjadjaran."
        action={
            <Button icon={<Plus size={16} />} onClick={() => navigate('/app/admin-pusat/regions/add')}>Tambah Wilayah</Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Wilayah" value={regionMeta.total || regions.length.toString()} icon={<MapPin size={20} />} />
        <StatCard title="Admin Wilayah" value={regions.filter(r => r.adminId).length.toString()} icon={<ShieldCheck size={20} />} variant="success" />
        <StatCard title="Wilayah Kosong" value={regions.filter(r => !r.adminId).length.toString()} icon={<ShieldAlert size={20} />} variant="danger" />
        <StatCard title="Total Anggota" value={regions.reduce((acc, r) => acc + (r._count?.members || 0), 0).toString()} icon={<Users size={20} />} variant="info" />
      </div>

      {/* Unified Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="Cari nama wilayah atau negara..."
              className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-md text-[13px] outline-none focus:ring-4 focus:ring-[#DCAF01]/5 focus:border-[#DCAF01] transition-all font-medium"
              value={regionSearch}
              onChange={(e) => setRegionSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="w-full sm:w-48">
                <Select 
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value)}
                   options={[
                      { label: 'Semua Status', value: 'all' },
                      { label: 'Hanya Aktif', value: 'active' },
                      { label: 'Hanya Non-aktif', value: 'inactive' },
                   ]}
                />
             </div>
          </div>
        </div>
      </div>

      {/* Sticky Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
         <div className="sticky top-20 z-30 p-4 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300 shadow-2xl">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-full bg-[#DCAF01] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#DCAF01]/20">
                  <ShieldCheck size={20} />
               </div>
               <div>
                  <p className="text-[13px] font-bold text-white leading-none mb-1">{selectedIds.length} wilayah terpilih</p>
                  <p className="text-[11px] text-gray-400 font-normal font-sans">Pilih aksi massal yang ingin diterapkan.</p>
               </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
               <Button 
                 variant="white" 
                 size="sm" 
                 className="flex-1 sm:flex-none border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 font-bold" 
                 onClick={() => handleBulkAction('activate')}
                 isLoading={isBulkProcessing}
                 icon={<CheckCircle2 size={14} />}
               >
                 Aktifkan
               </Button>
               <Button 
                 variant="white" 
                 size="sm" 
                 className="flex-1 sm:flex-none border-amber-500/20 text-amber-500 hover:bg-amber-500/10 font-bold" 
                 onClick={() => handleBulkAction('deactivate')}
                 isLoading={isBulkProcessing}
                 icon={<XCircle size={14} />}
               >
                 Non-aktifkan
               </Button>
               <Button 
                 variant="white" 
                 size="sm" 
                 className="flex-1 sm:flex-none border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold" 
                 onClick={() => setConfirmBulkDelete(true)}
                 isLoading={isBulkProcessing}
                 icon={<Trash2 size={14} />}
               >
                 Hapus
               </Button>
               <button 
                 onClick={() => { setSelectedIds([]); setIsSelectionMode(false); }} 
                 className="px-4 py-2 text-[11px] font-bold text-gray-400 hover:text-white transition-all bg-transparent border-0 cursor-pointer font-sans"
               >
                 Batalkan
               </button>
            </div>
         </div>
      )}

      {/* Utility Bar above Table */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-4">
           <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest leading-none">
              Total {filteredRegions.length} Wilayah
           </h3>
           <div className="w-px h-3 bg-gray-200" />
           <button 
             onClick={() => {
               setIsSelectionMode(!isSelectionMode);
               setSelectedIds([]);
             }}
             className={cn(
               "flex items-center gap-1.5 text-[11px] font-bold transition-all bg-transparent border-0 cursor-pointer outline-none font-sans",
               isSelectionMode ? "text-[#DCAF01]" : "text-gray-400 hover:text-gray-600"
             )}
           >
             <CheckSquare size={14} /> {isSelectionMode ? 'Tutup Pemilihan' : 'Pilih Banyak'}
           </button>
        </div>
      </div>

      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {loading && regions.length === 0 ? (
              <div className="py-32 text-center flex flex-col items-center justify-center text-gray-400 gap-4">
                 <Loader2 size={40} className="animate-spin opacity-20" />
                 <p className="text-[13px] font-bold">Menyinkronkan data wilayah...</p>
              </div>
          ) : (
              <DataTable 
                columns={regionColumns} 
                data={filteredRegions} 
                className="border-0 rounded-none text-left" 
                clientPagination={true}
                rowsPerPage={10}
              />
          )}
        </div>
      </Card>

      <ConfirmModal 
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Wilayah?"
        message={`Apakah Anda yakin ingin menghapus "${confirmDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        variant="danger"
      />

      <ConfirmModal 
        isOpen={confirmBulkDelete}
        onClose={() => setConfirmBulkDelete(false)}
        onConfirm={async () => {
          setConfirmBulkDelete(false);
          await handleBulkAction('delete');
        }}
        title="Hapus Wilayah Terpilih?"
        message={`Apakah Anda yakin ingin menghapus ${selectedIds.length} wilayah yang dipilih? Tindakan ini tidak dapat dibatalkan.`}
        variant="danger"
      />
    </div>
  );
};

export default Regions;
