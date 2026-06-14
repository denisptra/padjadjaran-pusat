import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { 
  Plus, 
  Search, 
  Megaphone, 
  Edit, 
  Trash2, 
  Globe, 
  MapPin,
  Loader2,
  Monitor,
  Eye,
  Filter,
  RotateCcw,
  CheckSquare,
  Square,
  CheckCircle2
} from 'lucide-react';
import { announcementApi } from '../../../services/announcementApi';
import { toast } from '../../../stores/toastStore';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { cn } from '../../../utils/cn';
import DataTable from '../../../components/ui/DataTable';
import { ActionIconButton } from '../../../components/ui/ActionIconButton';
import { useAuthStore } from '@/features/auth/stores/auth.store';

const Announcements: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdminWilayah = user?.role === 'admin_wilayah';
  const basePath = isAdminWilayah ? '/app/admin-wilayah' : '/app/admin-pusat';

  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    scope: searchParams.get('scope') || '',
    status: searchParams.get('status') || '',
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [filters]);

  useEffect(() => {
    // Sync filters to URL
    const params: any = {};
    if (filters.search) params.search = filters.search;
    if (filters.scope) params.scope = filters.scope;
    if (filters.status) params.status = filters.status;
    setSearchParams(params, { replace: true });
  }, [filters]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const isPublishedParam = filters.status === '' ? undefined : (filters.status === 'published');
      const res = await announcementApi.getAll({ 
        limit: 200, 
        scope: filters.scope,
        isPublished: isPublishedParam,
        search: filters.search
      });
      
      const unwrapped = res.data?.data?.data || res.data?.data || res.data;
      setData(Array.isArray(unwrapped) ? unwrapped : []);
    } catch (err: any) {
      toast.error('Gagal memuat daftar pengumuman');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setLoading(true);
      await announcementApi.delete(confirmDelete.id);
      toast.success('Pengumuman berhasil dihapus');
      setConfirmDelete(null);
      fetchAnnouncements();
    } catch (err: any) {
      toast.error('Gagal menghapus pengumuman');
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (selectedIds.length === 0) return;
    if (action === 'delete' && !window.confirm(`Hapus permanen ${selectedIds.length} pengumuman terpilih?`)) return;

    try {
      setLoading(true);
      
      // Simulate bulk action for now since there is no backend endpoint yet.
      // We process them one by one if a bulk endpoint isn't available.
      // To strictly follow the pattern, we should create a bulk endpoint in backend, but for this step we will make individual calls for safety if bulk is missing.
      for (const id of selectedIds) {
          if (action === 'delete') {
              await announcementApi.delete(id);
          } else if (action === 'publish') {
              await announcementApi.update(id, { isPublished: true, status: 'published' });
          } else {
              await announcementApi.update(id, { isPublished: false, status: 'draft' });
          }
      }
      
      toast.success(`Berhasil memproses ${selectedIds.length} pengumuman.`);
      setSelectedIds([]);
      setIsSelectionMode(false);
      fetchAnnouncements();
    } catch (err: any) {
      toast.error('Gagal memproses aksi massal');
      setLoading(false);
    }
  };

  const getScopeBadge = (row: any) => {
    const scope = row.scope;
    const baseClass = "flex items-center gap-1.5 font-medium text-[11px] px-2 py-0.5 rounded border whitespace-nowrap";
    
    if (scope === 'national') {
      return <div className={cn(baseClass, "text-blue-600 bg-blue-50 border-blue-100")}><Globe size={12} /> Nasional</div>;
    }
    
    if (scope === 'region') {
      const targets = row.resolvedTargets || [];
      if (targets.length === 0) return <div className={cn(baseClass, "text-amber-600 bg-amber-50 border-amber-100")}><MapPin size={12} /> Khusus</div>;
      
      const label = targets.length === 1 
        ? targets[0] 
        : `${targets[0]} & ${targets.length - 1} lainnya`;
        
      return (
        <div className={cn(baseClass, "text-amber-600 bg-amber-50 border-amber-100 cursor-help")} title={targets.join(', ')}>
          <MapPin size={12} /> {label}
        </div>
      );
    }
    
    return <div className={cn(baseClass, "text-gray-600 bg-gray-50 border-gray-100")}>{scope}</div>;
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      scope: '',
      status: '',
    });
  };

  const columns = [
    ...(isSelectionMode ? [{
      key: 'select',
      label: (
        <button 
          onClick={() => {
            if (selectedIds.length === data.length) setSelectedIds([]);
            else setSelectedIds(data.map((d: any) => d.id));
          }}
          className="p-1 hover:bg-gray-100 rounded transition-colors bg-transparent border-0 cursor-pointer"
        >
          {selectedIds.length === data.length && data.length > 0 ? (
            <CheckSquare size={16} className="text-[#DCAF01]" />
          ) : (
            <Square size={16} className="text-gray-400" />
          )}
        </button>
      ),
      render: (_: any, row: any) => (
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            // Allow selection ONLY if the user can manage the announcement
            const isOwner = row.authorId === user?.id;
            const canManage = !isAdminWilayah || isOwner;
            if (!canManage) return;

            if (selectedIds.includes(row.id)) setSelectedIds(prev => prev.filter(id => id !== row.id)); 
            else setSelectedIds(prev => [...prev, row.id]); 
          }}
          className={cn(
            "p-1 hover:bg-gray-100 rounded transition-colors bg-transparent border-0 cursor-pointer",
            (!isAdminWilayah || row.authorId === user?.id) ? "" : "opacity-30 cursor-not-allowed"
          )}
          disabled={isAdminWilayah && row.authorId !== user?.id}
        >
          {selectedIds.includes(row.id) ? (
            <CheckSquare size={16} className="text-[#DCAF01]" />
          ) : (
            <Square size={16} className="text-gray-400" />
          )}
        </button>
      ),
      align: 'center' as const,
      className: 'w-10'
    }] : []),
    { 
      key: 'title', 
      label: 'Pengumuman',
      render: (val: string) => (
        <div className="flex items-center gap-3 text-left">
          <div className="h-9 w-9 rounded-lg bg-[#DCAF01]/10 text-[#DCAF01] flex items-center justify-center shrink-0">
            <Megaphone size={18} />
          </div>
          <p className="text-[13px] font-medium text-gray-900 truncate max-w-xs">{val}</p>
        </div>
      )
    },
    { key: 'scope', label: 'Target Audiens', render: (_: any, row: any) => getScopeBadge(row) },
    { key: 'isPublished', label: 'Status', render: (val: boolean) => <Badge variant={val ? 'success' : 'gray'} className="font-medium">{val ? 'Terbit' : 'Draf'}</Badge> },
    { 
      key: 'viewCount', 
      label: 'Dilihat', 
      render: (val: number) => (
        <div className="flex items-center gap-1.5 text-gray-600 font-bold text-[11px]">
          <Eye size={14} className="text-[#DCAF01]" />
          {val || 0}
        </div>
      )
    },
    { key: 'showModal', label: 'Pop-up', render: (val: boolean) => val ? <div className="flex items-center gap-1 text-blue-600 font-medium text-[10px]"><Monitor size={12} /> Ya</div> : <span className="text-gray-400 text-[10px] font-medium">Tidak</span> },
    { 
      key: 'author', 
      label: 'Pembuat', 
      render: (_: any, row: any) => {
         const isPusat = row.author?.role === 'admin_pusat' || row.author?.role === 'super_admin';
         return (
            <div className="flex flex-col text-left">
               <span className="text-[12px] font-bold text-gray-900">{row.authorName || 'Sistem'}</span>
               <span className={cn("text-[9px] font-semibold uppercase tracking-wider", isPusat ? "text-purple-600" : "text-emerald-600")}>
                 {isPusat ? 'Pusat (Nasional)' : 'Wilayah (Lokal)'}
               </span>
            </div>
         );
      }
    },
    { key: 'createdAt', label: 'Tanggal', render: (val: string) => <span className="text-[12px] text-gray-500 font-medium">{val ? new Date(val).toLocaleDateString('id-ID') : '-'}</span> },
    { 
      key: 'actions', 
      label: 'Aksi',
      align: 'right' as const,
      render: (_: any, row: any) => {
        const isOwner = row.authorId === user?.id;
        const canManage = !isAdminWilayah || isOwner;

        return (
          <div className="flex justify-end gap-1">
            <ActionIconButton icon={Eye} label="Detail" variant="primary" onClick={() => navigate(`${basePath}/announcements/${row.id}`)} />
            {canManage && (
              <>
                <ActionIconButton icon={Edit} label="Edit" variant="primary" onClick={() => navigate(`${basePath}/announcements/${row.id}/edit`)} />
                <ActionIconButton icon={Trash2} label="Hapus" variant="danger" onClick={() => setConfirmDelete(row)} />
              </>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 animate-fade pb-10 text-left">
      <PageHeader 
        title="Manajemen Pengumuman" 
        subtitle="Publikasikan informasi resmi dengan target audiens yang spesifik."
        action={
          <Button icon={<Plus size={16} />} onClick={() => navigate(`${basePath}/announcements/add`)}>Buat Pengumuman</Button>
        }
      />

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
         <div className="sticky top-20 z-30 p-4 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300 shadow-2xl">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-full bg-[#DCAF01] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#DCAF01]/20">
                  <Megaphone size={20} />
               </div>
               <div>
                  <p className="text-[13px] font-bold text-white leading-none mb-1">{selectedIds.length} pengumuman terpilih</p>
                  <p className="text-[11px] text-gray-400 font-normal">Pilih aksi massal yang ingin diterapkan.</p>
               </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
               <Button 
                 variant="white" 
                 size="sm" 
                 className="flex-1 sm:flex-none border-emerald-500/20 text-emerald-500 hover:bg-emerald-50 h-8 font-bold" 
                 onClick={() => handleBulkAction('publish')}
                 icon={<CheckCircle2 size={14} />}
               >
                 Terbitkan
               </Button>
               <Button 
                 variant="white" 
                 size="sm" 
                 className="flex-1 sm:flex-none border-amber-500/20 text-amber-500 hover:bg-amber-50 h-8 font-bold" 
                 onClick={() => handleBulkAction('unpublish')}
                 icon={<Filter size={14} />}
               >
                 Jadikan Draf
               </Button>
               <Button 
                 variant="white" 
                 size="sm" 
                 className="flex-1 sm:flex-none border-red-500/20 text-red-500 hover:bg-red-50 h-8 font-bold" 
                 onClick={() => handleBulkAction('delete')}
                 icon={<Trash2 size={14} />}
               >
                 Hapus
               </Button>
               <button onClick={() => setSelectedIds([])} className="px-4 py-2 text-[11px] font-medium text-gray-400 hover:text-white border-0 bg-transparent h-8 cursor-pointer">Batalkan</button>
            </div>
         </div>
      )}

      {/* Advanced Filter Panel */}
      <Card>
        <div className="space-y-6">
           <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <div className="flex items-center gap-2">
                 <Filter size={18} className="text-[#DCAF01]" />
                 <h3 className="text-[14px] font-bold text-gray-900">Filter pencarian pengumuman</h3>
              </div>
              <button 
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-[#DCAF01] transition-all bg-transparent border-0 cursor-pointer"
              >
                <RotateCcw size={14} /> Reset Filter
              </button>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input 
                label="Cari Judul"
                placeholder="Masukkan kata kunci..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                icon={<Search size={14} />}
              />

              <Select 
                label="Status Publikasi"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                options={[
                  { label: 'Semua Status', value: '' },
                  { label: 'Terbit', value: 'published' },
                  { label: 'Draf', value: 'draft' }
                ]}
              />

              <Select 
                label="Jangkauan Target"
                value={filters.scope}
                onChange={(e) => setFilters({...filters, scope: e.target.value})}
                options={[
                  { label: 'Semua Target', value: '' },
                  { label: 'Nasional', value: 'national' },
                  { label: 'Kota/Kabupaten', value: 'region' }
                ]}
              />
           </div>
        </div>
      </Card>

      {/* Selection Toggle */}
      <div className="flex items-center justify-between px-1 mb-3 mt-6">
        <div className="flex items-center gap-4">
           <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest leading-none">
              Total {data.length} Pengumuman
           </h3>
           <div className="w-px h-3 bg-gray-200" />
           <button 
             onClick={() => setIsSelectionMode(!isSelectionMode)}
             className={cn(
               "flex items-center gap-1.5 text-[11px] font-bold transition-all bg-transparent border-0 cursor-pointer outline-none",
               isSelectionMode ? "text-[#DCAF01]" : "text-gray-400 hover:text-gray-600"
             )}
           >
             <CheckSquare size={14} /> {isSelectionMode ? 'Tutup Pemilihan' : 'Pilih Banyak'}
           </button>
        </div>
      </div>

      <Card noPadding>
        <div className="overflow-x-auto min-h-[400px]">
          {loading && data.length === 0 ? (
              <div className="py-24 text-center flex flex-col items-center justify-center text-gray-400 gap-3">
                 <Loader2 size={32} className="animate-spin opacity-20" />
                 <p className="text-[12px] font-medium uppercase tracking-[0.2em]">Memuat pengumuman...</p>
              </div>
          ) : (
              <DataTable 
                columns={columns} 
                data={data} 
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
        title="Hapus Pengumuman?"
        message={`Apakah Anda yakin ingin menghapus pengumuman "${confirmDelete?.title}"?`}
      />
    </div>
  );
};

export default Announcements;
