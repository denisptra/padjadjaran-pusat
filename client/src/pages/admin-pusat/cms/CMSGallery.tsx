import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import DataTable from '../../../components/ui/DataTable';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  ShieldCheck,
  Loader2,
  Filter,
  CheckSquare,
  Square,
  Megaphone,
  CheckCircle2,
  Eye
} from 'lucide-react';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { toast } from '../../../stores/toastStore';
import { cmsApi } from '../../../services/cmsApi';
import { ActionIconButton } from '../../../components/ui/ActionIconButton';
import { getSecureFileUrl } from '../../../services/api';
import { cn } from '@/utils/cn';
import { stripHtml } from '@/utils/stripHtml';

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

const CMSGallery: React.FC = () => {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<GalleryItem | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await cmsApi.getGallery({ limit: 100 });
      const unwrapped = res.data?.data?.data || res.data?.data || res.data;
      const data = Array.isArray(unwrapped) ? unwrapped : [];
      setGallery(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(`Gagal memuat galeri: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirmDelete) {
      try {
        await cmsApi.deleteGallery(confirmDelete.id);
        toast.success('Galeri berhasil dihapus.');
        setConfirmDelete(null);
        setSelectedIds(prev => prev.filter(id => id !== confirmDelete.id));
        fetchGallery();
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message;
        toast.error(`Gagal menghapus galeri: ${msg}`);
      }
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedIds.length === 0) return;
    if (action === 'delete' && !window.confirm(`Hapus permanen ${selectedIds.length} foto terpilih?`)) return;

    try {
      setLoading(true);
      await cmsApi.bulkActionGallery(selectedIds, action);
      toast.success(`Berhasil memproses ${selectedIds.length} foto.`);
      setSelectedIds([]);
      setIsSelectionMode(false);
      fetchGallery();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(`Gagal memproses aksi massal: ${msg}`);
      setLoading(false);
    }
  };

  const filteredGallery = gallery.filter(item => {
    const matchesSearch = (item.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : statusFilter === 'active' ? item.isActive : !item.isActive;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    ...(isSelectionMode ? [{
      key: 'select',
      label: (
        <button 
          onClick={() => {
            if (selectedIds.length === filteredGallery.length) setSelectedIds([]);
            else setSelectedIds(filteredGallery.map(g => g.id));
          }}
          className="p-1 hover:bg-gray-100 rounded transition-colors bg-transparent border-0 cursor-pointer"
        >
          {selectedIds.length === filteredGallery.length && filteredGallery.length > 0 ? (
            <CheckSquare size={16} className="text-[#DCAF01]" />
          ) : (
            <Square size={16} className="text-gray-400" />
          )}
        </button>
      ),
      render: (_: any, row: GalleryItem) => (
        <button 
          onClick={(e) => { e.stopPropagation(); if (selectedIds.includes(row.id)) setSelectedIds(prev => prev.filter(id => id !== row.id)); else setSelectedIds(prev => [...prev, row.id]); }}
          className="p-1 hover:bg-gray-100 rounded transition-colors bg-transparent border-0 cursor-pointer"
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
      label: 'Informasi Foto & Kegiatan',
      render: (val: string, row: GalleryItem) => (
        <div className="flex items-start gap-4 py-1 max-w-xl">
          <div className="h-16 w-24 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden shrink-0 border border-gray-100 shadow-sm mt-1">
             {row.imageUrl ? <img src={getSecureFileUrl(row.imageUrl) || row.imageUrl} className="h-full w-full object-cover" alt="" /> : <ImageIcon size={24} />}
          </div>
          <div className="min-w-0 leading-tight text-left">
            <p className="text-[14px] font-bold text-gray-900 line-clamp-1 mb-1">{val}</p>
            <p className="text-[12px] text-gray-500 line-clamp-2 mb-2 leading-relaxed italic">
               {stripHtml(row.description || 'Tidak ada deskripsi.').substring(0, 100)}...
            </p>
            <div className="flex items-center gap-2">
               <Badge variant="gray" className="text-[9px] px-1.5 py-0 uppercase font-bold tracking-tight">
                  {row.category}
               </Badge>
               <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{new Date(row.createdAt).toLocaleDateString('id-ID')}</span>
            </div>
          </div>
        </div>
      )
    },
    { 
      key: 'isActive', 
      label: 'Status Web',
      render: (val: boolean) => (
        <Badge variant={val ? 'success' : 'gray'} className="font-bold">{val ? 'Aktif' : 'Nonaktif'}</Badge>
      )
    },
    { 
      key: 'actions', 
      label: 'Aksi',
      align: 'right' as const,
      render: (_: any, row: GalleryItem) => (
        <div className="flex items-center justify-end gap-1">
           <ActionIconButton icon={Eye} label="Lihat Foto" variant="gray" onClick={() => window.open(getSecureFileUrl(row.imageUrl) || row.imageUrl, '_blank')} />
           <ActionIconButton icon={Edit} label="Edit" variant="primary" onClick={() => navigate(`/app/admin-pusat/cms/gallery/${row.id}/edit`)} />
           <ActionIconButton icon={Trash2} label="Hapus" variant="danger" onClick={() => setConfirmDelete(row)} />
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade pb-10 text-left">
      <PageHeader 
        title="Galeri foto" 
        subtitle="Dokumentasi visual kegiatan dan momen berharga PPS Padjadjaran."
        action={
          <Button icon={<Plus size={16} />} onClick={() => navigate('/app/admin-pusat/cms/gallery/add')}>Unggah Foto</Button>
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
                  <p className="text-[13px] font-bold text-white leading-none mb-1">{selectedIds.length} foto terpilih</p>
                  <p className="text-[11px] text-gray-400 font-normal">Pilih aksi massal yang ingin diterapkan.</p>
               </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
               <Button 
                 variant="white" 
                 size="sm" 
                 className="flex-1 sm:flex-none border-emerald-500/20 text-emerald-500 hover:bg-emerald-50 h-8 font-bold" 
                 onClick={() => handleBulkAction('activate')}
                 icon={<CheckCircle2 size={14} />}
               >
                 Aktifkan
               </Button>
               <Button 
                 variant="white" 
                 size="sm" 
                 className="flex-1 sm:flex-none border-amber-500/20 text-amber-500 hover:bg-amber-50 h-8 font-bold" 
                 onClick={() => handleBulkAction('deactivate')}
                 icon={<Filter size={14} />}
               >
                 Nonaktifkan
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

      {/* Selection Toggle */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-4">
           <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest leading-none">
              Total {gallery.length} Foto
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

      {/* Unified Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="w-full sm:w-48">
                <Select 
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value)}
                   options={[
                      { label: 'Semua Status', value: 'all' },
                      { label: 'Aktif', value: 'active' },
                      { label: 'Non-aktif', value: 'inactive' },
                   ]}
                />
             </div>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="Cari judul galeri..."
              className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-md text-[13px] outline-none focus:ring-4 focus:ring-[#DCAF01]/5 focus:border-[#DCAF01] transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card noPadding>
        <div className="overflow-x-auto min-h-[400px]">
          {loading && gallery.length === 0 ? (
             <div className="py-32 text-center flex flex-col items-center justify-center text-gray-400 gap-4">
               <Loader2 size={40} className="animate-spin opacity-20" />
               <p className="text-[13px] font-bold">Sinkronisasi galeri...</p>
             </div>
          ) : (
             <DataTable 
               columns={columns} 
               data={filteredGallery} 
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
        title="Hapus galeri?"
        message={`Apakah Anda yakin ingin menghapus "${confirmDelete?.title}"?`}
        variant="danger"
      />
    </div>
  );
};

export default CMSGallery;
