import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import { 
  Megaphone, 
  Search, 
  ChevronRight,
  MapPin,
  Globe,
  Plus,
  Clock,
  Trash2,
  Edit,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { announcementApi } from '../../services/announcementApi';
import { cn } from '../../utils/cn';
import ConfirmationModal from '../../components/ui/ConfirmModal';
import { toast } from '../../stores/toastStore';
import { ROLES } from '../../config/roles';

import { stripHtml } from '@/utils/stripHtml';

interface AnnouncementsProps {
  manageMode?: boolean;
}

const Announcements: React.FC<AnnouncementsProps> = ({ manageMode = false }) => {
  const navigate = useNavigate();
  const { role, user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScope, setFilterScope] = useState('Semua');
  const [filterReadStatus, setFilterReadStatus] = useState('Semua Status');
  const [confirmDelete, setConfirmDelete] = useState<any>(null);

  const canEditOrDelete = (item: any) => {
    if (role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN_PUSAT) return true;
    if (role === ROLES.ADMIN_WILAYAH && item.authorId === user?.id) return true;
    return false;
  };

  const [announcementsList, setAnnouncementsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const isManagement = manageMode || role === ROLES.ADMIN_PUSAT || role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN_WILAYAH;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterScope]);

  useEffect(() => {
    fetchAnnouncements();
  }, [currentPage, filterScope, searchTerm]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);

      let scope: string | undefined = undefined;
      if (filterScope === 'Nasional') scope = 'national';
      else if (filterScope === 'Wilayah') scope = 'wilayah';

      const params = {
        page: currentPage,
        limit,
        search: searchTerm || undefined,
        scope,
      };

      const response = await announcementApi.getAll(params);
      setAnnouncementsList(response.data.data || []);
      setTotalPages(response.data.meta?.lastPage || 1);
    } catch (err) {
      toast.error('Gagal memuat data pengumuman.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await announcementApi.markAsRead(id);
      toast.success('Pengumuman ditandai sebagai sudah dibaca.');
      fetchAnnouncements();
    } catch (err) {
      toast.error('Gagal menandai sebagai dibaca.');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setLoading(true);
      await announcementApi.delete(confirmDelete.id);
      toast.success('Pengumuman berhasil dihapus.');
      setConfirmDelete(null);
      fetchAnnouncements();
    } catch (err) {
      toast.error('Gagal menghapus pengumuman.');
    } finally {
      setLoading(false);
    }
  };

  const getDetailPath = (id: string) => {
    if (role === ROLES.MEMBER) return `/app/member/announcements/${id}`;
    if (role === ROLES.ADMIN_WILAYAH) return `/app/admin-wilayah/announcements/${id}`;
    return `/app/admin-pusat/announcements/${id}`;
  };

  const getAddPath = () => {
    if (role === ROLES.ADMIN_WILAYAH) return `/app/admin-wilayah/announcements/add`;
    return `/app/admin-pusat/announcements/add`;
  };

  const displayedAnnouncements = announcementsList.filter(item => {
    if (filterReadStatus === 'Belum Dibaca') return !item.isRead;
    if (filterReadStatus === 'Sudah Dibaca') return item.isRead;
    return true;
  });

  return (
    <div className="space-y-8 animate-fade pb-10 text-left">
      <PageHeader 
        title={isManagement ? "Manajemen Pengumuman" : "Pengumuman"} 
        subtitle="Informasi resmi, agenda kegiatan, dan berita terbaru PPS Padjadjaran."
        action={
          isManagement && (
            <Button size="sm" onClick={() => navigate(getAddPath())}>
              <Plus size={16} className="mr-2" /> Tambah Pengumuman
            </Button>
          )
        }
      />

      {/* Filter & Search Bar */}
      <Card noPadding>
        <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-end border-b border-gray-100">
          <div className="md:col-span-6 space-y-1.5 w-full text-left">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1">Pencarian Pengumuman</label>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text"
                placeholder="Cari judul pengumuman..."
                className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#DCAF01] transition-all font-medium shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="md:col-span-3 space-y-1.5 w-full text-left">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1">Jangkauan Target</label>
            <Select
              options={[
                { label: 'Semua Jangkauan', value: 'Semua' },
                { label: 'Nasional', value: 'Nasional' },
                { label: 'Wilayah/Lokal', value: 'Wilayah' }
              ]}
              value={filterScope}
              onChange={(e) => setFilterScope(e.target.value)}
              className="h-11 text-[13px] font-medium"
            />
          </div>

          <div className="md:col-span-3 space-y-1.5 w-full text-left">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1">Status Baca</label>
            <Select
              options={[
                { label: 'Semua Status', value: 'Semua Status' },
                { label: 'Belum Dibaca', value: 'Belum Dibaca' },
                { label: 'Sudah Dibaca', value: 'Sudah Dibaca' }
              ]}
              value={filterReadStatus}
              onChange={(e) => setFilterReadStatus(e.target.value)}
              className="h-11 text-[13px] font-medium"
            />
          </div>
        </div>
      </Card>

      {/* Announcements List */}
      {loading ? (
         <div className="h-[40vh] flex flex-col items-center justify-center text-gray-400 gap-4 bg-white border border-gray-150 rounded-xl">
            <Loader2 size={32} className="animate-spin opacity-40" />
            <p className="text-[13px] font-medium">Memuat pengumuman...</p>
         </div>
      ) : (
         <div className="grid grid-cols-1 gap-4 text-left">
           {displayedAnnouncements.length > 0 ? (
             displayedAnnouncements.map((item) => (
               <Card 
                 key={item.id}
                 noPadding
                 className={cn(
                   "group hover:border-[#DCAF01]/30 transition-all cursor-pointer",
                   !isManagement && !item.isRead ? "bg-[#DCAF01]/5 border-l-4 border-l-[#DCAF01]" : ""
                 )}
                 onClick={() => navigate(getDetailPath(item.id))}
               >
                 <div className="flex flex-col md:flex-row items-stretch">
                    <div className={cn(
                      "w-full md:w-1.5 shrink-0",
                      item.scope === 'national' ? "bg-[#DCAF01]" : "bg-blue-500"
                    )} />
                    
                    <div className="flex-1 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                       <div className="h-12 w-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#DCAF01] group-hover:bg-[#DCAF01]/5 transition-all shrink-0 relative">
                         <Megaphone size={24} />
                         {!isManagement && !item.isRead && (
                           <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse border-2 border-white" />
                         )}
                       </div>
                       
                       <div className="flex-1 space-y-1.5 min-w-0">
                           <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <Badge variant={item.scope === 'national' ? 'warning' : 'info'} className="text-[10px] font-bold">
                                 {item.scope === 'national' ? <Globe size={10} className="mr-1" /> : <MapPin size={10} className="mr-1" />}
                                 {item.scope === 'national' ? 'Nasional' : 'Wilayah'}
                              </Badge>
                              <span className="text-[11px] text-gray-500 font-bold">
                                 Oleh: <span className="text-gray-800 font-extrabold">{item.authorName || 'Sistem'} {item.authorRegionName ? `(${item.authorRegionName})` : ''}</span>
                              </span>
                              <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
                                 <Clock size={12} /> {new Date(item.createdAt).toLocaleDateString('id-ID')}
                              </span>
                           </div>
                          <h3 className="text-[15px] font-semibold text-gray-900 group-hover:text-[#DCAF01] transition-colors truncate uppercase">
                             {item.title}
                          </h3>
                          <p className="text-[13px] text-gray-500 line-clamp-1 leading-relaxed">
                             {stripHtml(item.content)}
                          </p>
                       </div>

                       <div className="shrink-0 pt-2 md:pt-0 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                          {isManagement && canEditOrDelete(item) ? (
                             <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => navigate(`${getAddPath().replace('/add', '')}/${item.id}/edit`)}
                                  className="p-2 hover:bg-blue-50 rounded text-blue-500 border-0 bg-transparent cursor-pointer"
                                >
                                   <Edit size={16} />
                                </button>
                                <button 
                                  onClick={() => setConfirmDelete(item)}
                                  className="p-2 hover:bg-red-50 rounded text-red-500 border-0 bg-transparent cursor-pointer"
                                >
                                   <Trash2 size={16} />
                                </button>
                             </div>
                          ) : (
                             <>
                                {!isManagement && !item.isRead && (
                                  <button 
                                     onClick={(e) => handleMarkAsRead(e, item.id)}
                                     className="text-[11px] font-semibold text-gray-400 hover:text-emerald-600 transition-colors border-0 bg-transparent cursor-pointer opacity-0 group-hover:opacity-100 animate-fade"
                                  >
                                     Tandai Dibaca
                                  </button>
                                )}
                                <Button variant="outline" size="sm" className="bg-white font-semibold group-hover:bg-[#DCAF01] group-hover:text-gray-900 border-gray-200" onClick={() => navigate(getDetailPath(item.id))}>
                                   Baca Detail
                                </Button>
                             </>
                          )}
                       </div>
                    </div>
                 </div>
               </Card>
             ))
           ) : (
             <Card>
                <div className="py-20 text-center space-y-3">
                   <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                      <Megaphone size={32} />
                   </div>
                   <p className="text-[14px] font-semibold text-gray-900">Tidak ada pengumuman</p>
                   <p className="text-[12px] text-gray-500">Coba ubah kata kunci pencarian atau filter Anda.</p>
                </div>
             </Card>
           )}
           <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
         </div>
      )}

      {/* Confirmation Delete */}
      <ConfirmationModal 
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Pengumuman?"
        message={`Pengumuman "${confirmDelete?.title}" akan dihapus permanen.`}
      />
    </div>
  );
};

export default Announcements;
