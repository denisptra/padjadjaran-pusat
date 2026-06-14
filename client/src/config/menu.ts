import { ROLES } from './roles';
import { ROUTES } from './routes';
import { 
  LayoutDashboard, 
  Megaphone, 
  User, 
  Settings, 
  Users, 
  MapPin, 
  ClipboardCheck, 
  CreditCard, 
  Globe, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Database, 
  UsersRound,
  FileText,
  Image,
  Lock
} from 'lucide-react';

export interface MenuItem {
  label: string;
  path: string;
  icon: any;
  submenu?: { label: string; path: string }[];
}

export const MENU_CONFIG: Record<string, MenuItem[]> = {
  [ROLES.MEMBER]: [
    { label: 'Dashboard', path: ROUTES.MEMBER.DASHBOARD, icon: LayoutDashboard },
    { label: 'Pengumuman', path: ROUTES.MEMBER.ANNOUNCEMENTS, icon: Megaphone },
  ],
  [ROLES.ADMIN_WILAYAH]: [
    { label: 'Dashboard Wilayah', path: ROUTES.ADMIN_WILAYAH.DASHBOARD, icon: LayoutDashboard },
    { label: 'Anggota Wilayah', path: ROUTES.ADMIN_WILAYAH.MEMBERS, icon: Users },
    { label: 'Manajemen Pengumuman', path: ROUTES.ADMIN_WILAYAH.ANNOUNCEMENTS, icon: Megaphone },
    { label: 'Profil Wilayah', path: ROUTES.ADMIN_WILAYAH.REGION_PROFILE, icon: MapPin },
  ],
  [ROLES.ADMIN_PUSAT]: [
    { label: 'Dashboard Nasional', path: ROUTES.ADMIN_PUSAT.DASHBOARD, icon: LayoutDashboard },
    { label: 'Manajemen Anggota', path: ROUTES.ADMIN_PUSAT.MEMBERS, icon: Users },
    { label: 'Manajemen Wilayah', path: ROUTES.ADMIN_PUSAT.REGIONS, icon: MapPin },
    { label: 'Manajemen Pengumuman', path: ROUTES.ADMIN_PUSAT.ANNOUNCEMENTS, icon: Megaphone },
    { 
      label: 'CMS Website', 
      path: '#', 
      icon: Globe,
      submenu: [
        { label: 'Hero Slider', path: ROUTES.ADMIN_PUSAT.CMS_HERO },
        { label: 'Guru Besar', path: ROUTES.ADMIN_PUSAT.CMS_GURU_BESAR },
        { label: 'Berita & Artikel', path: ROUTES.ADMIN_PUSAT.CMS_NEWS },
        { label: 'Galeri', path: ROUTES.ADMIN_PUSAT.CMS_GALLERY },
      ]
    },
    { label: 'Pengaturan Pembayaran', path: ROUTES.ADMIN_PUSAT.PAYMENT_SETTINGS, icon: Settings },
  ],
  [ROLES.SUPER_ADMIN]: [
    { label: 'Pusat Kendali', path: ROUTES.SUPER_ADMIN.DASHBOARD, icon: Activity },
    { label: 'Manajemen User', path: ROUTES.SUPER_ADMIN.USERS, icon: UsersRound },
    { label: 'Action Matrix', path: ROUTES.SUPER_ADMIN.ACTION_MATRIX, icon: ShieldCheck },
    { label: 'Feature Control', path: ROUTES.SUPER_ADMIN.FEATURE_CONTROL, icon: Settings },
    { label: 'Impersonate User', path: ROUTES.SUPER_ADMIN.IMPERSONATE, icon: Zap },
    { label: 'Audit Logs', path: ROUTES.SUPER_ADMIN.AUDIT_LOGS, icon: FileText },
    { label: 'Backup Data', path: ROUTES.SUPER_ADMIN.BACKUP, icon: Database },
    { label: 'Pengaturan Sistem', path: ROUTES.SUPER_ADMIN.SYSTEM_SETTINGS, icon: Settings },
  ],
};

export const DROPDOWN_MENU: Record<string, { label: string; path: string; icon: any }[]> = {
  [ROLES.MEMBER]: [
    { label: 'Profil Saya', path: ROUTES.MEMBER.PROFILE, icon: User },
    { label: 'Pengaturan', path: ROUTES.MEMBER.SETTINGS, icon: Settings },
  ],
  [ROLES.ADMIN_WILAYAH]: [
    { label: 'Profil Saya', path: ROUTES.ADMIN_WILAYAH.PROFILE, icon: User },
    { label: 'Pengaturan', path: ROUTES.ADMIN_WILAYAH.SETTINGS, icon: Settings },
  ],
  [ROLES.ADMIN_PUSAT]: [
    { label: 'Profil Saya', path: ROUTES.ADMIN_PUSAT.PROFILE, icon: User },
    { label: 'Pengaturan', path: ROUTES.ADMIN_PUSAT.SETTINGS, icon: Settings },
  ],
  [ROLES.SUPER_ADMIN]: [
    { label: 'Profil Saya', path: ROUTES.SUPER_ADMIN.PROFILE, icon: User },
    { label: 'Pengaturan Sistem', path: ROUTES.SUPER_ADMIN.SYSTEM_SETTINGS, icon: Settings },
  ],
};
