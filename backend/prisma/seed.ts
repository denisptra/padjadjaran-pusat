import { PrismaClient, Role, MemberType, UserStatus, PublicationType, AnnouncementScope } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('=== SEEDING COMPREHENSIVE MULTI-CASE DATABASE ===');

  // ========== 1. CLEANUP ==========
  console.log('Cleaning up old data...');
  const tablenames = [
    'Approval', 'Payment', 'AnnouncementRead', 'Announcement', 
    'AuditLog', 'MemberProfile', 'OtpToken', 'PasswordResetToken',
    'RefreshToken', 'ActionMatrix', 'FeatureControl', 'CmsGallery',
    'CmsGuruBesar', 'CmsHeroSlider', 'CmsPublication', 'SystemSetting',
    'Region', 'Province', 'PaymentSetting', 'User'
  ];

  for (const tablename of tablenames) {
    try {
      await (prisma as any)[tablename.charAt(0).toLowerCase() + tablename.slice(1)].deleteMany();
    } catch (e) {
      console.log(`Skip cleaning ${tablename}`);
    }
  }
  console.log('✅ Database cleaned.');

  // ========== 2. CONFIGURATION ==========
  const defaultPassword = await argon2.hash('Padjadjaran123!');
  const customPassword = await argon2.hash('Sptra0609!');

  // ========== 3. PROVINCES & REGIONS ==========
  console.log('Creating Provinces and Regions...');
  
  const provinces = [
    { name: 'Aceh', isOverseas: false },
    { name: 'Bali', isOverseas: false },
    { name: 'Banten', isOverseas: false },
    { name: 'Bengkulu', isOverseas: false },
    { name: 'DI Yogyakarta', isOverseas: false },
    { name: 'DKI Jakarta', isOverseas: false },
    { name: 'Gorontalo', isOverseas: false },
    { name: 'Jambi', isOverseas: false },
    { name: 'Jawa Barat', isOverseas: false },
    { name: 'Jawa Tengah', isOverseas: false },
    { name: 'Jawa Timur', isOverseas: false },
    { name: 'Kalimantan Barat', isOverseas: false },
    { name: 'Kalimantan Selatan', isOverseas: false },
    { name: 'Kalimantan Tengah', isOverseas: false },
    { name: 'Kalimantan Timur', isOverseas: false },
    { name: 'Kalimantan Utara', isOverseas: false },
    { name: 'Kepulauan Bangka Belitung', isOverseas: false },
    { name: 'Kepulauan Riau', isOverseas: false },
    { name: 'Lampung', isOverseas: false },
    { name: 'Maluku', isOverseas: false },
    { name: 'Maluku Utara', isOverseas: false },
    { name: 'Nusa Tenggara Barat', isOverseas: false },
    { name: 'Nusa Tenggara Timur', isOverseas: false },
    { name: 'Papua', isOverseas: false },
    { name: 'Papua Barat', isOverseas: false },
    { name: 'Papua Barat Daya', isOverseas: false },
    { name: 'Papua Pegunungan', isOverseas: false },
    { name: 'Papua Selatan', isOverseas: false },
    { name: 'Papua Tengah', isOverseas: false },
    { name: 'Riau', isOverseas: false },
    { name: 'Sulawesi Barat', isOverseas: false },
    { name: 'Sulawesi Selatan', isOverseas: false },
    { name: 'Sulawesi Tengah', isOverseas: false },
    { name: 'Sulawesi Tenggara', isOverseas: false },
    { name: 'Sulawesi Utara', isOverseas: false },
    { name: 'Sumatera Barat', isOverseas: false },
    { name: 'Sumatera Selatan', isOverseas: false },
    { name: 'Sumatera Utara', isOverseas: false },
    { name: 'Luar Negeri', isOverseas: true },
    { name: 'Pusat', isOverseas: false },
  ];

  const provMap: Record<string, string> = {};
  for (const p of provinces) {
    const created = await prisma.province.create({ data: p });
    provMap[p.name] = created.id;
  }

  const regionsData = [
    { name: 'Bandung', prov: 'Jawa Barat' },
    { name: 'Tasikmalaya', prov: 'Jawa Barat' },
    { name: 'Ciamis', prov: 'Jawa Barat' },
    { name: 'Sukabumi', prov: 'Jawa Barat' },
    { name: 'Jakarta Barat', prov: 'DKI Jakarta' },
    { name: 'Magelang', prov: 'Jawa Tengah' },
    { name: 'Malaysia', prov: 'Luar Negeri' },
    { name: 'Singapore', prov: 'Luar Negeri' },
    { name: 'Thailand', prov: 'Luar Negeri' },
    { name: 'Headquarters', prov: 'Pusat' },
  ];

  const regionMap: Record<string, string> = {};
  for (const r of regionsData) {
    const created = await prisma.region.create({
      data: { name: r.name, provinceId: provMap[r.prov] }
    });
    regionMap[r.name] = created.id;
  }
  console.log('✅ Provinces and Regions created.');

  // ========== 4. ADMIN USERS ==========
  console.log('Creating Admin Users...');
  
  const superAdmin = await prisma.user.create({
    data: {
      email: 'super_admin@example.com',
      passwordHash: defaultPassword,
      role: Role.super_admin,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          fullName: 'Super Administrator',
          phone: '+628111111111',
          registrationStep: 4,
          memberType: MemberType.khusus
        }
      }
    }
  });

  const adminPusat = await prisma.user.create({
    data: {
      email: 'denitri0609@gmail.com',
      passwordHash: customPassword,
      role: Role.admin_pusat,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          fullName: 'Deni Tri (Admin Pusat)',
          phone: '+628999999999',
          registrationStep: 4,
          memberType: MemberType.khusus,
          regionId: regionMap['Headquarters']
        }
      }
    }
  });

  // Admin Wilayah (Tasikmalaya)
  const adminTasik = await prisma.user.create({
    data: {
      email: 'admin_tasik@example.com',
      passwordHash: defaultPassword,
      role: Role.admin_wilayah,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          fullName: 'Admin Tasikmalaya',
          phone: '+628123456781',
          registrationStep: 4,
          regionId: regionMap['Tasikmalaya']
        }
      }
    }
  });
  await prisma.region.update({ where: { id: regionMap['Tasikmalaya'] }, data: { adminId: adminTasik.id } });

  // Admin Wilayah (Malaysia)
  const adminMalaysia = await prisma.user.create({
    data: {
      email: 'admin_malaysia@example.com',
      passwordHash: defaultPassword,
      role: Role.admin_wilayah,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          fullName: 'Admin Malaysia',
          phone: '+60123456789',
          registrationStep: 4,
          regionId: regionMap['Malaysia']
        }
      }
    }
  });
  await prisma.region.update({ where: { id: regionMap['Malaysia'] }, data: { adminId: adminMalaysia.id } });

  console.log('✅ Admin users created.');

  // ========== 5. DIVERSE MEMBERS ==========
  console.log('Populating Diverse Members...');
  
  const memberCases = [
    // ACTIVE MEMBERS
    { email: 'active.silat@test.com', name: 'Pendekar Aktif 1', type: MemberType.pencak_silat, status: UserStatus.ACTIVE, region: 'Bandung', step: 4, nationality: 'WNI' },
    { email: 'active.umum@test.com', name: 'Anggota Umum 1', type: MemberType.umum, status: UserStatus.ACTIVE, region: 'Jakarta Barat', step: 4, nationality: 'WNI' },
    { email: 'active.khusus@test.com', name: 'Anggota Khusus 1', type: MemberType.khusus, status: UserStatus.ACTIVE, region: 'Singapore', step: 4, nationality: 'WNA' },
    { email: 'active.wna.silat@test.com', name: 'WNA Silat 1', type: MemberType.pencak_silat, status: UserStatus.ACTIVE, region: 'Malaysia', step: 4, nationality: 'WNA' },
    
    // PENDING MEMBERS (Onboarding Cases)
    { email: 'pending.step0@test.com', name: 'Calon Step 0', type: MemberType.umum, status: UserStatus.PENDING, region: 'Ciamis', step: 0, verified: false, nationality: 'WNI' },
    { email: 'pending.step1@test.com', name: 'Calon Step 1', type: MemberType.umum, status: UserStatus.PENDING, region: 'Sukabumi', step: 1, verified: true, nationality: 'WNI' },
    { email: 'pending.step2@test.com', name: 'Calon Step 2', type: MemberType.pencak_silat, status: UserStatus.PENDING, region: 'Tasikmalaya', step: 2, verified: true, nationality: 'WNI' },
    { email: 'pending.step3@test.com', name: 'Calon Step 3', type: MemberType.khusus, status: UserStatus.PENDING, region: 'Malaysia', step: 3, verified: true, nationality: 'WNA' },
    { email: 'pending.approval@test.com', name: 'Calon Step 4 Approval', type: MemberType.pencak_silat, status: UserStatus.PENDING, region: 'Bandung', step: 4, verified: true, nationality: 'WNI' },
    
    // INACTIVE / REJECTED
    { email: 'inactive@test.com', name: 'Anggota Nonaktif', type: MemberType.umum, status: UserStatus.INACTIVE, region: 'Sukabumi', step: 4, verified: true, nationality: 'WNI' },
  ];

  for (const m of memberCases) {
    // Logic for realistic KTA generation
    let ktaNumber = null;
    if (m.status === UserStatus.ACTIVE) {
      const year = new Date().getFullYear().toString();
      let typeCode = '03';
      if (m.type === MemberType.khusus) typeCode = '01';
      else if (m.type === MemberType.pencak_silat) typeCode = '02';
      
      const natCode = m.nationality === 'WNA' ? '2' : '1';
      const prefix = `${year}${typeCode}${natCode}`;
      
      // Since we are seeding, we can just keep track of sequences per prefix
      if (!(global as any).ktaSequences) (global as any).ktaSequences = {};
      (global as any).ktaSequences[prefix] = ((global as any).ktaSequences[prefix] || 0) + 1;
      
      const sequenceStr = (global as any).ktaSequences[prefix].toString().padStart(4, '0');
      ktaNumber = `${prefix}${sequenceStr}`;
    }

    const user = await prisma.user.create({
      data: {
        email: m.email,
        passwordHash: defaultPassword,
        role: Role.member,
        status: m.status,
        emailVerifiedAt: m.verified ? new Date() : null,
        profile: {
          create: {
            fullName: m.name,
            memberType: m.type,
            registrationStep: m.step,
            regionId: regionMap[m.region],
            phone: '+628' + Math.floor(100000000 + Math.random() * 900000000),
            nationality: m.nationality || 'WNI',
            gender: Math.random() > 0.5 ? 'Laki-laki' : 'Perempuan',
            address: 'Alamat Test Case PPS No. ' + Math.floor(Math.random() * 100),
            birthPlace: m.region,
            birthDate: new Date('1990-01-01'),
            ktaNumber: ktaNumber
          }
        }
      }
    });

    // Create Approval record for steps > 1
    if (m.step >= 1) {
      await prisma.approval.create({
        data: {
          creatorId: user.id,
          status: m.status === UserStatus.ACTIVE ? 'approved' : 'pending',
          type: 'registration',
          notes: m.status === UserStatus.ACTIVE ? 'Auto-approved by system seed' : 'Menunggu kelengkapan data atau peninjauan',
          processorId: m.status === UserStatus.ACTIVE ? superAdmin.id : null
        }
      });
    }

    // Create Payment if step >= 3
    if (m.step >= 3) {
      await prisma.payment.create({
        data: {
          userId: user.id,
          amount: 150000,
          status: m.status === UserStatus.ACTIVE ? 'approved' : 'pending',
          proofUrl: 'https://placehold.co/400x600?text=Bukti+Bayar'
        }
      });
    }
  }
  console.log('✅ Diverse members populated.');

  // ========== 6. CMS CONTENT ==========
  console.log('Creating CMS Content...');

  // Publications
  await prisma.cmsPublication.createMany({
    data: [
      { title: 'Sejarah PPS Padjadjaran', slug: 'sejarah-pps', content: 'Lorem ipsum...', type: PublicationType.ARTIKEL, isPublished: true, category: 'Sejarah' },
      { title: 'Penerimaan Anggota Baru 2026', slug: 'penerimaan-2026', content: 'Lorem ipsum...', type: PublicationType.BERITA, isPublished: true, category: 'Pengumuman' },
      { title: 'Latihan Alam di Gunung Salak', slug: 'latihan-alam', content: 'Lorem ipsum...', type: PublicationType.BERITA, isPublished: true, category: 'Kegiatan' },
    ]
  });

  // Guru Besar (Requirement: No description needed)
  await prisma.cmsGuruBesar.createMany({
    data: [
      { name: 'Abah Sepuh', title: 'Guru Besar Utama', imageUrl: 'https://placehold.co/400x400?text=Abah+Sepuh', order: 1 },
      { name: 'Guru Asep', title: 'Dewan Guru Pusat', imageUrl: 'https://placehold.co/400x400?text=Guru+Asep', order: 2 },
    ]
  });

  // Gallery
  await prisma.cmsGallery.createMany({
    data: [
      { title: 'Kejuaraan Nasional 2025', imageUrl: 'https://placehold.co/800x600?text=Kejurnas', category: 'Kejuaraan' },
      { title: 'Ujian Kenaikan Tingkat', imageUrl: 'https://placehold.co/800x600?text=UKT', category: 'UKT' },
    ]
  });

  // Sliders
  await prisma.cmsHeroSlider.createMany({
    data: [
      { title: 'Selamat Datang di PPS Padjadjaran', subtitle: 'Pusat Pelatihan Pencak Silat Padjadjaran', imageUrl: 'https://placehold.co/1920x1080?text=Welcome', order: 1 },
      { title: 'Gabung Bersama Kami', subtitle: 'Melestarikan Budaya Bangsa', imageUrl: 'https://placehold.co/1920x1080?text=Join+Us', order: 2 },
    ]
  });

  console.log('✅ CMS Content created.');

  // ========== 7. ANNOUNCEMENTS & PERMISSIONS ==========
  console.log('Finalizing Announcements and Permissions...');
  
  await prisma.announcement.create({
    data: {
      title: 'PENTING: Kelengkapan Data Profil',
      content: 'Harap segera melengkapi data profil bagi anggota baru untuk penerbitan KTA.',
      authorId: adminPusat.id,
      scope: AnnouncementScope.national,
      isPublished: true,
      showModal: true
    }
  });

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

  // Action Matrix
  const allActions = [
    'dashboard:read', 'member:read', 'member:create', 'member:update', 'member:delete',
    'approval:read', 'approval:process', 'region:read', 'region:create', 'region:update', 'region:delete',
    'announcement:read', 'announcement:read_one', 'announcement:create', 'announcement:update', 'announcement:delete', 'announcement:publish', 'announcement:unpublish', 
    'cms:read', 'cms:create', 'cms:update', 'cms:delete', 
    'payment:read', 'payment_setting:read', 'payment_setting:update'
  ];

  for (const role of [Role.super_admin, Role.admin_pusat]) {
    for (const action of allActions) {
      await prisma.actionMatrix.create({ data: { role, action, isAllowed: true } });
    }
  }

  // Admin Wilayah restricted permissions
  const wilayahActions = [
    'dashboard:read',
    'member:read',
    'member:create',
    'member:update',
    'member:delete',
    'approval:read',
    'approval:process',
    'region:read_profile',
    'announcement:read',
    'announcement:read_one',
    'announcement:create',
    'announcement:update',
    'announcement:delete',
  ];
  for (const action of wilayahActions) {
    await prisma.actionMatrix.create({ data: { role: Role.admin_wilayah, action, isAllowed: true } });
  }

  // Member permissions
  const memberActions = [
    'dashboard:read',
    'announcement:read',
    'announcement:read_one',
  ];
  for (const action of memberActions) {
    await prisma.actionMatrix.create({ data: { role: Role.member, action, isAllowed: true } });
  }

  console.log('=== SEEDING COMPLETED SUCCESSFULLY ===');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
