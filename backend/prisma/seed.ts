import { PrismaClient, Role, MemberType, UserStatus, AnnouncementScope } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('=== TARGETED DATABASE RESET & ADMIN SETUP ===');

  // ========== 1. CLEANUP (Targeted) ==========
  console.log('Cleaning up transactional and CMS data...');
  const transactionalTables = [
    'Approval', 'Payment', 'AnnouncementRead', 'Announcement', 
    'AuditLog', 'Notification', 'OtpToken', 'PasswordResetToken',
    'RefreshToken', 'MemberProfile', 'User', 'CmsGallery',
    'CmsGuruBesar', 'CmsHeroSlider', 'CmsPublication', 'ActionMatrix', 
    'FeatureControl', 'PaymentSetting'
  ];

  for (const table of transactionalTables) {
    try {
      const modelName = table.charAt(0).toLowerCase() + table.slice(1);
      await (prisma as any)[modelName].deleteMany();
      console.log(`- Cleaned ${table}`);
    } catch (e) {
      console.log(`- Skip cleaning ${table} (Not found or error)`);
    }
  }
  
  // NOTE: Province and Region are NOT deleted as requested.
  console.log('✅ Transitional data cleaned. Regions and Provinces preserved.');

  // ========== 2. CONFIGURATION ==========
  const superAdminPassword = await argon2.hash('Sptra0609!'); // Custom password for denitri
  const centralAdminPassword = await argon2.hash('Padjadjaran123!');

  // ========== 3. ADMIN USERS ==========
  console.log('Creating Specific Admin Users...');
  
  // Find a region for the admins (Headquarters or first available)
  const hqRegion = await prisma.region.findFirst({
    where: { name: { contains: 'Headquarters', mode: 'insensitive' } }
  }) || await prisma.region.findFirst();

  if (!hqRegion) {
    console.error('❌ Error: No Regions found in database. Please ensure regions exist before seeding.');
    return;
  }

  // denitri0609@gmail.com -> Super Admin
  const deniUser = await prisma.user.create({
    data: {
      email: 'denitri0609@gmail.com',
      passwordHash: superAdminPassword,
      role: Role.super_admin,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          fullName: 'Deni Tri (Super Admin)',
          phone: '+628999999999',
          registrationStep: 4,
          memberType: MemberType.khusus,
          regionId: hqRegion.id
        }
      }
    }
  });
  console.log(`- Created Super Admin: ${deniUser.email}`);

  // New Central Admin email
  const centralEmail = 'pusat@padjadjaran.or.id';
  const pusatUser = await prisma.user.create({
    data: {
      email: centralEmail,
      passwordHash: centralAdminPassword,
      role: Role.admin_pusat,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          fullName: 'Admin Pusat Padjadjaran',
          phone: '+628123456789',
          registrationStep: 4,
          memberType: MemberType.khusus,
          regionId: hqRegion.id
        }
      }
    }
  });
  console.log(`- Created Central Admin: ${pusatUser.email}`);

  // ========== 4. PERMISSIONS (Action Matrix) ==========
  console.log('Initializing Permissions...');
  const allActions = [
    'dashboard:read', 'member:read', 'member:create', 'member:update', 'member:delete',
    'approval:read', 'approval:process', 'region:read', 'region:create', 'region:update', 'region:delete',
    'announcement:read', 'announcement:read_one', 'announcement:create', 'announcement:update', 'announcement:delete', 'announcement:publish', 'announcement:unpublish', 
    'cms:read', 'cms:create', 'cms:update', 'cms:delete', 
    'payment:read', 'payment_setting:read', 'payment_setting:update'
  ];

  for (const role of [Role.super_admin, Role.admin_pusat]) {
    await prisma.actionMatrix.createMany({
      data: allActions.map(action => ({ role, action, isAllowed: true }))
    });
  }

  // Default Payment Setting
  await prisma.paymentSetting.create({
    data: {
      type: 'REGISTRATION',
      amount: 150000,
      bankName: 'BCA',
      accountNumber: '1234567890',
      accountOwner: 'PPS PADJADJARAN PUSAT',
      whatsapp: '628123456789',
      isActive: true
    }
  });

  console.log('=== DATABASE RESET COMPLETED SUCCESSFULLY ===');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
