# DOKUMEN BIMBINGAN TEKNIS
## **SISTEM INFORMASI TAMAN KEHATI NASIONAL**

---

**Versi:** 1.0  
**Tanggal:** 6 November 2025  
**Penyusun:** Tim Pengembang Sistem Taman Kehati (Irgya Genta Arnezzi, Santana Mena)  
**Penerima:** Direktorat Konservasi Keanekaragaman Hayati, Kementerian Lingkungan Hidup (KLH)

---

## DAFTAR ISI

1. [Pendahuluan](#1-pendahuluan)
2. [Profil Sistem](#2-profil-sistem)
3. [Struktur Sistem dan Arsitektur](#3-struktur-sistem-dan-arsitektur)
4. [Panduan Penggunaan](#4-panduan-penggunaan)
5. [Panduan Admin](#5-panduan-admin)
6. [Panduan Teknis](#6-panduan-teknis)
7. [Troubleshooting](#7-troubleshooting)
8. [Lampiran](#8-lampiran)

---

## 1. PENDAHULUAN

### 1.1 Latar Belakang

Sistem Informasi Taman Kehati Nasional dikembangkan untuk mendukung pengelolaan data keanekaragaman hayati di seluruh Taman Keanekaragaman Hayati (Taman Kehati) di Indonesia. Sistem ini memungkinkan pengumpulan, pengelolaan, dan penyajian data flora, fauna, serta informasi taman secara terpusat dan terstruktur.

### 1.2 Tujuan Bimbingan Teknis

Bimbingan Teknis ini bertujuan untuk:

1. **Transfer Knowledge**: Memastikan pengguna dari pihak KLH dapat mengoperasikan sistem secara mandiri
2. **Operasionalisasi Sistem**: Menjamin sistem dapat digunakan secara optimal oleh admin taman kehati di seluruh Indonesia
3. **Pemeliharaan Sistem**: Memberikan pemahaman dasar tentang pemeliharaan dan troubleshooting sistem
4. **Dokumentasi Resmi**: Menyediakan dokumentasi lengkap sebagai referensi resmi pengguna

### 1.3 Sasaran Peserta

Bimbingan Teknis ini ditujukan untuk:

- **Super Admin KLH**: Pengelola sistem tingkat pusat
- **Regional Admin**: Pengelola taman kehati

### 1.4 Hasil yang Diharapkan

Setelah mengikuti Bimbingan Teknis, peserta diharapkan dapat:

- Melakukan login dan navigasi sistem dengan lancar  
- Menginput data Taman, Flora, Fauna, dan Aktivitas  
- Mengelola workflow approval (draft → review → approved)  
- Menggunakan fitur dashboard dan statistik  
- Mengelola pengguna dan hak akses (untuk admin)  
- Melakukan troubleshooting dasar  
- Memahami arsitektur sistem dan teknologi yang digunakan

---

## 2. PROFIL SISTEM

### 2.1 Nama Sistem

**Sistem Informasi Taman Kehati Nasional**  
**Version:** 2.1.0  
**Platform:** Web Application (Responsive)

### 2.2 Tujuan Sistem

Sistem ini dirancang untuk:

1. **Manajemen Data Terpusat**: Mengumpulkan dan mengelola data keanekaragaman hayati dari seluruh taman kehati di Indonesia
2. **Transparansi Data**: Menyajikan data keanekaragaman hayati kepada publik secara terbuka
3. **Efisiensi Administrasi**: Mempercepat proses input, review, dan approval data
4. **Analitik dan Pelaporan**: Menyediakan dashboard dan statistik untuk monitoring dan evaluasi
5. **Informasi Geografis**: Menampilkan lokasi taman dan distribusi spesies melalui peta interaktif

### 2.3 Fitur Utama Sistem

#### **Manajemen Taman**
- Input data taman kehati (nama, lokasi, luas, deskripsi)
- Upload foto dan galeri taman
- Manajemen aktivitas taman
- Peta interaktif lokasi taman

#### **Manajemen Flora**
- Input data spesies flora (nama lokal, nama ilmiah, status konservasi)
- Upload foto flora
- Identifikasi flora dengan AI (opsional)
- Klasifikasi dan kategori flora

#### **Manajemen Fauna**
- Input data spesies fauna (nama lokal, nama ilmiah, status konservasi)
- Upload foto fauna
- Identifikasi fauna dengan AI (opsional)
- Klasifikasi dan kategori fauna

#### **Manajemen Konten**
- Artikel dan berita terkait taman kehati
- Pengumuman (announcement)
- Galeri foto kegiatan
- Manajemen konten publik

#### **Manajemen Pengguna**
- Role-Based Access Control (RBAC)
- Manajemen hak akses per level
- Approval workflow untuk data baru

#### **Dashboard & Analitik**
- Statistik taman, flora, dan fauna
- Grafik perkembangan data
- Monitoring aktivitas sistem
- Laporan keanekaragaman hayati

#### **Peta Interaktif**
- Visualisasi lokasi taman kehati
- Filter dan pencarian geografis
- Integrasi dengan OpenStreetMap

#### **Fitur AI (Opsional)**
- Identifikasi spesies dari foto
- Generasi konten otomatis
- Analisis data keanekaragaman hayati

### 2.4 Teknologi yang Digunakan

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python 3.12)
- **Database**: PostgreSQL 15 dengan PostGIS
- **Cache**: Redis 7
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Deployment**: Ubuntu Server dengan Docker

---

## 3. STRUKTUR SISTEM DAN ARSITEKTUR

### 3.1 Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                            │
│              (Web Browser - Next.js Frontend)                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTPS/HTTP
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   API LAYER                                  │
│              (FastAPI Backend - Port 8000)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │  Parks   │  │  Flora   │  │  Fauna   │   │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users  │  │ Articles │  │   AI     │  │  Upload  │   │
│  │  Module │  │  Module  │  │  Module  │  │  Module  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
│  PostgreSQL  │ │    Redis    │ │ File Storage│
│  Database    │ │    Cache    │ │  (Uploads)  │
│  (Port 5432) │ │ (Port 6379) │ │             │
└──────────────┘ └─────────────┘ └─────────────┘
```

### 3.2 Role-Based Access Control (RBAC)

Sistem menggunakan sistem kontrol akses berbasis peran dengan 2 level utama:

#### **Super Admin**
- **Akses Penuh**: Semua fitur dan data dari semua region
- **Fitur Khusus**:
  - User Management (CRUD semua user)
  - Approval Queue (approve/reject semua submission)
  - Announcement Management
  - Article/News Management
  - System Configuration
  - Full Dashboard Access
  - Akses ke semua taman kehati

#### **Regional Admin**
- **Akses Terbatas**: Hanya data dan taman kehati yang ditugaskan
- **Fungsi**: Pengelola taman kehati yang ditugaskan
- **Fitur**:
  - Taman Management (hanya taman yang dikelola)
  - Flora Management (hanya di taman yang dikelola)
  - Fauna Management (hanya di taman yang dikelola)
  - Activities Management
  - Galeri Management
  - Berita Taman
  - Submit data untuk approval ke Super Admin
  - Tidak bisa approve data sendiri (harus melalui Super Admin)

### 3.3 Workflow Approval

Sistem menggunakan workflow approval untuk memastikan kualitas data:

```
┌─────────┐      ┌──────────────┐      ┌──────────┐      ┌──────────┐
│  DRAFT  │ ───► │  IN_REVIEW   │ ───► │ APPROVED │      │ REJECTED │
│         │      │              │      │          │      │          │
│ Regional│      │  Super Admin │      │ Approved │      │  Return  │
│  Admin  │      │   Reviewing  │      │  Visible │      │  to Edit │
└─────────┘      └──────────────┘      └──────────┘      └──────────┘
```

**Status Data:**
- **DRAFT**: Data baru dibuat, belum disubmit untuk review
- **IN_REVIEW**: Data sudah disubmit, menunggu approval Super Admin
- **APPROVED**: Data sudah disetujui, tampil di aplikasi
- **REJECTED**: Data ditolak dengan alasan, perlu direvisi

### 3.4 Database Schema (Ringkas)

**Tabel Utama:**
- `users` - Data pengguna dan role
- `parks` - Data taman kehati
- `flora` - Data spesies flora
- `fauna` - Data spesies fauna
- `activities` - Aktivitas di taman
- `articles` - Artikel dan berita
- `announcements` - Pengumuman
- `galleries` - Galeri foto
- `uploads` - File upload (foto, dokumen)

**Relasi:**
- Flora/Fauna → Park (many-to-one)
- Activities → Park (many-to-one)
- Articles → Park (many-to-one)
- Galleries → Park (many-to-one)

### 3.5 URL dan Akses Sistem

**Production URL:**
- **Frontend**: `http://38.47.93.167:8080` atau domain yang ditentukan
- **Backend API**: `http://38.47.93.167:8080/api`
- **API Documentation**: `http://38.47.93.167:8080/docs`

**Development URL:**
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/docs`

---

## 4. PANDUAN PENGGUNAAN

### 4.1 Akses dan Login

#### 4.1.1 Cara Login

1. **Buka browser** dan akses URL sistem:
   ```
   http://38.47.93.167:8080
   ```

2. **Klik tombol "Login"** di pojok kanan atas

3. **Masukkan kredensial**:
   - **Email**: `admin@kehati.org` (contoh untuk Super Admin)
   - **Password**: `password` (default, harus diubah setelah login pertama)

4. **Klik "Masuk"** atau tekan Enter

5. **Setelah login berhasil**, Anda akan diarahkan ke Dashboard

#### 4.1.2 Lupa Password

Jika lupa password, hubungi Super Admin untuk reset password.

#### 4.1.3 Logout

Klik **ikon profil** di pojok kanan atas → Pilih **"Logout"**

---

### 4.2 Navigasi Dashboard

#### 4.2.1 Menu Sidebar

Setelah login, Anda akan melihat menu sidebar di sebelah kiri:

**Menu Super Admin:**
- **Dashboard** - Halaman utama dengan statistik
- **Taman** - Manajemen data taman
- **Flora** - Manajemen data flora
- **Fauna** - Manajemen data fauna
- **Approval** - Antrian approval data
- **Artikel** - Manajemen artikel
- **Pengumuman** - Manajemen pengumuman
- **Pengguna** - Manajemen user
- **Pengaturan** - Konfigurasi sistem

**Menu Regional Admin:**
- **Dashboard**
- **Taman** (hanya taman kehati yang dikelola)
- **Flora** (hanya di taman kehati yang dikelola)
- **Fauna** (hanya di taman kehati yang dikelola)
- **Kegiatan** - Activities management
- **Galeri**
- **Berita Taman**
- **Pengaturan**

#### 4.2.2 Dashboard Overview

Dashboard menampilkan:
- **Statistik Ringkas**: Jumlah taman, flora, fauna, user
- **Grafik**: Perkembangan data dalam periode tertentu
- **Aktivitas Terbaru**: Log aktivitas sistem
- **Quick Actions**: Tombol akses cepat ke fitur utama

---

### 4.3 Input Data Taman

#### 4.3.1 Menambah Taman Baru

1. **Klik menu "Taman"** di sidebar
2. **Klik tombol "Tambah Taman"** (+ atau button hijau)
3. **Isi form** dengan data berikut:

   **Data Wajib:**
   - **Nama Taman**: Contoh "Taman Kehati Kalimantan Timur"
   - **Lokasi**: Alamat lengkap taman
   - **Koordinat**: Latitude dan Longitude (bisa klik di peta)
   - **Luas Area**: Dalam hektar (ha)
   - **Deskripsi**: Informasi umum tentang taman

   **Data Opsional:**
   - **Foto Utama**: Upload foto utama taman (max 5MB, format JPG/PNG)
   - **Galeri**: Upload beberapa foto tambahan
   - **Status**: Draft (default) atau langsung submit untuk review

4. **Klik tombol "Pilih Lokasi di Peta"** untuk menentukan koordinat secara visual
5. **Klik "Simpan"** untuk menyimpan sebagai draft, atau **"Simpan dan Submit"** untuk langsung masuk antrian approval

#### 4.3.2 Edit Data Taman

1. **Klik menu "Taman"**
2. **Klik pada nama taman** yang ingin diedit
3. **Klik tombol "Edit"** di halaman detail
4. **Ubah data** yang diperlukan
5. **Klik "Simpan"**

**Catatan**: Data yang sudah **APPROVED** memerlukan approval ulang jika diubah.

#### 4.3.3 Menghapus Taman

1. **Masuk ke halaman detail taman**
2. **Klik tombol "Hapus"** (ikon trash)
3. **Konfirmasi penghapusan**

**Peringatan**: Menghapus taman akan menghapus semua data flora, fauna, dan aktivitas terkait!

---

### 4.4 Input Data Flora

#### 4.4.1 Menambah Flora Baru

1. **Klik menu "Flora"** di sidebar
2. **Klik tombol "Tambah Flora"**
3. **Isi form** dengan data berikut:

   **Data Wajib:**
   - **Nama Lokal**: Contoh "Pohon Meranti"
   - **Nama Ilmiah**: Contoh "Shorea sp."
   - **Taman**: Pilih taman tempat flora ini ditemukan
   - **Status Konservasi**: Endemik, Langka, Umum, dll
   - **Deskripsi**: Informasi tentang flora

   **Data Opsional:**
   - **Foto Flora**: Upload foto (dapat menggunakan AI untuk identifikasi)
   - **Kategori**: Pohon, Semak, Tumbuhan Herba, dll
   - **Famili**: Nama famili botani
   - **Koordinat**: Lokasi spesifik di dalam taman

4. **Fitur AI (Opsional)**:
   - Upload foto → Klik "Identifikasi dengan AI"
   - Sistem akan mencoba mengidentifikasi spesies dari foto
   - Hasil identifikasi akan mengisi beberapa field secara otomatis

5. **Klik "Simpan"** atau **"Simpan dan Submit"**

#### 4.4.2 Edit dan Hapus Flora

Prosedur sama seperti edit/hapus taman (lihat 4.3.2 dan 4.3.3)

---

### 4.5 Input Data Fauna

#### 4.5.1 Menambah Fauna Baru

Prosedur sama seperti input flora (4.4.1), dengan field tambahan:

**Data Khusus Fauna:**
- **Nama Lokal**: Contoh "Burung Elang Jawa"
- **Nama Ilmiah**: Contoh "Nisaetus bartelsi"
- **Kelas**: Aves, Mammalia, Reptilia, dll
- **Status Konservasi**: Dilindungi, Terancam Punah, dll
- **Habitat**: Hutan, Rawa, Padang Rumput, dll

#### 4.5.2 Edit dan Hapus Fauna

Prosedur sama seperti flora (lihat 4.4.2)

---

### 4.6 Input Data Aktivitas/Kegiatan

#### 4.6.1 Menambah Aktivitas

1. **Klik menu "Kegiatan"** atau "Activities"
2. **Klik "Tambah Kegiatan"**
3. **Isi form**:
   - **Judul Kegiatan**: Contoh "Penanaman 1000 Pohon"
   - **Taman**: Pilih taman
   - **Tanggal**: Tanggal pelaksanaan
   - **Deskripsi**: Detail kegiatan
   - **Foto**: Dokumentasi kegiatan
   - **Peserta**: Jumlah peserta (opsional)

4. **Klik "Simpan"**

---

### 4.7 Upload Foto dan File

#### 4.7.1 Cara Upload Foto

1. **Klik tombol "Upload Foto"** atau drag & drop file ke area upload
2. **Pilih file** dari komputer (max 5MB per file)
3. **Format yang didukung**: JPG, PNG, WebP
4. **Tunggu proses upload** (akan muncul progress bar)
5. **Foto akan otomatis dioptimasi** oleh sistem

#### 4.7.2 Tips Upload Foto

- **Gunakan foto berkualitas baik** (resolusi minimal 800x600)
- **File tidak terlalu besar** (kompres terlebih dahulu jika >5MB)
- **Nama file jelas** (contoh: `meranti_taman_kaltim.jpg`)
- **Hindari karakter khusus** dalam nama file

---

### 4.8 Peta Interaktif

#### 4.8.1 Menggunakan Peta

1. **Klik menu "Peta"** atau akses dari halaman Taman
2. **Peta akan menampilkan**:
   - Lokasi semua taman kehati
   - Marker untuk setiap taman
   - Popup info ketika klik marker

3. **Fitur Peta**:
   - **Zoom**: Scroll mouse atau tombol +/- 
   - **Pan**: Drag map untuk berpindah
   - **Search**: Cari lokasi dengan nama
   - **Filter**: Filter berdasarkan region/provinsi

#### 4.8.2 Menentukan Koordinat di Peta

1. **Di form input Taman/Flora/Fauna**
2. **Klik "Pilih Lokasi di Peta"**
3. **Klik pada peta** di lokasi yang diinginkan
4. **Koordinat akan otomatis terisi** (Latitude, Longitude)

---

### 4.9 Approval Workflow

#### 4.9.1 Submit Data untuk Review (Regional Admin)

1. **Setelah selesai input data**, klik **"Simpan dan Submit"**
2. **Status data berubah** dari DRAFT → IN_REVIEW
3. **Data masuk ke antrian approval** Super Admin

#### 4.9.2 Approve/Reject Data (Super Admin)

1. **Klik menu "Approval"** di sidebar
2. **Lihat daftar data** yang menunggu approval
3. **Klik pada item** untuk melihat detail
4. **Review data** dengan teliti
5. **Pilih tindakan**:
   - **Approve**: Data disetujui, status → APPROVED
   - **Reject**: Data ditolak, berikan alasan penolakan
   - **Request Revision**: Minta perbaikan dari Regional Admin

6. **Klik "Konfirmasi"**

#### 4.9.3 Revisi Data yang Ditolak

1. **Regional Admin** akan mendapat notifikasi
2. **Klik menu sesuai data** (Flora/Fauna/Taman)
3. **Cari data dengan status REJECTED**
4. **Edit data** sesuai catatan dari Super Admin
5. **Submit ulang** untuk review

---

### 4.10 Pencarian dan Filter

#### 4.10.1 Pencarian Data

1. **Di halaman list** (Taman/Flora/Fauna), ada **search box** di atas
2. **Ketik kata kunci**: nama, lokasi, atau deskripsi
3. **Tekan Enter** atau klik tombol search
4. **Hasil pencarian** akan ditampilkan

#### 4.10.2 Filter Data

1. **Klik icon filter** (biasanya di sebelah search box)
2. **Pilih filter**:
   - **Status**: Draft, In Review, Approved, Rejected
   - **Region/Provinsi**: Filter berdasarkan wilayah
   - **Taman**: Filter berdasarkan taman tertentu
   - **Tanggal**: Filter berdasarkan periode

3. **Klik "Terapkan"**

---

## 5. PANDUAN ADMIN

### 5.1 Manajemen Pengguna

#### 5.1.1 Menambah User Baru (Super Admin)

1. **Klik menu "Pengguna"** atau "Users"
2. **Klik "Tambah User"**
3. **Isi form**:
   - **Nama Lengkap**: Nama user
   - **Email**: Email untuk login (harus unik)
   - **Password**: Password sementara (user harus ubah setelah login pertama)
- **Role**: Pilih Super Admin atau Regional Admin
- **Taman Kehati** (jika Regional Admin): Pilih taman kehati yang akan dikelola
   - **Status**: Aktif atau Nonaktif

4. **Klik "Simpan"**
5. **Informasi login** akan dikirim ke email user (atau berikan manual)

#### 5.1.2 Edit User

1. **Klik menu "Pengguna"**
2. **Klik pada nama user** yang ingin diedit
3. **Klik "Edit"**
4. **Ubah data** yang diperlukan
5. **Klik "Simpan"**

#### 5.1.3 Reset Password User

1. **Masuk ke halaman detail user**
2. **Klik "Reset Password"**
3. **Masukkan password baru**
4. **Konfirmasi password**
5. **Klik "Reset"**

#### 5.1.4 Nonaktifkan User

1. **Masuk ke halaman detail user**
2. **Klik "Nonaktifkan"**
3. **Konfirmasi**
4. **User tidak bisa login** sampai diaktifkan kembali

---

### 5.2 Manajemen Hak Akses (RBAC)

#### 5.2.1 Penjelasan Role

Sistem memiliki 2 level role dengan hak akses berbeda:

**Super Admin:**
- Akses penuh semua fitur
- Approval semua data
- Manajemen semua user
- Konfigurasi sistem

**Regional Admin:**
- Input/edit data di taman kehati yang dikelola
- Submit data untuk approval
- Manajemen kegiatan dan galeri taman
- Tidak bisa approve data (harus melalui Super Admin)
- Tidak bisa manage user

#### 5.2.2 Mengubah Role User

1. **Edit user** (lihat 5.1.2)
2. **Ubah field "Role"** (pilih antara Super Admin atau Regional Admin)
3. **Jika Regional Admin**, pilih taman kehati yang akan dikelola
4. **Simpan**

**Catatan**: 
- Perubahan role akan mempengaruhi hak akses user secara langsung
- Regional Admin hanya bisa mengelola taman kehati yang ditugaskan
- Super Admin memiliki akses ke semua taman

---

### 5.3 Manajemen Artikel dan Berita

#### 5.3.1 Menambah Artikel

1. **Klik menu "Artikel"** atau "News"
2. **Klik "Tambah Artikel"**
3. **Isi form**:
   - **Judul**: Judul artikel
   - **Slug**: URL-friendly (auto-generate dari judul)
   - **Konten**: Isi artikel (support rich text editor)
   - **Kategori**: Pilih kategori
   - **Taman**: Pilih taman terkait (opsional)
   - **Thumbnail**: Upload gambar thumbnail
   - **Status**: Draft atau Published

4. **Klik "Simpan"** atau **"Publish"**

#### 5.3.2 Manajemen Pengumuman

1. **Klik menu "Pengumuman"** atau "Announcements"
2. **Klik "Tambah Pengumuman"**
3. **Isi form**: Judul, konten, tanggal mulai, tanggal akhir
4. **Klik "Simpan"**

Pengumuman akan tampil di halaman depan untuk semua user.

---

### 5.4 Dashboard dan Statistik

#### 5.4.1 Dashboard Overview

Dashboard menampilkan:

- **Total Taman**: Jumlah taman kehati terdaftar
- **Total Flora**: Jumlah spesies flora
- **Total Fauna**: Jumlah spesies fauna
- **Total User**: Jumlah pengguna aktif
- **Data Pending**: Jumlah data menunggu approval
- **Grafik Pertumbuhan**: Grafik perkembangan data per bulan
- **Aktivitas Terbaru**: Log aktivitas sistem

#### 5.4.2 Export Data

1. **Di halaman Dashboard** atau halaman list data
2. **Klik tombol "Export"** atau ikon download
3. **Pilih format**: Excel (.xlsx) atau CSV
4. **File akan didownload** ke komputer

---

## 6. PANDUAN TEKNIS

### 6.1 Arsitektur Deployment

Sistem ini di-deploy menggunakan **Docker** di server Ubuntu:

```
Server Ubuntu
├── Docker Engine
│   ├── Container: Backend (FastAPI)
│   ├── Container: Frontend (Next.js)
│   ├── Container: PostgreSQL
│   └── Container: Redis
└── File Storage (Uploads)
```

### 6.2 Akses Server

#### 6.2.1 SSH ke Server

```bash
ssh ubuntu@38.47.93.167
# atau
ssh user@server-ip
```

#### 6.2.2 Lokasi File Deployment

```bash
cd ~/dasmap_prod/apps/tamankehati
# atau sesuai konfigurasi
```

### 6.3 Perintah Docker Dasar

#### 6.3.1 Cek Status Container

```bash
docker compose -f docker-compose.pull.no-nginx.yml ps
```

#### 6.3.2 Lihat Log

```bash
# Log semua service
docker compose -f docker-compose.pull.no-nginx.yml logs -f

# Log backend saja
docker compose -f docker-compose.pull.no-nginx.yml logs -f backend

# Log frontend saja
docker compose -f docker-compose.pull.no-nginx.yml logs -f frontend
```

#### 6.3.3 Restart Service

```bash
# Restart semua
docker compose -f docker-compose.pull.no-nginx.yml restart

# Restart backend saja
docker compose -f docker-compose.pull.no-nginx.yml restart backend
```

#### 6.3.4 Stop dan Start

```bash
# Stop semua
docker compose -f docker-compose.pull.no-nginx.yml down

# Start semua
docker compose -f docker-compose.pull.no-nginx.yml up -d
```

### 6.4 Backup Database

#### 6.4.1 Backup Manual

```bash
# Backup database
docker compose -f docker-compose.pull.no-nginx.yml exec postgres pg_dump -U kehati_user kehati_db > backup_$(date +%Y%m%d).sql

# Atau dengan nama spesifik
docker compose -f docker-compose.pull.no-nginx.yml exec postgres pg_dump -U kehati_user kehati_db > backup_20251106.sql
```

#### 6.4.2 Restore Database

```bash
# Restore dari backup
cat backup_20251106.sql | docker compose -f docker-compose.pull.no-nginx.yml exec -T postgres psql -U kehati_user kehati_db
```

### 6.5 Update Sistem (Deployment Baru)

#### 6.5.1 Update via CI/CD (Otomatis)

Sistem sudah terintegrasi dengan **GitHub Actions CI/CD**:

1. **Push code ke branch `main`** di repository GitHub
2. **CI/CD akan otomatis**:
   - Build Docker images
   - Push ke Docker Hub
   - Deploy ke server
   - Run health checks

3. **Tidak perlu akses server manual** untuk update

#### 6.5.2 Update Manual

```bash
# 1. SSH ke server
ssh ubuntu@38.47.93.167

# 2. Masuk ke direktori project
cd ~/dasmap_prod/apps/tamankehati

# 3. Pull images terbaru
docker compose -f docker-compose.pull.no-nginx.yml pull

# 4. Restart services
docker compose -f docker-compose.pull.no-nginx.yml up -d

# 5. Run database migrations (jika ada)
docker compose -f docker-compose.pull.no-nginx.yml exec backend alembic upgrade head

# 6. Cek status
docker compose -f docker-compose.pull.no-nginx.yml ps
```

### 6.6 Database Migration

#### 6.6.1 Cek Migration Status

```bash
docker compose -f docker-compose.pull.no-nginx.yml exec backend alembic current
```

#### 6.6.2 Upgrade Database

```bash
docker compose -f docker-compose.pull.no-nginx.yml exec backend alembic upgrade head
```

#### 6.6.3 Rollback Migration

```bash
docker compose -f docker-compose.pull.no-nginx.yml exec backend alembic downgrade -1
```

### 6.7 Monitoring dan Health Check

#### 6.7.1 Health Check Backend

```bash
# Via curl
curl http://38.47.93.167:8080/api/health

# Atau via browser
http://38.47.93.167:8080/api/health
```

**Response yang diharapkan:**
```json
{
  "status": "ok",
  "database": "connected",
  "redis": "connected"
}
```

#### 6.7.2 Cek Disk Space

```bash
df -h
```

#### 6.7.3 Cek Memory Usage

```bash
free -h
```

#### 6.7.4 Cek Container Resource Usage

```bash
docker stats
```

### 6.8 File Upload Management

#### 6.8.1 Lokasi File Upload

File upload disimpan di:
```bash
# Di dalam container backend
/app/uploads

# Di host (jika volume mounted)
~/dasmap_prod/apps/tamankehati/uploads
```

#### 6.8.2 Backup File Upload

```bash
# Backup folder uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

#### 6.8.3 Cleanup File Lama

```bash
# Cek ukuran folder
du -sh uploads/

# Hapus file lama (hati-hati!)
find uploads/ -type f -mtime +365 -delete  # Hapus file > 1 tahun
```

### 6.9 Environment Variables

File konfigurasi utama: `.env` di direktori deployment.

**Variabel Penting:**
- `BASE_URL`: URL backend (untuk image URL)
- `DATABASE_URL`: Connection string database
- `SECRET_KEY`: JWT secret key
- `IMAGE_TAG`: Tag Docker image yang digunakan

**Jangan edit `.env` tanpa pengetahuan teknis!**

---

## 7. TROUBLESHOOTING

### 7.1 Login Tidak Bisa

**Gejala**: Tidak bisa login, error "Invalid credentials"

**Solusi**:
1. **Cek email dan password** (case sensitive)
2. **Cek koneksi internet**
3. **Clear browser cache** dan cookies
4. **Coba browser lain**
5. **Hubungi Super Admin** untuk reset password

---

### 7.2 Error 500 (Internal Server Error)

**Gejala**: Halaman error 500 saat akses fitur tertentu

**Solusi**:
1. **Refresh halaman** (F5)
2. **Cek log backend** (lihat 6.3.2)
3. **Cek koneksi database**:
   ```bash
   docker compose -f docker-compose.pull.no-nginx.yml exec backend python -c "from sqlalchemy import create_engine; engine = create_engine('postgresql://...'); engine.connect()"
   ```
4. **Restart backend**:
   ```bash
   docker compose -f docker-compose.pull.no-nginx.yml restart backend
   ```
5. **Hubungi tim teknis** jika masih error

---

### 7.3 Upload Foto Gagal

**Gejala**: Foto tidak bisa diupload, error "Upload failed"

**Solusi**:
1. **Cek ukuran file** (max 5MB)
2. **Cek format file** (harus JPG, PNG, atau WebP)
3. **Cek disk space server**:
   ```bash
   df -h
   ```
4. **Cek permission folder uploads**:
   ```bash
   ls -la uploads/
   ```
5. **Cek log backend** untuk error detail

---

### 7.4 Data Tidak Tampil

**Gejala**: Data yang sudah diinput tidak muncul di list

**Solusi**:
1. **Cek status data**:
   - Jika status DRAFT, hanya tampil untuk user yang membuat
   - Jika status IN_REVIEW, tampil di Approval Queue
   - Jika status APPROVED, tampil di aplikasi

2. **Cek filter** di halaman list (mungkin ter-filter)

3. **Cek role user**:
   - Regional Admin hanya lihat data di taman kehati yang dikelolanya

4. **Refresh halaman** (Ctrl+F5 untuk hard refresh)

---

### 7.5 Peta Tidak Tampil

**Gejala**: Peta interaktif blank atau tidak muncul

**Solusi**:
1. **Cek koneksi internet** (peta membutuhkan internet untuk load tiles)

2. **Cek browser console** (F12 → Console) untuk error

3. **Coba browser lain** (Chrome, Firefox, Edge)

4. **Clear browser cache**

---

### 7.6 Database Connection Error

**Gejala**: Error "Database connection failed"

**Solusi**:
1. **Cek status container PostgreSQL**:
   ```bash
   docker compose -f docker-compose.pull.no-nginx.yml ps postgres
   ```

2. **Restart PostgreSQL**:
   ```bash
   docker compose -f docker-compose.pull.no-nginx.yml restart postgres
   ```

3. **Cek log PostgreSQL**:
   ```bash
   docker compose -f docker-compose.pull.no-nginx.yml logs postgres
   ```

4. **Cek environment variables** `DATABASE_URL` di `.env`

---

### 7.7 Slow Performance

**Gejala**: Sistem lambat, loading lama

**Solusi**:
1. **Cek resource server**:
   ```bash
   docker stats
   df -h
   free -h
   ```

2. **Cek jumlah data** di database (mungkin perlu cleanup)

3. **Restart semua container**:
   ```bash
   docker compose -f docker-compose.pull.no-nginx.yml restart
   ```

4. **Cek koneksi internet** (jika akses dari luar)

---

### 7.8 Reset Password Super Admin

Jika lupa password Super Admin dan tidak ada user lain:

```bash
# 1. SSH ke server
# 2. Masuk ke container backend
docker compose -f docker-compose.pull.no-nginx.yml exec backend bash

# 3. Run Python script reset password
python -c "
from apps.backend.domains.auth.models import User
from apps.backend.core.security import get_password_hash
user = User.get_by_email('admin@kehati.org')
user.password_hash = get_password_hash('password_baru')
user.save()
"
```

**Atau hubungi tim pengembang untuk reset.**

---

## 8. LAMPIRAN

### 8.1 Daftar URL Penting

| URL | Keterangan |
|-----|------------|
| `http://38.47.93.167:8080` | Frontend (Aplikasi Utama) |
| `http://38.47.93.167:8080/api` | Backend API |
| `http://38.47.93.167:8080/docs` | API Documentation (Swagger) |
| `http://38.47.93.167:8080/api/health` | Health Check Endpoint |

### 8.2 Default Credentials

**PERINGATAN: Ganti password default setelah login pertama!**

| Role | Email | Password Default |
|------|-------|------------------|
| Super Admin | `admin@kehati.org` | `password` |
| Regional Admin | `kaltim.admin@kehati.org` | `password` |
| Regional Admin | `sumut.admin@kehati.org` | `password` |

### 8.3 Kontak Support

**Tim Teknis:**
- Email: `irgyagentaarnezzi@gmail.com`
- GitHub: Repository project untuk issue tracking

**Super Admin:**
- Hubungi melalui sistem internal untuk bantuan operasional

### 8.4 Struktur Folder Dokumentasi

```
/BIMTEK_TAMAN_KEHATI/
│
├── 01_Materi_Bimbingan_Teknis.md (dokumen ini)
├── 02_User_Manual_Taman_Kehati.md
├── 03_Jadwal_dan_Daftar_Hadir.md
├── 04_Berita_Acara_Bimtek.md
├── 05_Foto_Dokumentasi_Pelatihan/
│      ├── sesi1.jpg
│      ├── sesi2.jpg
│      └── peserta_group.jpg
└── 06_Evaluasi_Peserta.md
```

### 8.5 Checklist Setelah Bimtek

**Untuk Super Admin:**
- [ ] Ganti password default semua user
- [ ] Konfigurasi email server (jika ada)
- [ ] Setup backup database otomatis
- [ ] Setup monitoring (opsional)
- [ ] Test semua fitur utama
- [ ] Dokumentasi akses server

**Untuk Regional Admin:**
- [ ] Ganti password sendiri
- [ ] Test input data taman kehati yang dikelola
- [ ] Test input data flora
- [ ] Test input data fauna
- [ ] Test upload foto dan galeri
- [ ] Test manajemen kegiatan
- [ ] Test submit untuk approval

---

## PENUTUP

Dokumen Bimbingan Teknis ini dibuat sebagai panduan resmi untuk pengoperasian Sistem Informasi Taman Kehati Nasional. Dokumen ini akan terus diperbarui sesuai dengan perkembangan sistem.

**Versi Dokumen:** 1.0  
**Tanggal Pembuatan:** November 2025  
**Pembaruan Terakhir:** November 2025

**Saran dan Masukan:**
Silakan hubungi tim pengembang untuk saran, masukan, atau pertanyaan terkait dokumen ini.

---

**Dokumen ini disusun oleh:**  
Tim Pengembang Sistem Taman Kehati

**Ditetapkan oleh:**  
Direktorat Konservasi Keanekaragaman Hayati  
Kementerian Lingkungan Hidup (KLH)

---

**Hak Cipta © 2025 - Sistem Informasi Taman Kehati Nasional**

