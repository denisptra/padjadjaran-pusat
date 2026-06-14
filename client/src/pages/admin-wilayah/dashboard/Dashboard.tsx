import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import { 
  Users, AlertCircle, Clock, Megaphone, CheckCircle2, 
  CreditCard, FileText, ArrowRight, RotateCcw, ShieldCheck, User as UserIcon
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
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { stripHtml } from '@/utils/stripHtml';

const AdminWilayahDashboard: React.FC = () => {
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
      const res = await dashboardApi.getAdminWilayahSummary();
      const summaryData = res.data?.data || res.data;
      setData(summaryData);

      // If there is an unread popup announcement, open it in the modal
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
  const recentMembers = data?.recentMembers || [];

  const statItems = [
    { title: 'Total Anggota', value: stats.totalMembers, icon: Users, variant: 'primary' },
    { title: 'Anggota Baru (Bln)', value: stats.newRegistrants, icon: Users, variant: 'info' },
    { title: 'Data Belum Lengkap', value: stats.incompleteMembers, icon: FileText, variant: 'warning' },
    { title: 'Approval Menunggu', value: stats.pendingApprovals, icon: Clock, variant: 'info' },
    { title: 'Pembayaran Menunggu', value: stats.pendingPayments, icon: CreditCard, variant: 'danger' },
  ];

  const columns = [
    { 
      key: 'fullName', 
      label: 'Nama Lengkap',
      render: (val: string, row: any) => (
        <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-100 shrink-0">
                <UserIcon size={14} />
            </div>
            <span className="font-bold text-gray-900 text-[12px] uppercase">{row.fullName || val}</span>
        </div>
      )
    },
    { 
      key: 'memberType', 
      label: 'Tipe',
      render: (val: string) => (
        <Badge variant="gray" className="text-[9px] uppercase font-bold">{val?.replace('_', ' ') || '-'}</Badge>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (val: string) => (
        <Badge variant={val === 'ACTIVE' ? 'success' : val === 'PENDING' ? 'warning' : 'danger'} className="text-[9px] font-bold">
          {val === 'ACTIVE' ? 'AKTIF' : val === 'PENDING' ? 'PROSES' : 'NON-AKTIF'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: '',
      align: 'right' as const,
      render: (_: any, row: any) => (
        <Button size="xs" variant="white" className="h-7 text-[10px] font-bold" onClick={() => navigate(`/app/admin-wilayah/members/${row.id}`)}>Detail</Button>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-fade pb-12 text-left font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="Pusat Kendali Wilayah" 
          subtitle={`Halo, ${user?.fullName || 'Pengurus'}. Pantau data anggota di Wilayah ${data?.region?.name || user?.region?.name || ''}.`} 
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
                    wilayahName={data?.region?.name || user?.region?.name || 'Wilayah'}
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
                         {loading ? <Skeleton className="h-6 w-32 bg-gray-700" /> : 'Administrator Wilayah'}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Kategori: <span className="capitalize">{user?.memberType?.replace('_', ' ') || 'Umum'}</span> • 
                        Wilayah: <span className="capitalize">{data?.region?.name || 'Pengurus'}</span>
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
              subtitle="Informasi dan edaran wilayah dan nasional."
              className="h-full min-h-[480px]"
              action={
                <Link to="/app/admin-wilayah/announcements" className="text-[#DCAF01] text-[12px] font-semibold flex items-center gap-1 hover:underline">
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
                        <span className="uppercase tracking-tighter">{item.scope === 'national' ? 'Nasional' : 'Wilayah'}</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5">
          <Card title="Tren Pendaftaran Anggota" subtitle="Pertumbuhan anggota wilayah 6 bulan terakhir.">
              {loading ? <Skeleton className="h-48 w-full" /> : <BarChart data={charts.memberGrowth?.map((g: any) => ({ label: g.month, value: g.count })) || []} height={200} showValues={true} />}
          </Card>
        </div>
        <div className="lg:col-span-7">
           <Card 
             title="Registrasi Anggota Terbaru" 
             subtitle="Daftar 5 anggota terakhir yang bergabung di wilayah Anda."
             action={
               <Link to="/app/admin-wilayah/members" className="text-[#DCAF01] text-[12px] font-semibold flex items-center gap-1 hover:underline">
                 Lihat Semua Anggota <ArrowRight size={14} />
               </Link>
             }
             noPadding
           >
             {loading ? (
                <div className="p-6 space-y-4">
                   {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                   ))}
                </div>
             ) : recentMembers.length > 0 ? (
                <DataTable columns={columns} data={recentMembers} className="border-0 rounded-none" />
             ) : (
                <div className="py-12 text-center text-gray-400 text-[13px]">
                   Belum ada anggota yang terdaftar di wilayah ini.
                </div>
             )}
           </Card>
        </div>
      </div>

      {/* 4. Composition & Ratios Section (Pie Charts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Status Keaktifan" subtitle="Rasio anggota aktif vs non-aktif wilayah.">
            {loading ? <Skeleton className="h-48 w-full" /> : (
              <PieChart data={charts.activeStatusDist || []} />
            )}
        </Card>

        <Card title="Kategori Anggota" subtitle="Sebaran tipe anggota terdaftar wilayah.">
            {loading ? <Skeleton className="h-48 w-full" /> : (
              <PieChart data={charts.memberTypeDist || []} />
            )}
        </Card>

        <Card title="Distribusi Gender" subtitle="Rasio laki-laki vs perempuan di wilayah.">
            {loading ? <Skeleton className="h-48 w-full" /> : (
              <PieChart data={charts.gender || []} />
            )}
        </Card>

        <Card title="Status Persetujuan" subtitle="Rasio status verifikasi berkas wilayah.">
            {loading ? <Skeleton className="h-48 w-full" /> : (
              <PieChart data={charts.approvalStatusDist || []} />
            )}
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

export default AdminWilayahDashboard;
