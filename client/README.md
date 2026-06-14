# PPS Padjadjaran Frontend Portal

Aplikasi web dashboard dan landing page untuk anggota PPS Padjadjaran.

## 🛠️ Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **State Management**: Zustand
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **UI Components**: Headless UI, Custom UI Components

## ⚙️ Instalasi

1. Install dependensi:
   ```bash
   npm install
   ```

2. Konfigurasi Environment:
   Buat file `.env` dan tambahkan:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. Jalankan Aplikasi:
   ```bash
   npm run dev
   ```

## 🏗️ Struktur Folder
- `src/components`: Komponen reusable (UI, Layout, Form).
- `src/features`: Modul fitur yang memiliki state/service spesifik (Auth, CMS).
- `src/pages`: Halaman aplikasi berdasarkan route.
- `src/services`: Integrasi API (Axios instance & interceptors).
- `src/stores`: Global state (Zustand).
- `src/hooks`: Custom React hooks.

## 🔌 Integrasi API
Aplikasi menggunakan Axios interceptor untuk:
- Menambahkan Header Authorization (Bearer Token).
- Melakukan refresh token otomatis jika session expired.
- Melakukan de-enkripsi data jika diperlukan (tergantung konfigurasi backend).

---
© 2026 PPS Padjadjaran
