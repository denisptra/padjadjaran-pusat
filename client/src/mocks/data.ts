import { LayoutDashboard, Megaphone, Users, MapPin, ClipboardCheck, CreditCard, Settings, Globe, ShieldCheck, Zap, Shield, Activity, Database, UsersRound } from 'lucide-react';
import { ROLES } from '../config/roles';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  wilayahId?: string;
  wilayahName?: string;
  status: 'active' | 'inactive' | 'pending';
  memberType?: 'Umum' | 'Khusus' | 'Pencak Silat';
  ktaNumber?: string;
  nik?: string;
  avatar?: string;
  lastLogin?: string;
  phone?: string;
  gender?: 'Laki-laki' | 'Perempuan';
  address?: string;
  completionStatus?: 'Lengkap' | 'Belum Lengkap' | 'Menunggu Verifikasi Pusat';
  joinDate?: string;
}

export interface MenuItem {
  key: string;
  label: string;
  path: string;
  icon: any;
  feature?: string;
  submenu?: { key: string; label: string; path: string }[];
}

export const users: User[] = [
  { id: '1', fullName: 'Ahmad Faisal', email: 'member@mail.com', role: ROLES.MEMBER, wilayahId: '10', wilayahName: 'Kota Tasikmalaya', status: 'active', memberType: 'Pencak Silat', ktaNumber: 'PPS-2026-0001', nik: '3278012345670001', lastLogin: '1 jam lalu', phone: '081234567890', gender: 'Laki-laki', address: 'Jl. Merdeka No. 10, Tasikmalaya', completionStatus: 'Lengkap', joinDate: '15 Mei 2026' },
  { id: '2', fullName: 'Siti Sarah', email: 'admin.wilayah@mail.com', role: ROLES.ADMIN_WILAYAH, wilayahId: '10', wilayahName: 'Kota Tasikmalaya', status: 'active', memberType: 'Khusus', ktaNumber: 'PPS-2026-0002', nik: '3278012345670002', lastLogin: '10 menit lalu', phone: '085211223344', gender: 'Perempuan', address: 'Jl. Sudirman No. 5, Tasikmalaya', completionStatus: 'Lengkap', joinDate: '10 Mei 2026' },
  { id: '3', fullName: 'Wirasena Subardjo', email: 'admin.pusat@mail.com', role: ROLES.ADMIN_PUSAT, status: 'active', lastLogin: '5 menit lalu', address: 'Jl. Thamrin No. 1, Jakarta', phone: '081122334455', gender: 'Laki-laki', joinDate: '01 Mei 2026' },
  { id: '4', fullName: 'Sultan Agung', email: 'super@mail.com', role: ROLES.SUPER_ADMIN, status: 'active', lastLogin: 'Baru saja', address: 'Istana Merdeka, Jakarta', phone: '081299887766', gender: 'Laki-laki', joinDate: '01 Jan 2026' },
  { id: '5', fullName: 'Budi Santoso', email: 'operator@mail.com', role: ROLES.MEMBER, wilayahId: '10', wilayahName: 'Kota Tasikmalaya', status: 'pending', memberType: 'Umum', ktaNumber: 'PPS-2026-0005', nik: '3278012345670005', lastLogin: '2 hari lalu', phone: '087712345678', gender: 'Laki-laki', address: 'Jl. Diponegoro No. 12, Tasikmalaya', completionStatus: 'Menunggu Verifikasi Pusat', joinDate: '01 Juni 2026' },
  { id: '6', fullName: 'Dewi Sartika', email: 'dewi@mail.com', role: ROLES.MEMBER, wilayahId: '10', wilayahName: 'Kota Tasikmalaya', status: 'inactive', memberType: 'Pencak Silat', ktaNumber: 'PPS-2026-0006', nik: '3278012345670006', lastLogin: 'Minggu lalu', phone: '089988776655', gender: 'Perempuan', address: 'Jl. Kartini No. 8, Tasikmalaya', completionStatus: 'Belum Lengkap', joinDate: '25 Mei 2026' },
  { id: '7', fullName: 'Hendra Wijaya', email: 'hendra@mail.com', role: ROLES.MEMBER, wilayahId: '10', wilayahName: 'Kota Tasikmalaya', status: 'active', memberType: 'Khusus', ktaNumber: 'PPS-2026-0007', nik: '3278012345670007', lastLogin: '3 jam lalu', phone: '081223344556', gender: 'Laki-laki', address: 'Jl. Pemuda No. 12, Tasikmalaya', completionStatus: 'Lengkap', joinDate: '28 Mei 2026' },
];

export const regions = [
  { 
    id: '10', 
    code: 'TSM-01',
    name: 'Kota Tasikmalaya', 
    leaderName: 'Siti Sarah', 
    phone: '0265-334455',
    address: 'Jl. Pemuda No. 45, Kota Tasikmalaya',
    description: 'Pusat kepengurusan wilayah Kota Tasikmalaya dengan fokus pengembangan silat prestasi.',
    status: 'Aktif',
    totalMembers: 150,
    createdAt: '12 Jan 2026'
  },
  { id: '11', code: 'GRT-02', name: 'Kab. Garut', leaderName: 'Belum Ada', totalMembers: 85, status: 'Aktif', createdAt: '15 Jan 2026' },
];

export const announcements = [
  { id: '1', title: 'Ujian Kenaikan Tingkat Nasional', content: 'Pelaksanaan UKT Nasional akan diadakan di Padepokan Pusat pada tanggal 15 Juni 2026. Seluruh anggota wajib hadir.', scope: 'national', date: '2026-06-15', status: 'published' },
  { id: '2', title: 'Latihan Gabungan Wilayah Tasik', content: 'Seluruh anggota wilayah Kota Tasikmalaya diharapkan hadir dalam latihan gabungan di Alun-alun Kota pada Minggu pagi.', scope: 'wilayah', wilayahId: '10', date: '2026-06-10', status: 'published' },
  { id: '3', title: 'Maintenance Sistem Anggota', content: 'Sistem akan mengalami pemeliharaan rutin pada tanggal 05 Juni 2026 pukul 00:00 WIB.', scope: 'system', date: '2026-06-05', status: 'published' },
];

export const statistics = {
  national: {
    totalMembers: 4520,
    activeMembers: 3850,
    incomplete: 45,
    pendingApproval: 124,
    pendingPayment: 45,
    totalRegions: 24,
    regionsNoAdmin: 3,
    totalAdminWilayah: 21,
    cmsSummary: {
      heroSliders: 3,
      guruBesar: 7,
      news: 12,
      articles: 8,
      gallery: 15
    }
  },
  wilayah: {
    totalMembers: 150,
    activeMembers: 135,
    incomplete: 8,
    inactive: 3,
    pendingVerification: 4,
    activeAnnouncements: 2,
  },
  system: {
    totalUsers: 4520,
    activeSessions: 84,
    totalAuditLogs: 15420,
    lastBackup: '2026-06-01 23:00',
  }
};

