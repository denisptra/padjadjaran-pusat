import React, { useEffect, useState } from 'react';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import StatCard from '../../../components/ui/StatCard';
import { 
  Users, 
  Activity, 
  Database, 
  ShieldCheck, 
  Zap,
  HardDrive,
  Cpu,
  Globe,
  Settings,
  AlertTriangle,
  Loader2,
  Megaphone,
  Clock,
  ArrowRight,
  Newspaper,
  Image as ImageIcon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../../services/dashboardApi';
import { announcementApi } from '../../../services/announcementApi';
import { cn } from '../../../utils/cn';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Skeleton from '../../../components/ui/Skeleton';
import { stripHtml } from '../../../utils/stripHtml';

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, announcementsRes] = await Promise.all([
        dashboardApi.getSuperAdminSummary(),
        announcementApi.getAll()
      ]);
      setData(summaryRes.data);
      const personalAnnouncements = announcementsRes.data?.data || [];
      setAnnouncements(personalAnnouncements);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await announcementApi.markAsRead(id);
      fetchDashboardData();
    } catch (err) {
      // ignore
    }
  };

  const stats = data?.stats || {
    totalUsers: 0,
    activeSessions: 0,
    totalAuditLogs: 0,
    lastBackup: '-',
    emailOtpEnabled: true,
    maintenanceMode: false,
  };

  const unreadAnnouncements = announcements.slice(0, 3);

  return (
    <div className="space-y-8 animate-fade pb-10 text-left">
      <PageHeader 
        title="Pusat Kendali Sistem" 
        subtitle="Monitoring infrastruktur, keamanan, dan aktivitas global portal PPS Padjadjaran."
      />

      {/* Real-time System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Pengguna" 
          value={loading ? <Skeleton className="h-8 w-24" /> : stats.totalUsers.toLocaleString()} 
          icon={<Users size={20} />} 
          trend="up" 
          description="+0 hari ini" 
        />
        <StatCard 
          title="Sesi Aktif" 
          value={loading ? <Skeleton className="h-8 w-16" /> : stats.activeSessions.toString()} 
          icon={<Zap size={20} />} 
          variant="success" 
        />
        <StatCard 
          title="Audit Logs" 
          value={loading ? <Skeleton className="h-8 w-24" /> : stats.totalAuditLogs.toLocaleString()} 
          icon={<Activity size={20} />} 
          variant="info" 
        />
        <StatCard 
          title="Backup Terakhir" 
          value={loading ? <Skeleton className="h-8 w-32" /> : stats.lastBackup} 
          icon={<Database size={20} />} 
          variant="warning" 
        />
      </div>

      {/* Main Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <Card className="hover:border-[#DCAF01]/30 transition-all group cursor-pointer" onClick={() => navigate('/app/super-admin/users')}>
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Users size={24} />
               </div>
               <div className="text-left">
                  <h4 className="text-[14px] font-semibold text-gray-900 leading-tight uppercase">Manajemen User</h4>
                  <p className="text-[11px] text-gray-500 mt-1">Kelola akun dan role</p>
               </div>
            </div>
         </Card>
         <Card className="hover:border-[#DCAF01]/30 transition-all group cursor-pointer" onClick={() => navigate('/app/super-admin/audit-logs')}>
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <Activity size={24} />
               </div>
               <div className="text-left">
                  <h4 className="text-[14px] font-semibold text-gray-900 leading-tight uppercase">Audit Logs</h4>
                  <p className="text-[11px] text-gray-500 mt-1">Pantau riwayat aktivitas</p>
               </div>
            </div>
         </Card>
         <Card className="hover:border-[#DCAF01]/30 transition-all group cursor-pointer" onClick={() => navigate('/app/super-admin/backup')}>
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
                  <Database size={24} />
               </div>
               <div className="text-left">
                  <h4 className="text-[14px] font-semibold text-gray-900 leading-tight uppercase">Manajemen Backup</h4>
                  <p className="text-[11px] text-gray-500 mt-1">Amankan database sistem</p>
               </div>
            </div>
         </Card>
         <Card className="hover:border-[#DCAF01]/30 transition-all group cursor-pointer" onClick={() => navigate('/app/super-admin/feature-control')}>
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <ShieldCheck size={24} />
               </div>
               <div className="text-left">
                  <h4 className="text-[14px] font-semibold text-gray-900 leading-tight uppercase">Kontrol Fitur</h4>
                  <p className="text-[11px] text-gray-500 mt-1">Atur modul aktif</p>
               </div>
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Infrastructure Monitoring */}
         <div className="lg:col-span-8 space-y-6">
            <Card title="Status Infrastruktur" subtitle="Kondisi kesehatan server dan database secara real-time.">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
                  <div className="space-y-4 text-left">
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-700">
                           <Cpu size={16} className="text-gray-400" /> CPU Usage
                        </div>
                        <span className="text-[12px] font-semibold text-emerald-600">12% Normal</span>
                     </div>
                     <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[12%]" />
                     </div>

                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-700">
                           <HardDrive size={16} className="text-gray-400" /> Memory Usage
                        </div>
                        <span className="text-[12px] font-semibold text-amber-600">45% Medium</span>
                     </div>
                     <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 w-[45%]" />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-3 rounded bg-emerald-50 border border-emerald-100">
                        <div className="flex items-center gap-3 text-emerald-700">
                           <Globe size={18} />
                           <span className="text-[12px] font-semibold uppercase tracking-wider">Web Server</span>
                        </div>
                        <Badge variant="success">ONLINE</Badge>
                     </div>
                     <div className="flex items-center justify-between p-3 rounded bg-emerald-50 border border-emerald-100">
                        <div className="flex items-center gap-3 text-emerald-700">
                           <Database size={18} />
                           <span className="text-[12px] font-semibold uppercase tracking-wider">Database Node</span>
                        </div>
                        <Badge variant="success">STABLE</Badge>
                     </div>
                  </div>
               </div>
            </Card>

            <Card title="Percobaan Login Gagal Terakhir">
               <div className="space-y-4">
                  {[
                    { email: 'anonymous@attacker.com', ip: '203.114.2.1', time: '5 menit lalu', country: 'Russia' },
                    { email: 'member@example.com', ip: '110.12.33.1', time: '2 jam lalu', country: 'Indonesia' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-md border border-red-50 bg-red-50/30">
                       <div className="flex items-center gap-4 text-left">
                          <div className="h-9 w-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                             <AlertTriangle size={18} />
                          </div>
                          <div>
                             <p className="text-[13px] font-semibold text-gray-900">{item.email}</p>
                             <p className="text-[11px] text-gray-500 font-medium">IP: {item.ip} • {item.country}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[12px] font-semibold text-red-600">GAGAL</p>
                          <p className="text-[10px] text-gray-400 font-medium uppercase">{item.time}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </Card>

            <Card 
              title="Warta & Pengumuman" 
              subtitle="Informasi resmi untuk seluruh anggota."
              action={
                <Link to="/app/super-admin/announcements" className="text-[#DCAF01] text-[12px] font-semibold flex items-center gap-1 hover:underline">
                  Lihat Semua <ArrowRight size={14} />
                </Link>
              }
            >
              <div className="space-y-4">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-gray-150">
                       <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                       <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-1/2" />
                       </div>
                    </div>
                  ))
                ) : unreadAnnouncements.length > 0 ? unreadAnnouncements.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-start gap-4 p-4 rounded-xl border border-gray-150 hover:border-[#DCAF01]/30 hover:bg-[#DCAF01]/5 transition-all group cursor-pointer"
                    onClick={() => navigate(`/app/super-admin/announcements/${item.id}`)}
                  >
                    <div className="h-10 w-10 rounded-lg bg-[#DCAF01]/10 flex items-center justify-center text-[#DCAF01] shrink-0 group-hover:scale-110 transition-transform">
                      <Megaphone size={18} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                         <h4 className="text-[13px] font-semibold text-gray-900 uppercase tracking-tight leading-tight">{item.title}</h4>
                         <Button 
                           variant="white"
                           size="xs"
                           onClick={(e) => { e.stopPropagation(); handleMarkAsRead(item.id); }}
                           className="opacity-0 group-hover:opacity-100 uppercase tracking-wider text-emerald-600 border-emerald-50 hover:bg-emerald-50 h-7"
                         >
                            Tandai Dibaca
                         </Button>
                      </div>
                      <p className="text-[12.5px] text-gray-500 line-clamp-2 leading-relaxed">{stripHtml(item.content)}</p>
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
                     <AlertTriangle size={32} className="mx-auto mb-2 opacity-20" />
                     <p className="font-medium">Belum ada pengumuman terbaru.</p>
                  </div>
                )}
              </div>
            </Card>

            <Card 
              title="Berita Terkini (CMS)" 
              subtitle="Artikel terbaru yang dipublikasikan ke portal publik."
              action={
                <Link to="/app/cms/articles" className="text-[#DCAF01] text-[12px] font-semibold flex items-center gap-1 hover:underline">
                  Kelola Artikel <ArrowRight size={14} />
                </Link>
              }
            >
              <div className="space-y-4">
                 {loading ? (
                    [...Array(2)].map((_, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-xl border border-gray-150">
                        <Skeleton className="h-16 w-24 rounded-lg shrink-0" />
                        <div className="flex-1 space-y-2">
                           <Skeleton className="h-4 w-3/4" />
                           <Skeleton className="h-3 w-full" />
                           <Skeleton className="h-2 w-1/4" />
                        </div>
                      </div>
                    ))
                 ) : (data?.recentNews || []).length > 0 ? (data.recentNews).map((news: any) => (
                   <div key={news.id} className="flex gap-4 p-4 rounded-xl border border-gray-150 hover:bg-gray-50 transition-all text-left">
                     <div className="h-16 w-24 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                        {news.imageUrl ? (
                           <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-400"><Newspaper size={20} /></div>
                        )}
                     </div>
                     <div className="flex-1">
                        <h4 className="text-[13px] font-semibold text-gray-900 line-clamp-1">{news.title}</h4>
                        <p className="text-[12px] text-gray-500 line-clamp-2 mt-1">{news.content}</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-2">{new Date(news.createdAt).toLocaleDateString('id-ID')}</p>
                     </div>
                   </div>
                 )) : (
                   <p className="text-[12px] text-gray-400 text-center py-6">Belum ada berita yang diterbitkan.</p>
                 )}
              </div>
            </Card>
         </div>

         {/* Right Column */}
         <div className="lg:col-span-4 space-y-6">
            <Card title="Pusat Keamanan">
               <div className="space-y-4 text-left">
                  <div className="p-4 bg-gray-50 rounded-md border border-gray-100">
                     <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-widest mb-1">Email OTP</p>
                     <div className="flex items-center justify-between">
                        {loading ? <Skeleton className="h-5 w-16" /> : (
                          <span className={cn("text-[13px] font-bold", stats.emailOtpEnabled ? "text-emerald-600" : "text-red-600")}>
                            {stats.emailOtpEnabled ? 'AKTIF' : 'NONAKTIF'}
                          </span>
                        )}
                        <Link to="/app/super-admin/feature-control" className="text-[11px] text-blue-600 font-semibold hover:underline uppercase">Ubah</Link>
                     </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-md border border-gray-100">
                     <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-widest mb-1">Mode Pemeliharaan</p>
                     <div className="flex items-center justify-between">
                        {loading ? <Skeleton className="h-5 w-16" /> : (
                          <span className={cn("text-[13px] font-bold", stats.maintenanceMode ? "text-amber-600" : "text-emerald-600")}>
                            {stats.maintenanceMode ? 'AKTIF' : 'NONAKTIF'}
                          </span>
                        )}
                        <Link to="/app/super-admin/feature-control" className="text-[11px] text-blue-600 font-semibold hover:underline uppercase">Ubah</Link>
                     </div>
                  </div>
                  <Button variant="white" className="w-full border-gray-200 h-10 font-semibold uppercase text-[11px]" onClick={() => navigate('/app/super-admin/action-matrix')}>
                     <ShieldCheck size={16} className="mr-2" /> Konfigurasi Hak Akses
                  </Button>
               </div>
            </Card>

            <Card title="Dukungan Teknis">
               <div className="space-y-4 text-left">
                  <div className="flex items-start gap-3">
                     <div className="h-8 w-8 rounded bg-[#DCAF01]/10 text-[#DCAF01] flex items-center justify-center shrink-0">
                        <Settings size={16} />
                     </div>
                     <p className="text-[12px] text-gray-600 leading-relaxed font-medium">
                        Gunakan fitur <strong>Simulasi Sesi</strong> untuk mereproduksi kendala yang dilaporkan oleh anggota atau admin wilayah.
                     </p>
                  </div>
                  <Button className="w-full font-semibold uppercase text-[12px]" onClick={() => navigate('/app/super-admin/users')}>
                     Mulai Simulasi User
                  </Button>
               </div>
            </Card>

            <Card 
              title="Galeri Terbaru" 
              subtitle="Media yang diunggah ke portal."
              action={
                <Link to="/app/cms/gallery" className="text-[#DCAF01] text-[12px] font-semibold flex items-center gap-1 hover:underline">
                  Kelola Galeri <ArrowRight size={14} />
                </Link>
              }
            >
              <div className="grid grid-cols-2 gap-3">
                 {loading ? (
                    [...Array(4)].map((_, i) => (
                       <Skeleton key={i} className="aspect-square rounded-lg" />
                    ))
                 ) : (data?.recentGallery || []).length > 0 ? (data.recentGallery).map((item: any) => (
                    <div key={item.id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                       <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                          <p className="text-white text-[10px] font-semibold truncate">{item.title}</p>
                       </div>
                    </div>
                 )) : (
                    <div className="col-span-2 text-center py-8 text-gray-400 text-[12px]">
                       <ImageIcon size={24} className="mx-auto mb-2 opacity-30" />
                       Belum ada foto galeri.
                    </div>
                 )}
              </div>
            </Card>
         </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
