import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { 
  ChevronLeft, 
  Clock, 
  Globe, 
  MapPin, 
  Map as MapIcon,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Loader2,
  Edit,
  Trash2,
  Megaphone,
  User as UserIcon,
  Eye,
  EyeOff
} from 'lucide-react';
import { announcementApi } from '../../services/announcementApi';
import { regionApi } from '../../services/regionApi';
import { cn } from '../../utils/cn';
import { toast } from '../../stores/toastStore';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import ConfirmModal from '../../components/ui/ConfirmModal';

const AnnouncementDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [announcement, setAnnouncement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [targetNames, setTargetNames] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isAdmin = user?.role === 'admin_pusat' || user?.role === 'super_admin' || user?.role === 'admin_wilayah';
  const isAdminWilayah = user?.role === 'admin_wilayah';
  const isOwner = announcement?.authorId === user?.id;
  const canManage = !isAdminWilayah || isOwner;
  const basePath = user?.role === 'admin_wilayah' ? '/app/admin-wilayah' : '/app/admin-pusat';

  useEffect(() => {
    if (id) {
      fetchAnnouncement();
    }
  }, [id]);

  const toTitleCase = (str: string) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const res = await announcementApi.getById(id!);
      const data = res.data?.data || res.data;
      setAnnouncement(data);

      // Automatically mark as read when viewed
      try {
        await announcementApi.markAsRead(id!);
      } catch (e) {
        console.error('Failed to mark announcement as read:', e);
      }

      // Resolve target names for regions only (admin_pusat & super_admin only)
      const canReadRegions = user?.role === 'admin_pusat' || user?.role === 'super_admin';
      if (canReadRegions && data.scope === 'region' && data.targetRegions?.length > 0) {
        const regRes = await regionApi.getAll({ limit: 1000 });
        const regData = regRes.data?.data?.data || regRes.data?.data || regRes.data || [];
        const names = regData
          .filter((r: any) => data.targetRegions.includes(r.id))
          .map((r: any) => toTitleCase(r.name));
        setTargetNames(names);
      }
    } catch (err) {
      toast.error('Gagal memuat detail pengumuman.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await announcementApi.delete(id!);
      toast.success('Pengumuman berhasil dihapus');
      navigate(`${basePath}/announcements`);
    } catch (err: any) {
      toast.error('Gagal menghapus pengumuman');
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (loading && !announcement) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-4">
        <Loader2 size={32} className="animate-spin opacity-40" />
        <p className="text-[13px] font-medium">Memuat detail pengumuman...</p>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertCircle size={48} className="mx-auto text-gray-300" />
        <h2 className="text-lg font-semibold text-gray-900">Pengumuman Tidak Ditemukan</h2>
        <Button variant="white" onClick={() => navigate(-1)}>Kembali ke Daftar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade pb-10 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <PageHeader 
            title="Detail Pengumuman" 
            subtitle="Informasi resmi dan agenda kegiatan PPS Padjadjaran."
            className="mb-0"
          />
        </div>

        {isAdmin && canManage && (
          <div className="flex items-center gap-2 sm:ml-0">
             <Button 
               variant="white" 
               icon={<Edit size={16} />} 
               className="h-9 text-[12px] font-bold border-gray-200"
               onClick={() => navigate(`${basePath}/announcements/${id}/edit`)}
             >
               Edit
             </Button>
             <Button 
               variant="danger" 
               icon={<Trash2 size={16} />} 
               className="h-9 text-[12px] font-bold"
               onClick={() => setShowDeleteModal(true)}
             >
               Hapus
             </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Announcement Content */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant={announcement.scope === 'national' ? 'info' : 'warning'} className="font-bold uppercase tracking-wider text-[10px]">
                    {announcement.scope === 'national' ? <Globe size={10} className="mr-1" /> : <MapPin size={10} className="mr-1" />}
                    {announcement.scope === 'national' ? 'Nasional' : 'Lokal/Wilayah'}
                  </Badge>
                  
                  <Badge variant={announcement.isPublished ? 'success' : 'gray'} className="font-bold uppercase tracking-wider text-[10px]">
                    {announcement.isPublished ? <CheckCircle2 size={10} className="mr-1" /> : <Clock size={10} className="mr-1" />}
                    {announcement.isPublished ? 'Terbit' : 'Draf'}
                  </Badge>

                  <div className="h-4 w-px bg-gray-200 hidden md:block" />

                  <span className="text-[11px] text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-tighter">
                    <Calendar size={13} /> {new Date(announcement.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>

                  {isAdmin && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100">
                      <Eye size={12} className="text-[#DCAF01]" />
                      <span className="text-[10px] font-bold text-gray-600">{announcement.viewCount || 0} Dilihat</span>
                    </div>
                  )}
                </div>

                <h1 className="text-[20px] md:text-[24px] font-bold text-gray-900 leading-tight tracking-tight font-inter">
                  {announcement.title}
                </h1>
              </div>

              <div className="prose prose-stone max-w-none border-y border-gray-50 py-6">
                <div 
                  className="text-[14px] text-gray-600 leading-relaxed font-inter"
                  dangerouslySetInnerHTML={{ __html: announcement.content }}
                />
              </div>

              {announcement.scope !== 'national' && targetNames.length > 0 && (
                <div className="space-y-2 text-left pt-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <MapIcon size={12} /> Wilayah Target:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {targetNames.map((name, i) => (
                      <span key={i} className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-gray-50 text-gray-700 border border-gray-200 uppercase tracking-tighter">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2.5">
                   <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                      <UserIcon size={20} />
                   </div>
                   <div className="text-left">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Dipublikasikan Oleh</p>
                      <p className="text-[13px] font-bold text-gray-700 leading-none">
                        {announcement.authorName || announcement.author?.profile?.fullName || 'Sekretariat PPS'} 
                        {announcement.authorRegionName ? ` (${announcement.authorRegionName})` : ''}
                      </p>
                   </div>
                </div>
                
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 self-start sm:self-auto">
                  <CheckCircle2 size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Informasi Resmi PPS Padjadjaran</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Empty */}
        <div className="lg:col-span-4" />
      </div>

      <ConfirmModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Hapus Pengumuman Resmi?"
        message={`Apakah Anda yakin ingin menghapus "${announcement.title}"? Tindakan ini akan menghapus jejak informasi dari seluruh dashboard anggota secara permanen.`}
        variant="danger"
      />
    </div>
  );
};

export default AnnouncementDetail;
