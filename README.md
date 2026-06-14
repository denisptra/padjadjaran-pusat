# Portal Anggota PPS Padjadjaran

Aplikasi sistem informasi anggota untuk PPS Padjadjaran yang mencakup modul pendaftaran, pembayaran, verifikasi dokumen, CMS, dan dashboard manajemen.

## 🏗️ Arsitektur Proyek

Proyek ini dibagi menjadi dua bagian utama:
- **Backend**: NestJS (TypeScript) dengan Prisma ORM dan PostgreSQL.
- **Frontend**: React (TypeScript) dengan Vite, Tailwind CSS, dan Zustand.

## 🚀 Persiapan Pengembangan

### Prasyarat
- Node.js (v20+)
- PostgreSQL
- Docker (opsional, untuk deployment)

### Langkah Awal
1. Clone repository:
   ```bash
   git clone https://github.com/denisptra/padjadjaran-pusat.git
   cd padjadjaran-pusat
   ```

2. Setup Backend:
   ```bash
   cd backend
   npm install
   cp .env.example .env # Sesuaikan konfigurasi database
   npx prisma generate
   npx prisma migrate dev
   npm run start:dev
   ```

3. Setup Frontend:
   ```bash
   cd ../client
   npm install
   cp .env.example .env # Sesuaikan VITE_API_URL
   npm run dev
   ```

## 🛠️ Fitur Utama
- **Autentikasi Robust**: JWT dengan rotasi refresh token dan verifikasi email OTP.
- **Manajemen Anggota**: Pendaftaran berjenjang (Step-by-step onboarding).
- **Sistem Persetujuan**: Alur kerja verifikasi dokumen oleh Admin Wilayah dan Pusat.
- **E-KTA Otomatis**: Pembuatan nomor KTA otomatis setelah pendaftaran disetujui.
- **CMS Dinamis**: Kelola Berita, Artikel, Hero Slider, dan Galeri.
- **Role Based Access Control (RBAC)**: Super Admin, Admin Pusat, Admin Wilayah, dan Member.
- **Audit Log**: Pencatatan aktivitas sensitif dalam sistem.

## 📄 Dokumentasi API
Setelah backend berjalan, dokumentasi Swagger tersedia di:
`http://localhost:5000/docs`

## 🐳 Deployment (VPS)
Gunakan Docker Compose untuk mendeploy seluruh stack:
```bash
docker compose up -d --build
```

---
Dibuat dengan ❤️ untuk PPS Padjadjaran.
