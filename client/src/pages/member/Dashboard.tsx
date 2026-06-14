import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import KTACard from '@/components/ui/KTACard';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { 
  Megaphone, 
  ArrowRight,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardApi } from '@/services/dashboardApi';
import { announcementApi } from '@/services/announcementApi';
import { toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { stripHtml } from '@/utils/stripHtml';

const MemberDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePopup, setActivePopup] = useState<any>(null);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, announcementsRes] = await Promise.all([
        dashboardApi.getMemberSummary(),
        announcementApi.getAll()
      ]);
      const summaryData = summaryRes.data?.data || summaryRes.data;
      setData(summaryData);
      
      // If there is an active unread popup, show it
      if (summaryData?.popupAnnouncement) {
        setActivePopup(summaryData.popupAnnouncement);
      }

      const personalAnnouncements = announcementsRes.data?.data || [];
      setAnnouncements(personalAnnouncements);
    } catch (err) {
      console.error('Failed to fetch member summary', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await announcementApi.markAsRead(id);
      toast.success('Informasi telah ditandai sebagai dibaca.');
      fetchDashboardData();
    } catch (err) {
      toast.error('Gagal menandai sebagai dibaca.');
    }
  };

  const handleClosePopup = async () => {
    if (!activePopup) return;
    try {
      await announcementApi.markAsRead(activePopup.id);
      setActivePopup(null);
      fetchDashboardData();
    } catch (err) {
      setActivePopup(null);
    }
  };

  const unreadAnnouncements = announcements.slice(0, 5);

  return (
    <div className="space-y-8 animate-fade pb-12 text-left">
      <PageHeader 
        title={`Halo, ${user?.fullName || 'Anggota'}!`} 
        subtitle="Selamat datang di Portal Anggota PPS Padjadjaran." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Admin Identity & KTA */}
        <div className="lg:col-span-5 space-y-6">
           <Card title="Identitas Digital" subtitle="Kartu Tanda Anggota (E-KTA) resmi Anda.">
              <div className="flex justify-center items-start py-4">
                  {loading ? (
                    <div className="w-full max-w-[340px] sm:max-w-[410px] md:max-w-[450px] mx-auto">
                      <Skeleton className="aspect-[1.58/1] w-full rounded-2xl" />
                    </div>
                  ) : (
                    <KTACard 
                       fullName={user?.fullName || ''}
                       ktaNumber={user?.ktaNumber || 'PPS-PENDING'}
                       memberType={user?.memberType || 'UMUM'}
                       wilayahName={user?.region?.name || 'PUSAT'}
                       placeOfBirth={user?.birthPlace || "-"}
                       dateOfBirth={user?.birthDate ? new Date(user.birthDate).toLocaleDateString('id-ID') : "-"}
                       address={user?.address || ''}
                       registeredAt={(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString() : '-'}
                       status={user?.status || ''}
                       photoUrl={user?.avatarUrl}
                    />
                  )}
              </div>
           </Card>

           <Card title="Sekilas Informasi" subtitle="Rangkuman status keanggotaan Anda.">
               <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                     <span className="text-[12px] font-semibold text-gray-500">Cabang / Wilayah</span>
                     <span className="text-[13px] font-bold text-gray-900 uppercase">{user?.region?.name || 'Pusat'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                     <span className="text-[12px] font-semibold text-gray-500">Jenis Anggota</span>
                     <span className="text-[13px] font-bold text-gray-900 uppercase">{user?.memberType?.replace('_', ' ') || 'Umum'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                     <span className="text-[12px] font-semibold text-gray-500">Status Akun</span>
                     <span className={cn(
                        "text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                        user?.status === 'ACTIVE' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                     )}>
                        {user?.status === 'ACTIVE' ? 'Aktif' : 'Menunggu'}
                     </span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[12px] font-semibold text-gray-500">Tanggal Terdaftar</span>
                     <span className="text-[13px] font-bold text-gray-900">{(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString('id-ID') : '-'}</span>
                  </div>
               </div>
           </Card>
        </div>

        {/* Right Column: Announcements */}
        <div className="lg:col-span-7">
           <Card 
             title="Warta & Pengumuman Terbaru" 
             subtitle="Informasi resmi dari pusat dan wilayah untuk Anda."
             action={
               <Link to="/app/member/announcements" className="text-[#DCAF01] text-[12px] font-semibold flex items-center gap-1 hover:underline">
                 Lihat Semua <ArrowRight size={14} />
               </Link>
             }
           >
             <div className="space-y-4">
               {loading ? (
                 [...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl border border-gray-100">
                      <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-2 w-1/4" />
                      </div>
                    </div>
                 ))
               ) : unreadAnnouncements.length > 0 ? unreadAnnouncements.map((item) => (
                  <div 
                    key={item.id} 
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xl border transition-all group cursor-pointer",
                      item.isRead ? "border-gray-100 hover:border-[#DCAF01]/30 hover:bg-[#DCAF01]/5" : "border-l-4 border-l-[#DCAF01] border-gray-200 bg-[#DCAF01]/5"
                    )}
                    onClick={() => navigate(`/app/member/announcements/${item.id}`)}
                  >
                    <div className="h-10 w-10 rounded-lg bg-[#DCAF01]/10 flex items-center justify-center text-[#DCAF01] shrink-0 group-hover:scale-110 transition-transform relative">
                      <Megaphone size={18} />
                      {!item.isRead && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                         <h4 className="text-[14px] font-semibold text-gray-900 uppercase tracking-tight leading-tight">{item.title}</h4>
                         {!item.isRead && (
                           <Button 
                             variant="white"
                             size="xs"
                             onClick={(e) => { e.stopPropagation(); handleMarkAsRead(item.id); }}
                             className="opacity-0 group-hover:opacity-100 uppercase tracking-wider text-emerald-600 border-emerald-50 hover:bg-emerald-50 h-7"
                           >
                              Tandai Dibaca
                           </Button>
                         )}
                      </div>
                     <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed">{stripHtml(item.content)}</p>
                     <div className="flex items-center gap-3 pt-2">
                       <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
                         <Clock size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                       </span>
                       <span className={cn(
                         "text-[9px] px-2 py-0.5 rounded font-semibold uppercase tracking-widest",
                         item.scope === 'national' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                       )}>
                         {item.scope === 'national' ? 'Nasional' : 'Wilayah'}
                       </span>
                     </div>
                   </div>
                 </div>
               )) : (
                 <div className="py-12 text-center text-gray-400 text-[13px]">
                    <AlertCircle size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="font-medium">Belum ada pengumuman terbaru untuk Anda.</p>
                 </div>
               )}
             </div>
           </Card>
        </div>
      </div>

      {/* Pop-up Announcement Modal */}
      {activePopup && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-[6px] animate-fade"
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999999 }}
        >
          <div className="bg-white rounded-lg max-w-lg w-full shadow-2xl overflow-hidden border border-gray-200 flex flex-col text-left">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-900 to-gray-800 text-white flex items-center gap-3">
              <Megaphone className="text-[#DCAF01] shrink-0" size={20} />
              <div>
                <span className="text-[9px] font-bold tracking-widest text-[#DCAF01] uppercase leading-none block mb-1">Pengumuman Penting</span>
                <h3 className="text-base font-bold truncate leading-tight">{activePopup.title}</h3>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-96 text-gray-600 text-[13px] leading-relaxed">
              <div 
                className="prose prose-stone max-w-none text-left" 
                dangerouslySetInnerHTML={{ __html: activePopup.content }} 
              />
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleClosePopup}
                className="font-bold uppercase tracking-wider text-[11px]"
              >
                Tutup & Tandai Dibaca
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default MemberDashboard;
