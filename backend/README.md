# PPS Padjadjaran Backend API

Sistem backend berbasis NestJS untuk mengelola portal keanggotaan PPS Padjadjaran.

## 🛠️ Tech Stack
- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT, Argon2, Crypto-js (Encryption)
- **Email**: Nodemailer (SMTP)
- **Validation**: Class-validator, ValidationPipe
- **Documentation**: Swagger UI

## ⚙️ Instalasi

1. Install dependensi:
   ```bash
   npm install
   ```

2. Konfigurasi Environment:
   Buat file `.env` berdasarkan `.env.example`.

3. Setup Database:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed # Opsional: Isi data demo
   ```

4. Jalankan Server:
   ```bash
   npm run start:dev
   ```

## 🏗️ Struktur Folder
- `src/core`: Logika inti sistem (Database, Repositories, Guards, Interceptors, Utils).
- `src/modules`: Modul fitur (Auth, Members, CMS, Payments, dll).
- `src/common`: DTO dan konstanta global.

## 🔒 Keamanan
- **Double JWT Encryption**: Token JWT dienkripsi lagi sebelum dikirim ke client.
- **Role & Action Guard**: Pengecekan izin berdasarkan Role dan matriks aksi.
- **Audit Logs**: Logger otomatis untuk mencatat setiap aksi perubahan data.

## 📄 API Endpoints
Dokumentasi lengkap tersedia di `/docs` saat server berjalan.
- `/api/auth`: Registrasi, Login, OTP, Reset Password.
- `/api/members`: Kelola profil dan data anggota.
- `/api/cms`: Kelola konten publik.
- `/api/public`: API terbuka untuk landing page.

---
© 2026 PPS Padjadjaran
