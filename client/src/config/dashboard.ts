import { ROLES } from './roles';

export const DASHBOARD_CONFIG = {
  [ROLES.MEMBER]: {
    title: 'Dashboard Anggota',
    welcomeMessage: 'Selamat datang kembali di portal resmi PPS Padjadjaran.',
  },
  [ROLES.ADMIN_WILAYAH]: {
    title: 'Dashboard Wilayah',
    welcomeMessage: 'Kelola administrasi dan anggota cabang Anda dengan efisien.',
  },
  [ROLES.ADMIN_PUSAT]: {
    title: 'Dashboard Nasional',
    welcomeMessage: 'Pusat kendali operasional organisasi PPS Padjadjaran.',
  },
  [ROLES.SUPER_ADMIN]: {
    title: 'Pusat Kendali Sistem',
    welcomeMessage: 'Monitor performa dan keamanan sistem secara real-time.',
  },
};
