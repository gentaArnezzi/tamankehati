# SOP LENGKAP INPUT DATA SISTEM TAMAN KEHATI
## Standard Operating Procedure - Manajemen Data Biodiversitas

**Versi:** 1.0  
**Tanggal:** 29 Oktober 2024  
**Dibuat untuk:** Seluruh pengguna sistem Taman Kehati

---

## DAFTAR ISI

1. [Pendahuluan](#1-pendahuluan)
2. [Onboarding User Baru](#2-onboarding-user-baru)
3. [Input Data Taman (Parks)](#3-input-data-taman-parks)
4. [Input Data Flora](#4-input-data-flora)
5. [Input Data Fauna](#5-input-data-fauna)
6. [Input Data Aktivitas](#6-input-data-aktivitas)
7. [Input Data Galeri](#7-input-data-galeri)
8. [Workflow Approval](#8-workflow-approval)
9. [Referensi & Best Practices](#9-referensi--best-practices)

---

## 1. PENDAHULUAN

### 1.1 Tujuan Dokumen

Dokumen ini adalah panduan lengkap untuk:
- ✅ Onboarding user baru oleh Super Admin
- ✅ Input data taman (kawasan konservasi)
- ✅ Input data flora (tumbuhan)
- ✅ Input data fauna (satwa liar)
- ✅ Input data aktivitas/kegiatan
- ✅ Input data galeri foto
- ✅ Proses review dan approval data

### 1.2 Hirarki User

| Role | Akses | Tanggung Jawab |
|------|-------|----------------|
| **Super Admin** | Seluruh sistem | Kelola user, approve semua taman, akses semua data |
| **Regional Admin** | Taman tertentu (park_id) | Kelola data 1 taman, submit untuk approval |

### 1.3 Workflow Status

Semua data menggunakan workflow 4 tahap:

```
DRAFT → IN_REVIEW → APPROVED / REJECTED
                           ↓
                     (Edit & Submit Ulang)
```

---

## 2. ONBOARDING USER BARU

### 2.1 Prasyarat
- Hanya **Super Admin** yang dapat membuat user baru
- Data taman sudah ada (untuk Regional Admin)

### 2.2 Langkah-langkah Super Admin

#### Step 1: Login sebagai Super Admin
```
URL: https://tamankehati.id/admin
Email: superadmin@tamankehati.id
Password: [Kredensial Super Admin]
```

#### Step 2: Akses Menu User Management
1. Klik menu **"Users"** atau **"Manajemen User"**
2. Klik tombol **"+ Tambah User Baru"**

#### Step 3: Isi Data User Baru

**Form Input User:**

| Field | Tipe | Keterangan | Contoh |
|-------|------|------------|--------|
| `email`* | String | Email valid untuk login | admin.tngl@kehati.id |
| `password`* | String | Password minimal 8 karakter | SecurePass123! |
| `role`* | Dropdown | Pilih role user | regional_admin |
| `park_id` | Dropdown | Taman yang dikelola (jika regional_admin) | TN Gunung Leuser |
| `display_name` | String | Nama tampilan | Ahmad Hidayat |
| `full_name` | String | Nama lengkap | Ahmad Hidayat, S.Hut |
| `profile_picture_url` | URL | Link foto profil | https://... |
| `is_active` | Checkbox | Status aktif akun | ✓ Active |

**Validasi:**
- Email harus unik (belum terdaftar)
- Password minimal 8 karakter (disarankan kombinasi huruf, angka, simbol)
- Regional Admin **WAJIB** memilih `park_id`
- Super Admin tidak perlu `park_id`

#### Step 4: Simpan & Kirim Kredensial

1. Klik **"Simpan"**
2. Sistem otomatis:
   - Hash password dengan bcrypt
   - Set `created_at` dan `updated_at`
   - Kirim email notifikasi (jika fitur tersedia)

3. Beritahu user baru:
   ```
   Subject: Akun Taman Kehati Anda

   Halo Ahmad Hidayat,

   Akun Anda telah dibuat:
   - Email: admin.tngl@kehati.id
   - Password: SecurePass123! (ganti setelah login pertama)
   - Akses: TN Gunung Leuser
   
   Login di: https://tamankehati.id/login
   ```

#### Step 5: User Baru Login Pertama Kali

User baru harus:
1. Login dengan kredensial yang diberikan
2. **Ganti password** (recommended)
3. Lengkapi profil (display_name, foto profil)
4. Mulai input data

---

## 3. INPUT DATA TAMAN (PARKS)

### 3.1 Prasyarat
- User sudah login (Super Admin atau Regional Admin)
- Memiliki data lengkap taman (SK penetapan, luas, koordinat, dll)

### 3.2 Struktur Data Taman

#### A. DATA WAJIB

| Field | Tipe | Keterangan | Contoh |
|-------|------|------------|--------|
| `name`* | String (255) | Nama resmi taman | Taman Nasional Gunung Leuser |
| `slug`* | String (255) | URL-friendly name (auto-generated) | taman-nasional-gunung-leuser |

#### B. INFORMASI ADMINISTRATIF

| Field | Keterangan | Contoh |
|-------|------------|--------|
| `sk_penetapan` | Nomor SK penetapan | SK.6407/Menhut-VII/KUH/2014 |
| `pengelola` | Instansi pengelola | Balai Besar TNGL |
| `provinsi` | Provinsi lokasi | Aceh, Sumatera Utara |
| `kota_kabupaten` | Kota/Kabupaten | Aceh Tenggara, Gayo Lues |
| `kecamatan` | Kecamatan | Badar, Babussalam |
| `desa_kelurahan` | Desa/Kelurahan | Gunung Kerambil |

#### C. INFORMASI GEOGRAFIS

| Field | Tipe | Keterangan | Contoh |
|-------|------|------------|--------|
| `tipe_ekoregion` | String | Tipe ekoregion | Hutan Hujan Tropis Dataran Rendah |
| `area_ha` | Numeric(10,2) | Luas dalam hektar | 1094692.00 |
| `latitude` | Numeric(10,8) | Koordinat lintang | 3.5000000 |
| `longitude` | Numeric(11,8) | Koordinat bujur | 97.5000000 |

💡 **Cara Mendapatkan Koordinat:**
- Gunakan Google Maps: Klik kanan → Copy koordinat
- Gunakan GPS di lokasi taman
- Ambil centroid dari batas kawasan

#### D. DESKRIPSI & VISI-MISI

| Field | Tipe | Keterangan |
|-------|------|------------|
| `description` | Text | Deskripsi umum taman (min 200 karakter) |
| `kondisi_fisik` | Text | Kondisi fisik kawasan (topografi, iklim) |
| `nilai_penting` | Text | Nilai penting kawasan (biodiversitas, ekologi) |
| `sejarah` | Text | Sejarah penetapan dan pengelolaan |
| `visi` | Text | Visi pengelolaan |
| `misi` | Text | Misi pengelolaan |
| `nilai_dasar` | Text | Nilai-nilai dasar organisasi |

#### E. MEDIA

| Field | Keterangan | Format |
|-------|------------|--------|
| `gambar_utama` | URL gambar utama/hero image | JPG/PNG, max 5MB |

#### F. METADATA (Otomatis oleh Sistem)

- `id` - Auto increment
- `status` - draft/published/approved/archived
- `created_at`, `updated_at`
- `submitted_by`, `submitted_at`
- `approved_by`, `approved_at`
- `rejected_by`, `rejected_at`, `rejection_reason`
- `deleted_at` (soft delete)

### 3.3 Langkah Input Data Taman

#### Step 1: Akses Form Input Taman
1. Login sebagai Super Admin atau Regional Admin
2. Klik menu **"Taman"** atau **"Parks"**
3. Klik **"+ Tambah Taman Baru"**

#### Step 2: Isi Identitas Dasar

```
Nama Taman: Taman Nasional Gunung Leuser
Slug: (otomatis: taman-nasional-gunung-leuser)
Status: draft (pilih "approved" jika Super Admin)
```

#### Step 3: Isi Data Administratif

```
SK Penetapan: SK.6407/Menhut-VII/KUH/2014
Pengelola: Balai Besar Taman Nasional Gunung Leuser
Provinsi: Aceh, Sumatera Utara
Kota/Kabupaten: Aceh Tenggara, Aceh Selatan, Gayo Lues
Kecamatan: Badar, Babussalam, Blangkejeren
Desa/Kelurahan: Gunung Kerambil, Agusan
```

#### Step 4: Isi Data Geografis

```
Tipe Ekoregion: Hutan Hujan Tropis Dataran Rendah dan Pegunungan
Luas (ha): 1094692.00
Latitude: 3.5000000
Longitude: 97.5000000
```

#### Step 5: Isi Deskripsi

**Deskripsi Umum** (min 200 karakter):
```
Taman Nasional Gunung Leuser (TNGL) adalah salah satu kawasan 
pelestarian alam terluas di Indonesia seluas 1.094.692 hektar 
yang terletak di dua provinsi yaitu Aceh dan Sumatera Utara. 
TNGL merupakan rumah bagi lebih dari 4.000 spesies tumbuhan 
dan 380 spesies fauna termasuk harimau sumatera, gajah sumatera, 
dan orangutan sumatera.
```

**Kondisi Fisik**:
```
Topografi berbukit hingga bergunung dengan ketinggian 0-3.404 mdpl 
(Puncak Leuser). Iklim tropis basah dengan curah hujan 2.500-4.000 mm/tahun.
Memiliki sungai-sungai besar seperti Sungai Alas dan Sungai Kluet.
```

**Nilai Penting**:
```
- Bagian dari Tropical Rainforest Heritage of Sumatra (UNESCO World Heritage)
- Habitat satwa langka: Orangutan, Harimau, Gajah, Badak Sumatera
- Sumber air bagi jutaan penduduk Aceh dan Sumut
- Keanekaragaman hayati tinggi dengan endemisme tinggi
```

**Sejarah**:
```
Ditetapkan sebagai Taman Nasional pada tahun 1980 berdasarkan 
SK Menteri Pertanian No. 811/Kpts/Um/11/1980. Nama Gunung Leuser 
diambil dari nama Gunung Leuser (3.119 mdpl) yang merupakan salah 
satu puncak tertinggi di kawasan ini.
```

**Visi**:
```
Menjadi kawasan konservasi terdepan dalam pelestarian ekosistem 
Leuser yang berkelanjutan untuk kesejahteraan masyarakat.
```

**Misi**:
```
1. Melindungi dan melestarikan keanekaragaman hayati
2. Mengembangkan ekowisata berkelanjutan
3. Memberdayakan masyarakat sekitar kawasan
4. Meningkatkan kapasitas pengelolaan
```

#### Step 6: Upload Gambar Utama

- Pilih foto landscape taman (view terbaik)
- Resolusi: Min 1920x1080px
- Format: JPG/PNG
- Ukuran: Max 5MB

#### Step 7: Set Status & Submit

- **Jika Super Admin**: Pilih status `approved` → Data langsung publish
- **Jika Regional Admin**: Pilih status `in_review` → Perlu approval Super Admin

#### Step 8: Simpan

Klik **"Simpan"** → Sistem generate ID taman yang akan digunakan untuk data flora, fauna, aktivitas.

---

## 4. INPUT DATA FLORA

### 4.1 Prasyarat
- ✅ Data taman sudah ada (punya `park_id`)
- ✅ Data flora sudah dikumpulkan dan diverifikasi
- ✅ Foto flora tersedia

### 4.2 Struktur Data Flora

#### A. DATA WAJIB

| Field | Keterangan | Contoh |
|-------|------------|--------|
| `park_id`* | ID taman tempat flora ditemukan | 1 (TN Gunung Leuser) |
| `local_name` | Nama lokal/umum | Rafflesia |
| `scientific_name` | Nama ilmiah (Latin) | Rafflesia arnoldii |

#### B. KLASIFIKASI TAKSONOMI

| Field | Contoh |
|-------|--------|
| `family` | Rafflesiaceae |
| `genus` | Rafflesia |
| `species` | arnoldii |

#### C. DESKRIPSI & KARAKTERISTIK

| Field | Keterangan |
|-------|------------|
| `description` | Deskripsi umum flora (min 100 karakter) |
| `morphology` | Ciri morfologi (ukuran, bentuk, warna) |
| `habitat` | Tipe habitat tempat tumbuh |
| `benefits` | Manfaat ekologi/ekonomi |
| `uses` | Kegunaan bagi manusia/satwa |

#### D. STATUS KONSERVASI

| Field | Nilai | Keterangan |
|-------|-------|------------|
| `iucn_status` | CR, EN, VU, NT, LC, DD, NE | Status IUCN Red List |
| `is_endemic` | true/false | Endemik Indonesia? |

#### E. MEDIA & REFERENSI

| Field | Keterangan |
|-------|------------|
| `gambar_utama` | URL gambar utama flora |
| `image_url` | URL gambar tambahan |
| `local_id` | Kode referensi internal (e.g., TNGL-FL-001) |

### 4.3 Langkah Input Data Flora

#### Step 1: Akses Form Input Flora
Menu → **Flora** → **+ Tambah Flora Baru**

#### Step 2: Pilih Taman

```
Taman: [Dropdown] TN Gunung Leuser (park_id: 1)
```

#### Step 3: Isi Nama Flora

```
Nama Lokal: Rafflesia
Nama Ilmiah: Rafflesia arnoldii
```

#### Step 4: Isi Klasifikasi Taksonomi

```
Family: Rafflesiaceae
Genus: Rafflesia
Species: arnoldii
```

#### Step 5: Isi Deskripsi

**Description**:
```
Rafflesia arnoldii adalah bunga terbesar di dunia dengan diameter 
hingga 1 meter dan berat 10 kg. Bunga ini bersifat parasit pada 
liana Tetrastigma dan tidak memiliki daun, batang, maupun akar. 
Mekar hanya 5-7 hari kemudian membusuk.
```

**Morphology**:
```
Diameter bunga 70-100 cm, berat 7-10 kg. Lima kelopak bunga berwarna 
merah bata dengan bintik-bintik putih. Tidak memiliki klorofil, 
daun, batang, atau akar sejati.
```

**Habitat**:
```
Hutan hujan tropis dataran rendah hingga 1.000 mdpl. Parasit pada 
akar dan batang liana Tetrastigma spp. Tumbuh di lokasi lembab dengan 
kanopi rapat.
```

**Benefits**:
```
Nilai ekologi sebagai indikator kesehatan hutan primer. Menarik 
lalat sebagai penyerbuk. Daya tarik ekowisata tinggi.
```

**Uses**:
```
Ekowisata dan edukasi konservasi. Dalam tradisi lokal digunakan 
sebagai obat tradisional (perlu konservasi, tidak boleh dieksploitasi).
```

#### Step 6: Set Status Konservasi

```
IUCN Status: EN (Endangered)
Endemik Indonesia: ✓ Yes
```

#### Step 7: Upload Gambar & Set Referensi

```
Gambar Utama: [Upload foto rafflesia mekar]
Local ID: TNGL-FL-001
```

#### Step 8: Set Status

- Regional Admin → `in_review`
- Super Admin → `approved`

#### Step 9: Simpan

Klik **"Simpan"**

### 4.4 Contoh Data Flora Lengkap

| Nama Lokal | Nama Ilmiah | Family | IUCN | Endemik |
|------------|-------------|--------|------|---------|
| Rafflesia | *Rafflesia arnoldii* | Rafflesiaceae | EN | ✓ |
| Kantong Semar | *Nepenthes ampullaria* | Nepenthaceae | LC | ✗ |
| Damar | *Agathis alba* | Araucariaceae | VU | ✗ |
| Jelutung | *Dyera costulata* | Apocynaceae | CR | ✗ |
| Meranti | *Shorea leprosula* | Dipterocarpaceae | EN | ✗ |

---

## 5. INPUT DATA FAUNA

### 5.1 Struktur Data Fauna

#### A. DATA WAJIB

| Field | Contoh |
|-------|--------|
| `park_id`* | 1 (TN Gunung Leuser) |
| `local_name` | Orangutan Sumatera |
| `scientific_name` | Pongo abelii |

#### B. KLASIFIKASI TAKSONOMI

| Field | Contoh |
|-------|--------|
| `ordo` | Primates |
| `family` | Hominidae |
| `genus` | Pongo |
| `species` | abelii |

#### C. DESKRIPSI & EKOLOGI

| Field | Keterangan |
|-------|------------|
| `description` | Deskripsi umum fauna |
| `morphology` | Ciri fisik (ukuran, warna, berat) |
| `habitat` | Tipe habitat |
| `diet` | Jenis makanan dan pola makan |
| `behavior` | Perilaku, aktivitas, reproduksi |
| `habitat_sumber_makanan` | Relasi habitat dengan makanan |

#### D. STATUS KONSERVASI & KLASIFIKASI KHUSUS

| Field | Nilai | Keterangan |
|-------|-------|------------|
| `iucn_status` | CR, EN, VU, NT, LC, DD, NE | Status IUCN |
| `is_endemic` | true/false | Endemik Indonesia? |
| `status_hama` | ya/tidak/kadang-kadang | Apakah termasuk hama? |
| `tingkat_hama` | ringan/sedang/berat | Level hama (jika ada) |

#### E. MEDIA

| Field | Keterangan |
|-------|------------|
| `gambar_utama` | URL gambar utama |
| `image_url` | URL gambar tambahan |
| `local_id` | Kode referensi (e.g., TNGL-MAM-001) |

### 5.2 Langkah Input Data Fauna

#### Step 1-3: Akses Form & Pilih Taman

Menu → **Fauna** → **+ Tambah Fauna Baru** → Pilih Taman

#### Step 4: Isi Identitas & Taksonomi

```
Nama Lokal: Orangutan Sumatera
Nama Ilmiah: Pongo abelii
Ordo: Primates
Family: Hominidae
Genus: Pongo
Species: abelii
```

#### Step 5: Isi Deskripsi Lengkap

**Description**:
```
Orangutan Sumatera adalah salah satu dari tiga spesies orangutan 
dan merupakan kera besar yang hanya ditemukan di Sumatera. Populasi 
liar diperkirakan hanya 14.600 individu dengan tren menurun akibat 
hilangnya habitat dan perburuan liar.
```

**Morphology**:
```
Tinggi jantan dewasa 1.5m, berat 50-90kg. Betina lebih kecil: 1.2m, 
30-50kg. Rambut panjang berwarna coklat kemerahan. Jantan dewasa 
memiliki bantalan pipi (flange) dan kantung leher besar.
```

**Habitat**:
```
Hutan hujan tropis dataran rendah hingga 1.500 mdpl. Arboreal, 
menghabiskan 95% waktu di pohon. Memerlukan hutan primer dengan 
kanopi rapat dan pohon-pohon besar untuk sarang.
```

**Diet**:
```
Frugivora (60% buah-buahan), daun muda (25%), kulit kayu, serangga 
(5-10%). Spesies favorit: durian, ficus, rambutan hutan. Konsumsi 
400+ spesies tumbuhan.
```

**Behavior**:
```
Semi-soliter. Betina dengan anak hidup berkelompok kecil. Jantan dewasa 
soliter. Interbirth interval 8-9 tahun (terlama di antara mamalia). 
Membuat sarang baru setiap malam di pohon tinggi (10-30m).
```

**Habitat & Sumber Makanan**:
```
Bergantung pada ketersediaan pohon buah-buahan besar di hutan primer. 
Home range betina 600-900 ha, jantan hingga 1.500 ha. Pergerakan 
mengikuti pola fruiting pohon besar.
```

#### Step 6: Set Status Konservasi

```
IUCN Status: CR (Critically Endangered)
Endemik Indonesia: ✓ Yes (Endemik Sumatera)
Status Hama: tidak
Tingkat Hama: -
```

#### Step 7: Upload Gambar & Referensi

```
Gambar Utama: [Upload foto orangutan di habitat alami]
Local ID: TNGL-MAM-001
```

#### Step 8: Set Status & Simpan

Status: `in_review` (Regional Admin) atau `approved` (Super Admin)

### 5.3 Contoh Data Fauna Lengkap

| Nama Lokal | Nama Ilmiah | Ordo | IUCN | Endemik | Hama |
|------------|-------------|------|------|---------|------|
| Orangutan Sumatera | *Pongo abelii* | Primates | CR | ✓ | tidak |
| Harimau Sumatera | *Panthera tigris sumatrae* | Carnivora | CR | ✓ | tidak |
| Gajah Sumatera | *Elephas maximus sumatranus* | Proboscidea | CR | ✓ | kadang-kadang |
| Elang Jawa | *Nisaetus bartelsi* | Accipitriformes | EN | ✓ | tidak |
| Tapir Asia | *Tapirus indicus* | Perissodactyla | EN | ✗ | tidak |
| Siamang | *Symphalangus syndactylus* | Primates | EN | ✗ | tidak |
| Kambing Hutan | *Capricornis sumatraensis* | Artiodactyla | VU | ✓ | tidak |
| Babi Hutan | *Sus scrofa* | Artiodactyla | LC | ✗ | ya (sedang) |

---

## 6. INPUT DATA AKTIVITAS

### 6.1 Struktur Data Aktivitas

| Field | Tipe | Keterangan | Contoh |
|-------|------|------------|--------|
| `park_id`* | Integer | ID taman | 1 |
| `title`* | String (255) | Judul kegiatan | Patroli Rutin Sektor Bahorok |
| `description` | Text | Deskripsi kegiatan | Patroli rutin untuk mencegah... |
| `activity_date`* | Date | Tanggal kegiatan | 2024-10-15 |
| `location` | String (255) | Lokasi spesifik | Sektor Bahorok, Blok A |
| `images` | Text (JSON) | Array URL gambar | ["url1.jpg", "url2.jpg"] |
| `status` | Enum | draft/in_review/approved/rejected | in_review |

### 6.2 Langkah Input Aktivitas

#### Step 1: Akses Form

Menu → **Aktivitas** → **+ Tambah Aktivitas Baru**

#### Step 2: Isi Data

```
Taman: TN Gunung Leuser
Judul: Patroli Rutin Sektor Bahorok
Tanggal Kegiatan: 15 Oktober 2024
Lokasi: Sektor Bahorok, Blok A, Zona Inti

Deskripsi:
Kegiatan patroli rutin di Sektor Bahorok untuk mencegah pembalakan 
liar dan perburuan ilegal. Tim patroli terdiri dari 6 ranger yang 
melakukan pengecekan di wilayah seluas 500 hektar. Ditemukan 2 jerat 
babi yang telah dinonaktifkan. Dokumentasi jejak gajah dan orangutan.

Status: in_review
```

#### Step 3: Upload Foto Dokumentasi

Upload 3-10 foto kegiatan (patroli, dokumentasi temuan, tim)

#### Step 4: Simpan

### 6.3 Contoh Aktivitas Lain

- **Penanaman Pohon**: Restorasi habitat orangutan dengan 500 bibit
- **Penyuluhan Masyarakat**: Sosialisasi konservasi ke 5 desa penyangga
- **Monitoring Satwa**: Camera trap monitoring harimau dan gajah
- **Ekowisata**: Kunjungan 50 wisatawan domestik ke area trekking
- **Penelitian**: Survei populasi rafflesia di 3 lokasi

---

## 7. INPUT DATA GALERI

### 7.1 Struktur Data Galeri

| Field | Keterangan | Contoh |
|-------|------------|--------|
| `title`* | Judul foto | Orangutan Betina dan Anak |
| `description` | Deskripsi foto | Orangutan betina sedang... |
| `image_url`* | URL gambar | https://... atau /uploads/... |
| `entity_type` | Tipe entitas terkait | flora / fauna / park |
| `entity_id` | ID entitas | 5 (ID orangutan) |
| `author_id` | ID fotografer | 12 (ID user) |
| `status` | Status workflow | draft/in_review/approved/rejected |

### 7.2 Langkah Input Galeri

#### Step 1: Akses Form

Menu → **Galeri** → **+ Upload Foto Baru**

#### Step 2: Upload Gambar

Drag & drop foto atau klik upload:
- Format: JPG/PNG
- Resolusi: Min 1280x720px
- Ukuran: Max 10MB

#### Step 3: Isi Metadata

```
Judul: Orangutan Betina dan Anak di Ketambe
Deskripsi: 
Orangutan betina (usia 15 tahun) bersama anaknya (2 tahun) 
sedang mencari makan di tajuk pohon ara di kawasan Ketambe. 
Foto diambil pada Oktober 2024 saat monitoring rutin.

Terkait: Fauna - Orangutan Sumatera (ID: 5)
Status: in_review
```

#### Step 4: Simpan

### 7.3 Kategori Galeri yang Direkomendasikan

1. **Flora**: Foto spesies tumbuhan langka/endemik
2. **Fauna**: Foto satwa liar di habitat alami
3. **Landscape**: Pemandangan taman (air terjun, gunung, hutan)
4. **Aktivitas**: Dokumentasi kegiatan konservasi
5. **Masyarakat**: Interaksi masyarakat dengan konservasi

---

## 8. WORKFLOW APPROVAL

### 8.1 Untuk Regional Admin (Submitter)

#### Submit Data untuk Review

1. Pastikan data lengkap dan akurat
2. Set status → `in_review`
3. Klik **"Submit untuk Review"**
4. Tunggu notifikasi dari Super Admin

#### Jika Data Ditolak (Rejected)

1. Baca `rejection_reason` dari Super Admin
2. Edit data sesuai feedback
3. Perbaiki kesalahan
4. Submit ulang dengan status `in_review`

### 8.2 Untuk Super Admin (Reviewer/Approver)

#### Review Data Pending

1. Login sebagai Super Admin
2. Menu → **Review** atau filter status `in_review`
3. Lihat list data yang perlu direview

#### Evaluasi Data

**Checklist Review:**
- ☐ Nama ilmiah benar dan sesuai referensi
- ☐ Klasifikasi taksonomi akurat
- ☐ Deskripsi informatif (min 100-200 karakter)
- ☐ Status IUCN sesuai IUCN Red List terbaru
- ☐ Gambar berkualitas baik dan relevan
- ☐ Tidak ada typo atau kesalahan bahasa
- ☐ Data relasi benar (park_id, entity_id)

#### Approve Data

Jika data **LAYAK**:
1. Klik **"Approve"**
2. Sistem otomatis:
   - Status → `approved`
   - Set `approved_by` dan `approved_at`
   - Data tampil di website publik
3. Notifikasi otomatis ke submitter

#### Reject Data

Jika data **PERLU REVISI**:
1. Klik **"Reject"**
2. Isi **Alasan Penolakan** dengan jelas:
   ```
   Contoh feedback:
   1. Nama ilmiah salah: Harusnya "Pongo abelii" bukan "Pongo pygmaeus"
   2. Status IUCN perlu update ke CR (data 2024)
   3. Deskripsi terlalu singkat, tambah min 100 karakter
   4. Gambar blur, tolong upload gambar yang lebih jelas
   ```
3. Klik **"Confirm Reject"**
4. Sistem otomatis:
   - Status → `rejected`
   - Set `rejected_by`, `rejected_at`, `rejection_reason`
   - Kirim notifikasi ke submitter

---

## 9. REFERENSI & BEST PRACTICES

### 9.1 Sumber Data Taksonomi

**Website Referensi:**
- 🌐 **IUCN Red List**: https://www.iucnredlist.org (Status konservasi)
- 🌐 **Catalogue of Life**: https://www.catalogueoflife.org (Taksonomi)
- 🌐 **GBIF**: https://www.gbif.org (Data biodiversitas global)
- 🌐 **Plants of the World Online**: https://powo.science.kew.org (Flora)
- 🌐 **ITIS**: https://www.itis.gov (Taksonomi)

### 9.2 Format Penulisan Nama Ilmiah

✅ **BENAR:**
- *Pongo abelii* (Genus kapital, species kecil, italic)
- *Rafflesia arnoldii*
- *Panthera tigris sumatrae* (dengan subspecies)

❌ **SALAH:**
- Pongo abelii (tidak italic)
- pongo abelii (genus tidak kapital)
- PONGO ABELII (semua kapital)
- Pongo Abelii (species kapital)

### 9.3 Kriteria Foto Berkualitas

**Spesifikasi Teknis:**
- **Resolusi**: Min 1280x720px (HD), ideal 1920x1080px (Full HD)
- **Format**: JPG (foto), PNG (grafik/logo)
- **Ukuran File**: Max 5MB (flora/fauna), max 10MB (landscape/galeri)
- **Aspect Ratio**: 16:9 (landscape), 4:3 (dokumentasi), 1:1 (social media)

**Komposisi:**
- ✓ Subjek jelas dan fokus
- ✓ Pencahayaan natural yang baik
- ✓ Background tidak terlalu ramai
- ✓ Rule of thirds
- ✓ Menampilkan ciri khas spesies

**Content:**
- ✓ Foto di habitat alami (bukan kebun binatang)
- ✓ Posisi natural (tidak staging berlebihan)
- ✓ Bebas watermark (kecuali kredit fotografer)
- ✓ Resolusi tajam (tidak blur)

### 9.4 Konsistensi Data

**ID Lokal (local_id) - Format Rekomendasi:**

```
[KODE_TAMAN]-[KATEGORI]-[NOMOR]

Contoh:
- TNGL-FL-001  (TN Gunung Leuser - Flora - 001)
- TNGL-MAM-001 (TN Gunung Leuser - Mamalia - 001)
- TNKS-BIRD-045 (TN Kerinci Seblat - Burung - 045)
- TNBD-REPT-012 (TN Bromo Tengger Semeru - Reptil - 012)
```

**Kategori Fauna:**
- MAM - Mamalia
- BIRD - Aves (Burung)
- REPT - Reptilia
- AMPH - Amphibia
- FISH - Pisces
- INV - Invertebrata

### 9.5 Tips Produktivitas

#### Batch Input Data

Jika punya banyak data:
1. Siapkan Excel/spreadsheet dengan struktur yang sama dengan form
2. Verifikasi semua nama ilmiah terlebih dahulu
3. Download semua foto dan rename konsisten
4. Input secara batch (5-10 data per sesi)
5. Gunakan template description yang sudah dibuat

#### Template Deskripsi

Buat template untuk mempercepat:

```markdown
**Template Fauna:**
[Nama Lokal] ([Nama Ilmiah]) adalah [klasifikasi] yang [karakteristik unik]. 
Populasi liar diperkirakan [jumlah] individu dengan tren [naik/turun/stabil]. 
[Ancaman utama]. [Status konservasi].

Contoh:
Harimau Sumatera (Panthera tigris sumatrae) adalah subspesies harimau 
terkecil yang masih hidup. Populasi liar diperkirakan 400-600 individu 
dengan tren menurun. Terancam oleh perburuan liar dan hilangnya habitat. 
Status IUCN: Critically Endangered (CR).
```

### 9.6 Validasi Data Sebelum Submit

**Pre-Submit Checklist:**

Flora/Fauna:
- ☐ Nama ilmiah benar (cek 2 sumber independen)
- ☐ Status IUCN terbaru (cek tahun assessment)
- ☐ Deskripsi min 100 karakter, informatif
- ☐ Gambar berkualitas HD
- ☐ park_id sesuai dengan distribusi alami
- ☐ Tidak ada typo

Taman:
- ☐ Nama resmi sesuai SK penetapan
- ☐ Koordinat benar (cek Google Maps)
- ☐ Luas sesuai dokumen resmi
- ☐ Deskripsi min 200 karakter
- ☐ Visi-misi tersedia

Aktivitas:
- ☐ Tanggal benar
- ☐ Lokasi spesifik
- ☐ Deskripsi jelas (5W1H)
- ☐ Foto dokumentasi tersedia

---

## 10. FAQ & TROUBLESHOOTING

### Q1: Bagaimana jika lupa password?

**A:** Klik "Forgot Password" di halaman login → Masukkan email → Cek email untuk reset link

### Q2: Regional Admin bisa akses data taman lain?

**A:** Tidak. Regional Admin hanya bisa akses dan edit data taman yang di-assign (`park_id` mereka).

### Q3: Bisa edit data yang sudah approved?

**A:** Bisa, tapi data akan kembali ke status `draft` atau `in_review` dan perlu approval ulang.

### Q4: Bagaimana menghapus data?

**A:** Sistem menggunakan **soft delete** (data tidak benar-benar dihapus). Klik "Hapus" → Confirm → Data disembunyikan (dapat direstore oleh Super Admin).

### Q5: Nama ilmiah berubah (synonyms)?

**A:** Gunakan nama ilmiah yang **currently accepted** sesuai Catalogue of Life atau IUCN. Jika ada perubahan taksonomi, update dengan catatan di deskripsi.

**Contoh:**
```
Nama ilmiah: Pongo abelii
Deskripsi: ... (Sebelumnya dikenal sebagai Pongo pygmaeus abelii 
hingga 2001, kini diakui sebagai spesies terpisah) ...
```

### Q6: Status IUCN berbeda di beberapa sumber?

**A:** Gunakan **IUCN Red List** sebagai sumber utama (https://www.iucnredlist.org). Catat tahun assessment.

### Q7: Upload gambar gagal terus?

**A:** Pastikan:
- Ukuran < 5MB (kompres jika perlu)
- Format JPG atau PNG
- Resolusi tidak terlalu besar (max 4000x3000px)
- Koneksi internet stabil

### Q8: Bagaimana jika flora/fauna ditemukan di beberapa taman?

**A:** Buat entry terpisah untuk setiap taman dengan `park_id` yang berbeda. Setiap taman punya data flora/fauna sendiri.

---

## 11. CONTACT SUPPORT

### Technical Support
- **Email**: support@tamankehati.id
- **WhatsApp**: +62-XXX-XXXX-XXXX
- **Jam Kerja**: Senin-Jumat, 08:00-17:00 WIB

### Data Verification
- **Email**: data@tamankehati.id
- **Konsultasi Taksonomi**: taxonomy@tamankehati.id

### Training & Onboarding
- **Email**: training@tamankehati.id
- **Request Pelatihan**: https://forms.tamankehati.id/training

---

## 12. CHANGELOG

| Versi | Tanggal | Perubahan | Oleh |
|-------|---------|-----------|------|
| 1.0 | 2024-10-29 | Dokumen awal SOP lengkap | System |

---

## LAMPIRAN: QUICK REFERENCE CARD

```
╔══════════════════════════════════════════════════════════════╗
║             QUICK REFERENCE - TAMAN KEHATI                   ║
╠══════════════════════════════════════════════════════════════╣
║  WORKFLOW: draft → in_review → approved/rejected             ║
║                                                              ║
║  ROLES:                                                      ║
║  • Super Admin: Kelola semua, approve semua                 ║
║  • Regional Admin: Kelola 1 taman, submit untuk approval    ║
║                                                              ║
║  DATA WAJIB:                                                 ║
║  ✓ Taman: name, slug                                        ║
║  ✓ Flora/Fauna: park_id, local_name, scientific_name        ║
║  ✓ Aktivitas: park_id, title, activity_date                 ║
║  ✓ Galeri: title, image_url                                 ║
║                                                              ║
║  IUCN STATUS: EX > EW > CR > EN > VU > NT > LC | DD | NE    ║
║               (Punah → Kritis → Aman)                        ║
║                                                              ║
║  FOTO:                                                       ║
║  • Min: 1280x720px (HD)                                     ║
║  • Format: JPG/PNG                                           ║
║  • Max: 5MB (thumbnail), 10MB (galeri)                      ║
║                                                              ║
║  REFERENSI:                                                  ║
║  • IUCN Red List: iucnredlist.org                           ║
║  • Catalogue of Life: catalogueoflife.org                   ║
║  • GBIF: gbif.org                                           ║
║                                                              ║
║  SUPPORT: support@tamankehati.id                            ║
╚══════════════════════════════════════════════════════════════╝
```

---

**🌿 AKHIR DOKUMEN SOP 🌿**

*Terima kasih telah berkontribusi dalam pelestarian keanekaragaman hayati Indonesia!*


