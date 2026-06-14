export const ROLES = {
  MEMBER: 'member',
  ADMIN_WILAYAH: 'admin_wilayah',
  ADMIN_PUSAT: 'admin_pusat',
  SUPER_ADMIN: 'super_admin',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
