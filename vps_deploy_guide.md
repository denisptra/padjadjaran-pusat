# Panduan Deployment Portal PPS Padjadjaran ke VPS dengan Docker Compose

Panduan ini menjelaskan langkah-demi-langkah untuk mendeploy aplikasi PPS Padjadjaran (Backend NestJS, Frontend React/Vite, dan PostgreSQL) ke Virtual Private Server (VPS) Anda menggunakan Docker Compose.

---

## 🛠️ Persiapan Awal di VPS

Sebelum memulai, pastikan hal-hal berikut sudah terpasang di VPS Anda:
1. **Docker**: `docker --version`
2. **Docker Compose**: `docker compose version`
3. Git (opsional, untuk clone repository).

---

## 📂 Langkah 1: Unggah Project ke VPS

Anda bisa mengunggah seluruh folder project (`d:\BARU`) ke VPS menggunakan SCP/SFTP atau Git.

### Opsi A: Menggunakan Git (Direkomendasikan)
Push folder local Anda ke repository Git privat (seperti GitHub/GitLab), lalu lakukan clone di VPS Anda:
```bash
git clone <url_repository_anda> ~/padjajaran-portal
cd ~/padjajaran-portal
```

### Opsi B: Menggunakan SCP
Kirim langsung dari komputer lokal Anda ke VPS:
```bash
scp -r "D:\BARU" root@154.19.37.25:~/padjajaran-portal
```

---

## 📝 Langkah 2: Setup File `.env` di VPS

Buat file `.env` baru di root folder project (`~/padjajaran-portal/.env` di VPS) untuk menyimpan variabel lingkungan produksi.

Berikut template konfigurasi `.env` produksi yang direkomendasikan:

```env
# ==========================================
# 🗄️ KONFIGURASI DATABASE POSTGRESQL
# ==========================================
DB_USER=postgres
DB_PASSWORD=OryzaLokabasa123!
DB_NAME=padjajaran

# ==========================================
# 🔑 SECURITY & AUTHENTICATION
# ==========================================
JWT_ACCESS_SECRET=7a6c9d5e3f1b4a0c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c
JWT_REFRESH_SECRET=9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION_DAYS=7

COOKIE_SECRET=b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6
ENCRYPTION_KEY=4c7d9b0e2f4a6c8e0d2f4a6c8e0d2f4a

# ==========================================
# 📧 LAYANAN EMAIL (SMTP)
# ==========================================
MAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=pusatpadjadjaran@gmail.com
SMTP_PASS="pvaw ovvu dwie xsdi"
SMTP_SECURE=false
SMTP_FROM="PPS Padjadjaran <pusatpadjadjaran@gmail.com>"

# ==========================================
# 💻 URL APLIKASI & PORT
# ==========================================
# Ganti IP di bawah ini dengan IP Publik VPS atau Domain Anda!
VITE_API_URL=http://154.19.37.25:5001/api
CLIENT_URL=http://154.19.37.25
```

> [!IMPORTANT]
> - Pastikan nilai `VITE_API_URL` mengarah ke IP publik VPS Anda dengan port `5001`. Jika Anda menggunakan domain, ubah menjadi `https://api.domainanda.com/api`.
> - Pastikan `CLIENT_URL` mengarah ke URL akses frontend React Anda.

---

## 🚀 Langkah 3: Build & Jalankan Docker Compose

Setelah file `.env` selesai dikonfigurasi, jalankan perintah berikut di root folder project untuk melakukan build image dan menjalankan container di latar belakang (*detached mode*):

```bash
docker compose up --build -d
```

Docker Compose secara otomatis akan melakukan:
1. Menyalakan database PostgreSQL (`padjajaran_db`) dan menyimpannya di volume persistent agar data aman.
2. Melakukan build NestJS Backend (`padjajaran_backend`), menjalankan `prisma db push` untuk membuat tabel database secara otomatis, dan membuka port `5001`.
3. Melakukan build React Frontend (`padjajaran_frontend`) dengan memasukkan `VITE_API_URL` yang dikonfigurasi di `.env` ke dalam file statis, lalu menyajikan aplikasi lewat Nginx pada port `80`.

---

## 🌱 Langkah 4: Seeding Database (Opsional tetapi Direkomendasikan)

Jika Anda ingin mengisi database dengan data default (seperti membuat akun **Super Admin**, akun **Admin Pusat**, data Provinsi, Wilayah, serta data demo CMS), jalankan perintah seeding ini langsung ke container backend yang sedang berjalan:

```bash
docker compose exec padjajaran_backend node dist/prisma/seed.js
```

### Informasi Akun Hasil Seed:
* **Super Admin**:
  * Email: `super_admin@example.com`
  * Password: `Padjadjaran123!`
* **Admin Pusat (Deni)**:
  * Email: `denitri0609@gmail.com`
  * Password: `Sptra0609!`

---

## 🩺 Langkah 5: Memeriksa Status Deploy

Untuk memastikan semua container berjalan dengan normal tanpa kendala, gunakan perintah berikut:

1. **Cek container yang aktif**:
   ```bash
   docker compose ps
   ```
   *Ketiga container (`padjajaran_db`, `padjajaran_backend`, dan `padjajaran_frontend`) harus berstatus `Up`.*

2. **Cek logs jika ada masalah**:
   ```bash
   docker compose logs -f
   ```

---

## 🛡️ Catatan Keamanan & Troubleshooting

* **Firewall VPS**: Pastikan port `80` (untuk Frontend) dan port `5001` (untuk API Backend) sudah dibuka di firewall VPS Anda (misalnya melalui UFW di Ubuntu atau Dashboard Provider VPS seperti DigitalOcean/Contabo/AWS).
* **Keamanan Database**: Port database Postgres (`5432` / local mapped `5433`) sengaja diikat ke `127.0.0.1` di dalam file `docker-compose.yml`. Hal ini menjamin database tidak bisa diakses langsung dari luar VPS demi menjaga keamanan data sensitif anggota.
