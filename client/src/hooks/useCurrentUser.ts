import { useAuthStore } from '../features/auth/stores/auth.store';

export const useCurrentUser = () => {
  const { user, role } = useAuthStore();
  const isDeveloper = (useAuthStore() as any).isDeveloper;
  
  return {
    user,
    role,
    isDeveloper,
    isAdmin: role === 'admin_pusat' || role === 'super_admin' || role === 'admin_wilayah',
    isSuperAdmin: role === 'super_admin',
    isAdminPusat: role === 'admin_pusat',
    isAdminWilayah: role === 'admin_wilayah',
    isMember: role === 'member',
  };
};
