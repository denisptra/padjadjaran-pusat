import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { 
  Plus, Search, Megaphone, Edit, Trash2, Loader2, Filter, CheckSquare, Square, TrendingUp
} from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { toast } from '@/stores/toastStore';
import { cmsApi } from '@/services/cmsApi';
import { ActionIconButton } from '@/components/ui/ActionIconButton';
import { getSecureFileUrl } from '@/services/api';
import { useNews } from '@/features/cms/hooks/useNews';
import { stripHtml } from '@/utils/stripHtml';
import { Eye } from 'lucide-react';
import { cn } from '@/utils/cn';

interface CMSContentItem {
  id: string;
  title: string;
  type: 'BERITA' | 'ARTIKEL';
  category: string;
  status: 'Terbit' | 'Draf';
  date: string;
  author: string;
  slug: string;
  imageUrl: string;
}

const CMSNews: React.FC = () => {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<CMSContentItem | null>(null);
  const [filters, setFilters] = useState({ type: '', status: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const { data, loading, refetch } = useNews(filters);

  const contents: CMSContentItem[] = data.map((item: any) => ({
    id: item.id,
    title: item.title,
    type: item.type,
    category: item.category || 'umum',
    status: item.isPublished ? 'Terbit' : 'Draf',
    date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID') : '-',
    author: 'Admin Pusat',
    slug: item.slug,
    imageUrl: item.imageUrl,
    viewCount: item.viewCount || 0,
    content: item.content || '',
  }));

  const handleDelete = async () => {
    if (confirmDelete) {
      try {
        await cmsApi.deletePublication(confirmDelete.id);
        toast.success('Konten berhasil dihapus.');
        setConfirmDelete(null);
        refetch();
      } catch (err: any) {
        toast.error(`Gagal menghapus konten: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (selectedIds.length === 0) return;
    
    if (action === 'delete' && !window.confirm(`Hapus permanen ${selectedIds.length} konten terpilih?`)) return;

    try {
      await cmsApi.bulkActionPublication(selectedIds, action);
      toast.success(`Berhasil memproses ${selectedIds.length} konten.`);
      setSelectedIds([]);
      setIsSelectionMode(false);
      refetch();
    } catch (err: any) {
      toast.error('Gagal memproses aksi massal');
    }
  };

  const filteredData = contents.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const columns = [
    ...(isSelectionMode ? [{
      key: 'select',
      label: (
        <button 
          onClick={() => {
            if (selectedIds.length === filteredData.length) setSelectedIds([]);
            else setSelectedIds(filteredData.map(c => c.id));
          }}
          className="p-1 hover:bg-gray-100 rounded transition-colors bg-transparent border-0 cursor-pointer"
        >
          {selectedIds.length === filteredData.length && filteredData.length > 0 ? (
            <CheckSquare size={16} className="text-[#DCAF01]" />
          ) : (
            <Square size={16} className="text-gray-400" />
          )}
        </button>
      ),
      render: (_: any, row: CMSContentItem) => (
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
      label: 'Informasi Konten',
      render: (val: string, row: any) => (
        <div className="flex items-start gap-4 py-1 max-w-xl">
          <div className="h-16 w-24 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden shrink-0 border border-gray-100 shadow-sm mt-1">
             {row.imageUrl ? <img src={getSecureFileUrl(row.imageUrl) || row.imageUrl} className="h-full w-full object-cover" alt="" /> : <Megaphone size={24} />}
          </div>
          <div className="min-w-0 leading-tight text-left">
            <p className="text-[14px] font-bold text-gray-900 line-clamp-1 mb-1">{val}</p>
            <p className="text-[12px] text-gray-500 line-clamp-2 mb-2 leading-relaxed italic">
               {stripHtml(row.content || '').substring(0, 120)}...
            </p>
            <div className="flex items-center gap-2">
               <Badge variant={row.type === 'BERITA' ? 'info' : 'gray'} className="text-[9px] px-1.5 py-0 uppercase font-bold tracking-tight">
                  {row.type}
               </Badge>
               <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{row.category}</span>
            </div>
          </div>
        </div>
      )
    },
    { key: 'status', label: 'Status', render: (val: string) => <Badge variant={val === 'Terbit' ? 'success' : 'gray'} className="font-bold">{val}</Badge> },
    { 
      key: 'viewCount', 
      label: 'Dilihat',
      render: (val: number) => (
        <div className="flex items-center gap-1.5 text-gray-600 font-bold text-[11px]">
          <TrendingUp size={14} className="text-[#DCAF01]" />
          {val || 0}
        </div>
      )
    },
    { key: 'date', label: 'Tanggal Rilis', render: (val: string) => <span className="text-[11px] font-medium text-gray-500">{val}</span> },
    { 
      key: 'actions', 
      label: 'Aksi',
      align: 'right' as const,
      render: (_: any, row: CMSContentItem) => (
        <div className="flex items-center justify-end gap-1">
           <ActionIconButton icon={Eye} label="Lihat Detail" variant="gray" onClick={() => window.open(`/publikasi/${row.slug}`, '_blank')} />
           <ActionIconButton icon={Edit} label="Edit" variant="primary" onClick={() => navigate(`/app/admin-pusat/cms/news/${row.id}/edit`)} />
           <ActionIconButton icon={Trash2} label="Hapus" variant="danger" onClick={() => setConfirmDelete(row)} />
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade pb-10 text-left">
      <PageHeader 
        title="Berita & artikel" 
        subtitle="Kelola publikasi informasi, artikel edukasi, dan berita resmi perguruan."
        action={
          <Button icon={<Plus size={16} />} onClick={() => navigate('/app/admin-pusat/cms/news/add')}>Buat Konten</Button>
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
                  <p className="text-[13px] font-bold text-white leading-none mb-1">{selectedIds.length} konten terpilih</p>
                  <p className="text-[11px] text-gray-400 font-normal">Pilih aksi massal yang ingin diterapkan.</p>
               </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
               <Button variant="white" size="sm" className="flex-1 sm:flex-none border-emerald-500/20 text-emerald-500 hover:bg-emerald-50 h-8 font-bold" onClick={() => handleBulkAction('publish')} icon={<Plus size={14} />}>Terbitkan</Button>
               <Button variant="white" size="sm" className="flex-1 sm:flex-none border-amber-500/20 text-amber-500 hover:bg-amber-50 h-8 font-bold" onClick={() => handleBulkAction('unpublish')} icon={<Filter size={14} />}>Jadikan Draf</Button>
               <Button variant="white" size="sm" className="flex-1 sm:flex-none border-red-500/20 text-red-500 hover:bg-red-50 h-8 font-bold" onClick={() => handleBulkAction('delete')} icon={<Trash2 size={14} />}>Hapus</Button>
               <button onClick={() => setSelectedIds([])} className="px-4 py-2 text-[11px] font-medium text-gray-400 hover:text-white border-0 bg-transparent h-8 cursor-pointer">Batalkan</button>
            </div>
         </div>
      )}

      {/* Selection Toggle */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-4">
           <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest leading-none">
              Total {contents.length} Konten
           </h3>
           <div className="w-px h-3 bg-gray-200" />
           <button 
             onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                if (isSelectionMode) setSelectedIds([]);
             }}
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
           <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="w-full sm:w-44">
                <Select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})} options={[{ label: 'Semua Tipe', value: '' }, { label: 'Berita', value: 'BERITA' }, { label: 'Artikel', value: 'ARTIKEL' }]} />
              </div>
              <div className="w-full sm:w-44">
                <Select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} options={[{ label: 'Semua Status', value: '' }, { label: 'Terbit', value: 'true' }, { label: 'Draf', value: 'false' }]} />
              </div>
           </div>
           <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Cari judul konten..." className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-md text-[13px] outline-none focus:ring-4 focus:ring-[#DCAF01]/5 focus:border-[#DCAF01] transition-all font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
        </div>
      </div>

      <Card noPadding>
        <div className="overflow-x-auto">
          <DataTable 
            columns={columns} 
            data={filteredData} 
            isLoading={loading}
            className="border-0 rounded-none text-left" 
            clientPagination={true}
            rowsPerPage={10}
          />
        </div>
      </Card>

      <ConfirmModal 
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Hapus konten?"
        message={`Apakah Anda yakin ingin menghapus "${confirmDelete?.title}"?`}
        variant="danger"
      />
    </div>
  );
};

export default CMSNews;
