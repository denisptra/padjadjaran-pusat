import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import { 
  Users, MapPin, AlertCircle, Clock, Megaphone, CheckCircle2, 
  CreditCard, ShieldAlert, FileText, Globe, ShieldCheck, ArrowRight, Zap, TrendingUp,
  RotateCcw
} from 'lucide-react';
import { dashboardApi } from '@/services/dashboardApi';
import { announcementApi } from '@/services/announcementApi';
import { toast } from '@/stores/toastStore';
import { useNavigate, Link } from 'react-router-dom';
import Skeleton from '@/components/ui/Skeleton';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import PieChart from '@/components/ui/PieChart';
import BarChart from '@/components/ui/BarChart';
import KTACard from '@/components/ui/KTACard';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { stripHtml } from '@/utils/stripHtml';

const AdminPusatDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activePopup, setActivePopup] = useState<any>(null);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getSummary();
      const summaryData = res.data?.data || res.data;
      setData(summaryData);

      if (summaryData?.popupAnnouncement) {
        setActivePopup(summaryData.popupAnnouncement);
      }
    } catch (err) {
      toast.error('Gagal memuat statistik dashboard');
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

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const announcements = charts?.recentAnnouncements || [];

  const statItems = [
    { title: 'Total Anggota', value: stats.totalMembers, icon: Users, variant: 'primary' },
    { title: 'Anggota Baru (Bln)', value: stats.newRegistrants, icon: Users, variant: 'info' },
    { title: 'Data Belum Lengkap', value: stats.incompleteMembers, icon: FileText, variant: 'warning' },
    { title: 'Approval Menunggu', value: stats.pendingApprovals, icon: Clock, variant: 'info' },
    { title: 'Pembayaran Menunggu', value: stats.pendingPayments, icon: CreditCard, variant: 'danger' },
    { title: 'Total Wilayah', value: stats.totalRegions, icon: MapPin, variant: 'primary' },
    { title: 'Wilayah Tanpa Admin', value: stats.regionsWithoutAdmin, icon: ShieldAlert, variant: 'danger' },
    { title: 'Total Admin Wilayah', value: stats.totalAdminWilayah, icon: Users, variant: 'primary' },
    { title: 'KTA Jatuh Tempo', value: stats.ktaExpiringSoon, icon: Clock, variant: 'warning' },
    { title: 'Pengunjung Web (H)', value: stats.pageViewsToday, icon: Globe, variant: 'success' },
  ];

  return (
    <div className="space-y-8 animate-fade pb-12 text-left font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="Pusat Kendali Administrasi" 
          subtitle={`Halo, ${user?.fullName || 'Admin'}. Selamat datang di dashboard utama PPS Padjadjaran.`} 
          className="mb-0"
        />
        <div className="flex items-center gap-2">
            <div className="flex flex-col items-end text-right mr-2 hidden sm:flex">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Waktu Server</span>
                <span className="text-[13px] font-mono font-bold text-gray-700">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
            </div>
            <Button variant="white" size="sm" icon={<RotateCcw size={14} />} onClick={fetchDashboardData} isLoading={loading}>Refresh</Button>
        </div>
      </div>

      {/* 1. Top Section: KTA & Status (Left) vs Announcements (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         {/* Left Side: KTA and Membership Status */}
         <div className="lg:col-span-5 space-y-6">
            <Card title="Identitas Digital Pengurus">
               <div className="flex justify-center py-4">
                  <KTACard 
                    fullName={user?.fullName || ''}
                    ktaNumber={user?.ktaNumber || 'PPS-ADMIN'}
                    memberType={user?.memberType || 'KHUSUS'}
                    wilayahName="Pusat"
                    placeOfBirth={user?.birthPlace || 'JAKARTA'}
                    dateOfBirth={user?.birthDate ? new Date(user.birthDate).toLocaleDateString('id-ID') : '01-01-1980'}
                    address={user?.address || ''}
                    registeredAt={(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString() : '-'}
                    status={user?.status || 'ACTIVE'}
                    photoUrl={user?.avatarUrl}
                  />
               </div>
            </Card>

            <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                <div className="flex items-center justify-between">
                   <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Status Otoritas Pengurus</p>
                      <h3 className="text-xl font-bold mt-1">
                         {loading ? <Skeleton className="h-6 w-32 bg-gray-700" /> : (user?.role === 'admin_pusat' ? 'Administrator Pusat' : 'Akses Terverifikasi')}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Kategori: <span className="capitalize">{user?.memberType?.replace('_', ' ') || 'Umum'}</span> • 
                        Tingkat: <span className="capitalize">{user?.role?.replace('_', ' ') || 'Admin'}</span>
                      </p>
                   </div>
                   {loading ? <Skeleton className="h-8 w-20 bg-gray-700" /> : (
                      <Badge variant={user?.status === 'ACTIVE' ? 'success' : 'warning'}>
                         {user?.status === 'ACTIVE' ? 'AKTIF' : 'PENDING'}
                      </Badge>
                   )}
                </div>
            </Card>
         </div>
         
         {/* Right Side: Announcements Feed */}
         <div className="lg:col-span-7 h-full">
            <Card 
              title="Pengumuman Internal" 
              subtitle="Informasi dan edaran terbaru untuk pengurus pusat."
              className="h-full min-h-[480px]"
              action={
                <Link to="/app/admin-pusat/announcements" className="text-[#DCAF01] text-[12px] font-semibold flex items-center gap-1 hover:underline">
                  Lihat Semua <ArrowRight size={14} />
                </Link>
              }
            >
              <div className="space-y-4 mt-2">
                {loading ? (
                  [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
                ) : announcements.length > 0 ? announcements.map((item: any) => (
                  <div key={item.id} className="p-5 rounded-2xl border border-gray-100 hover:border-[#DCAF01]/30 hover:bg-gray-50/50 transition-all group relative">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <Megaphone size={14} className="text-[#DCAF01]" />
                            <h4 className="text-[14px] font-bold text-gray-900">{item.title}</h4>
                        </div>
                        <Button size="xs" variant="white" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleMarkAsRead(item.id)}>Tandai Dibaca</Button>
                    </div>
                    <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed">{stripHtml(item.content)}</p>
                    <div className="mt-3 flex items-center gap-3 text-[10px] text-gray-400 font-medium">
                        <span className="flex items-center gap-1"><Clock size={10} /> {new Date(item.createdAt).toLocaleDateString('id-ID')}</span>
                        <span className="h-1 w-1 rounded-full bg-gray-300" />
                        <span className="uppercase tracking-tighter">Pusat</span>
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center text-gray-400 text-[13px]">
                     <AlertCircle size={32} className="mx-auto mb-3 opacity-20" />
                     <p className="font-medium">Belum ada pengumuman terbaru.</p>
                  </div>
                )}
              </div>
            </Card>
         </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-4">
        {statItems.map((item, idx) => (
          <StatCard key={idx} title={item.title} value={loading ? <Skeleton className="h-5 w-10" /> : (item.value?.toString() || '0')} icon={<item.icon size={16} />} variant={item.variant as any} />
        ))}
      </div>

      {/* 3. Trends & Growth Section (Bar Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Tren Pengunjung Website" subtitle="Kunjungan halaman 7 hari terakhir.">
            {loading ? <Skeleton className="h-48 w-full" /> : <BarChart data={charts.pageViewTrends?.map((p: any) => ({ label: p.date, value: p.count })) || []} height={200} color="#3B82F6" showValues={true} />}
        </Card>

        <Card title="Tren Pembaca Berita" subtitle="Kunjungan berita & artikel 7 hari terakhir.">
            {loading ? <Skeleton className="h-48 w-full" /> : <BarChart data={charts.newsViewTrends?.map((p: any) => ({ label: p.date, value: p.count })) || []} height={200} color="#10B981" showValues={true} />}
        </Card>

        <Card title="Pertumbuhan Anggota" subtitle="Pendaftaran 6 bulan terakhir.">
            {loading ? <Skeleton className="h-48 w-full" /> : <BarChart data={charts.memberGrowth?.map((g: any) => ({ label: g.month, value: g.count })) || []} height={200} showValues={true} />}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
            <Card title="Sebaran Anggota per Wilayah" subtitle="Populasi anggota di berbagai wilayah aktif.">
                {loading ? <Skeleton className="h-64 w-full" /> : (
                    <div className="w-full pr-2">
                        <BarChart 
                          data={charts?.membersPerRegion?.map((r: any) => ({ label: r.name, value: r.count })) || []} 
                          height={Math.max(200, (charts?.membersPerRegion?.length || 0) * 40)} 
                          showValues={true} 
                          horizontal={true}
                        />
                    </div>
                )}
            </Card>
        </div>
        <div className="lg:col-span-4 space-y-6">
            <Card title="Konten Terpopuler" subtitle="Berita & artikel yang paling banyak dibaca.">
               <div className="space-y-4">
                  {loading ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />) : (
                    <>
                      {charts.topNews?.map((news: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                           <div className="min-w-0 flex-1">
                              <p className="text-[12px] font-bold text-gray-900 truncate uppercase">{news.title}</p>
                              <p className="text-[10px] text-gray-400 font-medium">Kategori: Berita</p>
                           </div>
                           <div className="ml-3 flex items-center gap-1.5 text-[#DCAF01]">
                              <TrendingUp size={14} />
                              <span className="text-[13px] font-bold">{news.viewCount}</span>
                           </div>
                        </div>
                      ))}
                      {charts.topArticles?.map((art: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                           <div className="min-w-0 flex-1">
                              <p className="text-[12px] font-bold text-gray-900 truncate uppercase">{art.title}</p>
                              <p className="text-[10px] text-gray-400 font-medium">Kategori: Artikel</p>
                           </div>
                           <div className="ml-3 flex items-center gap-1.5 text-blue-500">
                              <TrendingUp size={14} />
                              <span className="text-[13px] font-bold">{art.viewCount}</span>
                           </div>
                        </div>
                      ))}
                    </>
                  )}
               </div>
            </Card>
        </div>
      </div>

      {/* 4. Composition & Ratios Section (Pie Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Status Keaktifan Anggota" subtitle="Perbandingan status anggota saat ini.">
            {loading ? <Skeleton className="h-48 w-full" /> : (
              <PieChart data={[
                { name: 'Aktif', value: stats.activeMembers || 0, color: '#10B981' },
                { name: 'Non-aktif', value: stats.inactiveMembers || 0, color: '#EF4444' },
                { name: 'Pending', value: stats.pendingMembers || 0, color: '#F59E0B' }
              ]} />
            )}
        </Card>

        <Card title="Komposisi Tipe Anggota" subtitle="Distribusi berdasarkan jalur registrasi.">
            {loading ? <Skeleton className="h-48 w-full" /> : (
              <PieChart data={charts?.memberTypeDist?.map((item: any) => {
                const type = (item.type || '').toLowerCase();
                let name = 'Umum';
                let color = '#111827';

                if (type.includes('khusus')) {
                  name = 'Khusus';
                  color = '#DCAF01';
                } else if (type.includes('pencak') || type.includes('silat')) {
                  name = 'Pencak Silat';
                  color = '#EF4444';
                }

                return { name, value: item.count || 0, color };
              }) || []} />
            )}
        </Card>

        <Card title="Distribusi Konten CMS" subtitle="Rasio publikasi berdasarkan kategori.">
            {loading ? <Skeleton className="h-48 w-full" /> : <PieChart data={charts?.cmsContentDist?.map((item: any) => ({ name: item.type, value: item.count, color: item.type === 'News' ? '#10B981' : item.type === 'Articles' ? '#3B82F6' : item.type === 'Gallery' ? '#F59E0B' : '#6B7280' })) || []} />}
        </Card>
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

export default AdminPusatDashboard;
