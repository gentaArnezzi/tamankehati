# 📋 STANDARD OPERATING PROCEDURE (SOP)
## INPUT DATA TAMAN KEHATI INDONESIA

**Versi:** 2.0  
**Tanggal:** Oktober 2025  
**Untuk:** Regional Admin (Admin Taman Kehati)  
**Platform:** Sistem Informasi Taman Kehati Indonesia

---

## 📌 DAFTAR ISI

1. [Pendahuluan](#pendahuluan)
2. [Akses Sistem](#akses-sistem)
3. [Input Data Flora](#input-data-flora)
4. [Input Data Fauna](#input-data-fauna)
5. [Input Data Kegiatan](#input-data-kegiatan)
6. [Pengelolaan Gambar](#pengelolaan-gambar)
7. [Status & Approval](#status--approval)
8. [Tips & Best Practices](#tips--best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Kontak Support](#kontak-support)

---

## 📖 PENDAHULUAN

### Tujuan SOP
Dokumen ini adalah panduan lengkap untuk Regional Admin dalam melakukan input dan pengelolaan data keanekaragaman hayati di Taman Kehati yang menjadi tanggung jawab Anda.

### Peran Regional Admin
- ✅ Menginput data flora di taman kehati
- ✅ Menginput data fauna di taman kehati
- ✅ Mendokumentasikan kegiatan konservasi
- ✅ Mengelola foto/dokumentasi
- ⚠️ Data yang Anda input akan melalui **proses approval** oleh Super Admin

### Status Data
| Status | Deskripsi |
|--------|-----------|
| **Draft** | Data tersimpan tapi belum disubmit |
| **In Review** | Data sudah disubmit, menunggu approval |
| **Approved** | Data disetujui, tampil di publik |
| **Rejected** | Data ditolak, perlu revisi |

---

## 🔐 AKSES SISTEM

### Login ke Dashboard

1. **Buka Browser**
   - Chrome, Firefox, Safari, atau Edge (versi terbaru)
   - Pastikan koneksi internet stabil

2. **Akses URL Dashboard**
   ```
   https://tamankehati.id/dashboard
   ```

3. **Login dengan Kredensial**
   - **Email:** Email yang terdaftar sebagai regional admin
   - **Password:** Password yang diberikan oleh Super Admin
   - Klik tombol **"Masuk"**

4. **Verifikasi Role**
   - Setelah login, pastikan role Anda adalah **"Regional Admin"**
   - Anda akan melihat nama taman yang Anda kelola

### Logout
- Klik nama/avatar di pojok kanan atas
- Pilih **"Logout"**
- Selalu logout jika menggunakan komputer bersama

---

## 🌿 INPUT DATA FLORA

### Persiapan Data Flora

Sebelum mulai input, siapkan informasi berikut:

#### **Data Wajib** ⭐
- [ ] Nama ilmiah (scientific name)
- [ ] Nama umum (common name)
- [ ] Famili (family)
- [ ] Foto utama (minimal 1)

#### **Data Opsional** (Sangat Direkomendasikan)
- [ ] Genus
- [ ] Sinonim
- [ ] Status IUCN (CR, EN, VU, NT, LC, DD, NE)
- [ ] Status endemik (Ya/Tidak)
- [ ] Deskripsi umum
- [ ] Morfologi (bentuk, ukuran, ciri khas)
- [ ] Habitat
- [ ] Manfaat
- [ ] Penyebaran geografis
- [ ] Metode perbanyakan
- [ ] Waktu berbunga
- [ ] Referensi/sumber data

#### **Dokumentasi Foto Detail** 📸
- [ ] Gambar daun (pertelaan daun)
- [ ] Gambar batang
- [ ] Gambar bunga
- [ ] Gambar buah

---

### Langkah-langkah Input Flora

#### **STEP 1: Akses Form Input**

1. Dari dashboard, klik menu **"Flora"** di sidebar kiri
2. Klik tombol **"+ Tambah Flora"** (tombol hijau di kanan atas)
3. Form input akan terbuka

#### **STEP 2: Informasi Taksonomi**

**Nama Ilmiah** ⭐ (WAJIB)
```
Format: Genus species author
Contoh: Rafflesia arnoldii R.Br.
Tips: 
- Gunakan huruf kapital untuk Genus
- Huruf kecil untuk species
- Italic TIDAK perlu (sistem otomatis)
```

**Nama Umum** ⭐ (WAJIB)
```
Contoh: Bunga Bangkai Raksasa
Tips: Gunakan nama yang umum dikenal masyarakat
```

**Famili** ⭐ (WAJIB)
```
Contoh: Rafflesiaceae
Tips: Huruf kapital di awal
```

**Genus** (Opsional)
```
Contoh: Rafflesia
```

**Sinonim** (Opsional)
```
Format: Nama ilmiah lain yang pernah digunakan
Contoh: Rafflesia titan Jack
Tips: Pisahkan dengan koma jika lebih dari 1
```

#### **STEP 3: Status Konservasi**

**Status IUCN** (Red List)
Pilih salah satu dari dropdown:

| Kode | Nama | Keterangan |
|------|------|------------|
| **CR** | Critically Endangered | Kritis - Terancam Punah |
| **EN** | Endangered | Genting - Sangat Terancam |
| **VU** | Vulnerable | Rentan |
| **NT** | Near Threatened | Hampir Terancam |
| **LC** | Least Concern | Risiko Rendah |
| **DD** | Data Deficient | Data Kurang |
| **NE** | Not Evaluated | Belum Dievaluasi |

**Tips Memilih Status IUCN:**
- Cek di IUCN Red List: https://www.iucnredlist.org/
- Jika tidak ada di IUCN, pilih **"NE" (Not Evaluated)**
- Jangan menebak-nebak status!

**Status Endemik**
- ✅ **Centang** jika spesies HANYA ada di Indonesia
- ❌ **Tidak centang** jika ada juga di negara lain

```
Contoh Endemik Indonesia:
✓ Rafflesia arnoldii (hanya di Sumatera)
✓ Anggrek Hitam (hanya di Kalimantan)
✗ Kelapa (Cocos nucifera) - ada di seluruh dunia
```

#### **STEP 4: Deskripsi & Informasi Detail**

**Deskripsi Umum** (Textarea)
```
Minimal 100 kata
Jelaskan:
- Penampilan umum tanaman
- Habitat alami
- Keunikan spesies
- Kondisi di taman kehati Anda

Contoh:
"Rafflesia arnoldii adalah bunga terbesar di dunia dengan 
diameter hingga 1 meter. Bunga ini tidak memiliki daun, 
batang, atau akar yang terlihat. Tumbuhan ini hidup sebagai 
parasit pada liana Tetrastigma. Di Taman Kehati Bengkulu, 
kami memiliki 5 individu yang aktif berbunga..."
```

**Morfologi** (Textarea)
```
Jelaskan ciri-ciri fisik:
- Ukuran (tinggi, diameter)
- Bentuk daun, bunga, buah
- Warna khas
- Tekstur
- Aroma (jika ada)

Contoh:
"Daun berbentuk bulat telur dengan panjang 10-15 cm, 
tepi daun bergerigi, permukaan atas mengkilap. Bunga 
majemuk berwarna merah muda dengan diameter 3-4 cm..."
```

**Habitat** (Textarea)
```
Jelaskan kondisi habitat:
- Ketinggian (mdpl)
- Jenis tanah
- Curah hujan
- Suhu
- Kelembaban
- Naungan

Contoh:
"Tumbuh di hutan hujan tropis pada ketinggian 500-1000 mdpl. 
Memerlukan kelembaban tinggi >80% dan naungan 50-70%. 
Tumbuh optimal pada suhu 20-28°C..."
```

**Manfaat** (Textarea)
```
Jelaskan kegunaan:
- Ekologi (fungsi dalam ekosistem)
- Ekonomi (nilai jual, produk)
- Sosial budaya (tradisi, kepercayaan)
- Medis (obat tradisional)

Contoh:
"Ekologi: Sumber nektar untuk lebah hutan
Ekonomi: Biji dapat dijual sebagai bibit
Budaya: Digunakan dalam upacara adat
Medis: Daun untuk obat demam tradisional"
```

**Penyebaran** (Textarea)
```
Jelaskan distribusi geografis:
- Provinsi/kabupaten
- Tipe habitat
- Populasi (jika diketahui)

Contoh:
"Tersebar di Sumatera Barat, Bengkulu, dan Lampung. 
Ditemukan di hutan primer dan sekunder. Populasi 
diperkirakan <500 individu dewasa di alam."
```

**Metode Perbanyakan** (Textarea)
```
Jelaskan cara reproduksi/perbanyakan:
- Generatif (biji)
- Vegetatif (stek, cangkok, dll)
- Tips pembibitan

Contoh:
"Perbanyakan generatif: Biji disemai di media pasir + kompost
Perkecambahan 2-3 minggu. Perbanyakan vegetatif: Stek batang
dengan panjang 15-20 cm, celup hormon perakaran..."
```

**Waktu Berbunga** (Text Input)
```
Format: Bulan atau musim
Contoh:
- "Januari - Maret"
- "Musim hujan"
- "Sepanjang tahun"
```

**Referensi** (Textarea)
```
Cantumkan sumber informasi:
- Buku/jurnal ilmiah
- Website kredibel
- Peneliti/ahli yang dikonsultasi

Contoh:
"1. Smith, J. (2020). Flora of Sumatra. Oxford Press.
2. IUCN Red List (2023). Rafflesia arnoldii assessment.
3. Konsultasi dengan Dr. Budi Santoso (Botani LIPI)"
```

#### **STEP 5: Upload Foto**

**Gambar Utama** ⭐ (WAJIB)
- Klik area **"Upload Gambar Utama"**
- Pilih file foto terbaik
- **Format:** JPG, JPEG, PNG
- **Ukuran maksimal:** 5 MB
- **Resolusi minimal:** 1024x768px
- **Tips:** Foto close-up yang jelas, fokus tajam

**Foto Detail (Opsional tapi Sangat Direkomendasikan)**

1. **Gambar Daun (Pertelaan Daun)**
   - Close-up daun tunggal
   - Tunjukkan bentuk, tepi, pertulangan
   - Background netral lebih baik

2. **Gambar Batang**
   - Foto batang/trunk
   - Tunjukkan tekstur kulit kayu
   - Bisa sertakan ukuran untuk skala

3. **Gambar Bunga**
   - Foto bunga mekar sempurna
   - Tunjukkan detail mahkota, benang sari
   - Multiple angle jika perlu (upload yang terbaik)

4. **Gambar Buah**
   - Foto buah matang
   - Tunjukkan bentuk, ukuran, warna
   - Bisa sertakan buah terbuka (tampak biji)

**Tips Fotografi:**
- ✅ Pencahayaan alami (pagi atau sore)
- ✅ Fokus tajam pada subjek
- ✅ Background sederhana/blur
- ✅ Sertakan skala (penggaris/koin) jika perlu
- ❌ Hindari foto blur/gelap
- ❌ Jangan watermark atau logo

#### **STEP 6: Review & Submit**

1. **Review Semua Data**
   - Scroll form dari atas ke bawah
   - Periksa ejaan nama ilmiah
   - Pastikan semua data wajib terisi
   - Cek kualitas foto

2. **Simpan sebagai Draft** (Opsional)
   - Klik tombol **"Simpan Draft"** jika belum siap submit
   - Data tersimpan, bisa dilanjutkan nanti
   - Status: **Draft**

3. **Submit untuk Review**
   - Klik tombol **"Submit untuk Review"**
   - Data terkirim ke Super Admin
   - Status berubah: **In Review**
   - Anda akan dapat notifikasi jika diapprove/reject

---

## 🦅 INPUT DATA FAUNA

### Persiapan Data Fauna

#### **Data Wajib** ⭐
- [ ] Nama ilmiah (scientific name)
- [ ] Nama umum (common name)
- [ ] Famili (family)
- [ ] Foto utama (minimal 1)

#### **Data Opsional** (Sangat Direkomendasikan)
- [ ] Genus
- [ ] Status IUCN
- [ ] Status endemik
- [ ] Deskripsi
- [ ] Habitat
- [ ] Pakan (diet)
- [ ] Perilaku
- [ ] Reproduksi
- [ ] Status populasi
- [ ] Ancaman
- [ ] Upaya konservasi
- [ ] Referensi

---

### Langkah-langkah Input Fauna

#### **STEP 1: Akses Form Input**

1. Klik menu **"Fauna"** di sidebar
2. Klik tombol **"+ Tambah Fauna"**
3. Form input fauna akan terbuka

#### **STEP 2: Informasi Taksonomi**

**Nama Ilmiah** ⭐
```
Format: Genus species author
Contoh: Pongo abelii Lesson, 1827
Tips: Sama seperti flora, Genus kapital, species kecil
```

**Nama Umum** ⭐
```
Contoh: Orangutan Sumatera
Tips: Nama Indonesia yang umum digunakan
```

**Famili** ⭐
```
Contoh: Hominidae
```

**Genus**
```
Contoh: Pongo
```

#### **STEP 3: Status Konservasi**

**Status IUCN** (Sama seperti Flora)
- Cek di: https://www.iucnredlist.org/
- Pilih dari dropdown: CR, EN, VU, NT, LC, DD, NE

**Status Endemik**
- Centang jika spesies hanya ada di Indonesia

```
Contoh Fauna Endemik Indonesia:
✓ Komodo (Varanus komodoensis)
✓ Burung Cenderawasih
✓ Anoa
✗ Harimau (juga ada di Asia lainnya)
```

#### **STEP 4: Informasi Detail Fauna**

**Deskripsi** (Textarea)
```
Minimal 100 kata
Jelaskan:
- Penampilan fisik
- Ukuran & berat
- Ciri khas
- Habitat
- Kondisi di taman kehati

Contoh:
"Orangutan Sumatera adalah kera besar dengan bulu 
berwarna merah kecoklatan. Jantan dewasa memiliki 
berat 50-90 kg dengan tinggi 1.4m. Ciri khas: 
pipi gembung (flanges) pada jantan dewasa. 
Di Taman Kehati kami, terdapat 2 individu betina..."
```

**Habitat** (Textarea)
```
Jelaskan:
- Tipe habitat (hutan, savana, dll)
- Ketinggian
- Home range
- Preferensi mikrohabitat

Contoh:
"Hidup di hutan hujan tropis dataran rendah hingga 
pegunungan (0-1500 mdpl). Menghabiskan 90% waktu 
di kanopi pohon. Memerlukan pohon besar untuk sarang..."
```

**Pakan** (Textarea)
```
Jelaskan diet & kebiasaan makan:
- Jenis makanan utama
- Makanan tambahan
- Waktu makan
- Cara mencari makan

Contoh:
"Herbivora/frugivora. Makanan utama: buah-buahan (60%)
terutama buah ara (Ficus). Makanan tambahan: daun muda,
kulit kayu, serangga. Aktif mencari makan pagi dan sore."
```

**Perilaku** (Textarea)
```
Jelaskan tingkah laku:
- Sosial (soliter/berkelompok)
- Aktivitas harian
- Komunikasi
- Wilayah/teritorial

Contoh:
"Semi-soliter. Betina dengan anak sering bersama. 
Jantan dewasa hidup sendiri. Aktif siang hari (diurnal).
Komunikasi dengan vokalisasi 'long call' yang terdengar
hingga 1 km..."
```

**Reproduksi** (Textarea)
```
Jelaskan pola reproduksi:
- Musim kawin
- Masa gestasi
- Jumlah anak
- Interval kelahiran
- Parental care

Contoh:
"Tidak ada musim kawin spesifik. Masa kehamilan 8-9 bulan.
Melahirkan 1 anak per kelahiran. Interval kelahiran 6-8 tahun
(terlama di antara mamalia). Induk merawat anak hingga 7 tahun."
```

**Status Populasi** (Textarea)
```
Jelaskan kondisi populasi:
- Estimasi jumlah
- Tren populasi
- Sebaran geografis

Contoh:
"Populasi global: ~14,000 individu (IUCN 2023).
Tren: Menurun 80% dalam 75 tahun terakhir.
Tersebar di Sumatera Utara dan Aceh. Di taman kehati:
2 individu (semi-wild)."
```

**Ancaman** (Textarea)
```
Jelaskan ancaman terhadap spesies:
- Hilang habitat
- Perburuan
- Perdagangan ilegal
- Konflik manusia-satwa
- Penyakit
- Climate change

Contoh:
"Ancaman utama:
1. Deforestasi untuk kelapa sawit & logging
2. Perburuan untuk perdagangan illegal pet
3. Fragmentasi habitat
4. Konflik dengan petani
5. Penyakit dari manusia/hewan domestik"
```

**Upaya Konservasi** (Textarea)
```
Jelaskan upaya pelestarian:
- Program breeding
- Restorasi habitat
- Patroli anti-perburuan
- Edukasi masyarakat
- Penelitian

Contoh:
"Program konservasi di taman kehati:
1. Rehabilitasi individu dari sitaan
2. Penanaman pohon pakan (200 pohon/tahun)
3. Patroli rutin dengan masyarakat
4. Program edukasi sekolah (50 sekolah)
5. Monitoring populasi dengan camera trap"
```

**Referensi**
```
Sama seperti flora, cantumkan sumber:
"1. IUCN Red List (2023). Pongo abelii assessment.
2. Wich et al. (2016). Orangutans: Geographic Variation...
3. Data monitoring internal Taman Kehati (2023-2024)"
```

#### **STEP 5: Upload Foto Fauna**

**Gambar Utama** ⭐ (WAJIB)
- Foto fauna yang jelas & berkualitas
- Format: JPG, JPEG, PNG (max 5MB)
- Tips: Foto close-up atau medium shot
- Pastikan identitas spesies jelas

**Tips Foto Fauna:**
- ✅ Natural lighting
- ✅ Fokus pada mata/wajah
- ✅ Tunjukkan ciri khas spesies
- ✅ Foto dalam habitat asli lebih baik
- ❌ Hindari flash yang mengganggu
- ❌ Jangan paksa pose yang stress hewan

#### **STEP 6: Review & Submit**

Sama seperti flora:
1. Review semua data
2. Simpan Draft (jika belum siap)
3. Submit untuk Review

---

## 🎯 INPUT DATA KEGIATAN

### Jenis Kegiatan yang Bisa Diinput

- 🌱 Penanaman pohon
- 🔬 Penelitian/survey
- 📚 Edukasi lingkungan
- 🚨 Patroli/monitoring
- 🤝 Kegiatan dengan masyarakat
- 🏗️ Pembangunan infrastruktur
- 🎉 Event/workshop
- 📊 Pelatihan

### Langkah Input Kegiatan

#### **STEP 1: Akses Form**
1. Klik menu **"Kegiatan"** di sidebar
2. Klik tombol **"+ Tambah Kegiatan"**

#### **STEP 2: Informasi Kegiatan**

**Nama Kegiatan** ⭐
```
Contoh: "Penanaman 500 Pohon Endemik Sumatera"
Tips: Singkat, jelas, spesifik
```

**Tanggal** ⭐
```
Format: DD/MM/YYYY
Pilih dari date picker
```

**Lokasi** ⭐
```
Contoh: "Zona Konservasi A, Taman Kehati Kerinci"
Tips: Spesifik dengan koordinat jika ada
```

**Kategori Kegiatan** ⭐
```
Pilih dari dropdown:
- Konservasi
- Penelitian
- Edukasi
- Monitoring
- Community Development
- Lainnya
```

**Jumlah Peserta**
```
Angka integer
Contoh: 45
```

**Deskripsi Kegiatan** ⭐
```
Minimal 200 kata
Jelaskan:
- Latar belakang
- Tujuan
- Metode/proses
- Hasil
- Kendala (jika ada)
- Rencana tindak lanjut

Contoh:
"Kegiatan penanaman 500 pohon endemik dilaksanakan 
dalam rangka memperingati Hari Lingkungan Hidup. 
Tujuan: Restorasi area yang terdampak kebakaran 2022.

Spesies yang ditanam:
- Damar (Agathis dammara): 200 pohon
- Meranti (Shorea spp.): 150 pohon
- Jelutung (Dyera costulata): 150 pohon

Peserta: Staf taman (15 orang), mahasiswa (20 orang),
masyarakat desa (10 orang).

Hasil: 500 pohon tertanam di area 2 ha. Survival rate
akan dimonitor setiap bulan.

Kendala: Cuaca hujan menunda kegiatan 1 hari.

Tindak lanjut: Pemeliharaan rutin setiap 2 minggu,
monitoring pertumbuhan setiap bulan."
```

**Foto Kegiatan**
- Upload 1-5 foto dokumentasi
- Foto: peserta, proses, hasil
- Max 5MB per foto

**Mitra/Kolaborator** (Opsional)
```
Contoh: "WWF Indonesia, Dinas Kehutanan Provinsi, 
Universitas Jambi, Kelompok Tani Lestari"
```

#### **STEP 3: Submit**
- Review data
- Klik **"Submit Kegiatan"**
- Status: **In Review**

---

## 📸 PENGELOLAAN GAMBAR

### Standar Foto yang Baik

#### **Teknis**
- ✅ **Resolusi:** Minimal 1024x768px (landscape) atau 768x1024px (portrait)
- ✅ **Format:** JPG, JPEG, PNG
- ✅ **Ukuran file:** Maksimal 5MB
- ✅ **Aspect ratio:** 4:3 atau 3:4 ideal
- ✅ **Fokus:** Tajam, tidak blur
- ✅ **Exposure:** Tidak overexposed/underexposed
- ✅ **White balance:** Warna natural

#### **Komposisi**
- ✅ Subject jelas & dominan
- ✅ Background sederhana/tidak mengganggu
- ✅ Rule of thirds (subjek tidak di tengah sempurna)
- ✅ Sertakan skala jika perlu (untuk flora)
- ✅ Multiple angle untuk dokumentasi lengkap

#### **Etika Fotografi Satwa**
- ❌ JANGAN gunakan flash pada satwa nokturnal
- ❌ JANGAN ganggu/stress satwa untuk foto
- ❌ JANGAN dekati sarang/anak satwa
- ❌ JANGAN beri pakan untuk menarik satwa
- ✅ Gunakan telephoto lens untuk satwa liar
- ✅ Hormati jarak aman
- ✅ Foto di habitat alami

### Penamaan File Foto

**Format yang Direkomendasikan:**
```
[Jenis]_[NamaIlmiah]_[Bagian]_[Tanggal].[ext]

Contoh Flora:
Flora_Rafflesia_arnoldii_Bunga_20241028.jpg
Flora_Rafflesia_arnoldii_Daun_20241028.jpg

Contoh Fauna:
Fauna_Pongo_abelii_Portrait_20241028.jpg
Fauna_Pongo_abelii_Feeding_20241028.jpg

Contoh Kegiatan:
Activity_Penanaman_Proses_20241028.jpg
Activity_Penanaman_Peserta_20241028.jpg
```

### Edit Foto (Diperbolehkan)

**Editing Minimal yang Boleh:**
- ✅ Crop untuk komposisi lebih baik
- ✅ Adjust brightness/contrast minimal
- ✅ Sharpening tipis
- ✅ White balance correction
- ✅ Remove noise ringan

**Editing yang TIDAK Boleh:**
- ❌ Filter warna dramatis
- ❌ Manipulasi/photoshop subjek
- ❌ Tambah/hapus elemen
- ❌ Over-saturation
- ❌ Watermark/logo/text
- ❌ HDR berlebihan

---

## ✅ STATUS & APPROVAL

### Alur Status Data

```
┌─────────┐    Submit    ┌────────────┐    Approve    ┌──────────┐
│  DRAFT  │─────────────>│ IN REVIEW  │──────────────>│ APPROVED │
└─────────┘              └────────────┘               └──────────┘
     ^                          │                            │
     │                          │ Reject                     │
     │                          v                            │
     │                    ┌──────────┐                       │
     └────────────────────│ REJECTED │                       │
         Revisi & Submit  └──────────┘                       │
                                                              │
                          ┌──────────┐                       │
                          │ DELETED  │<──────────────────────┘
                          └──────────┘    Hapus oleh Admin
```

### Status Draft
- **Akses:** Hanya Anda yang bisa lihat
- **Edit:** Bisa diedit kapan saja
- **Public:** TIDAK tampil di publik
- **Tips:** Gunakan draft untuk data yang belum lengkap

### Status In Review
- **Akses:** Anda & Super Admin
- **Edit:** TIDAK bisa diedit
- **Public:** TIDAK tampil di publik
- **Notifikasi:** Anda akan dapat email jika ada keputusan
- **Waktu review:** Maksimal 3 hari kerja

### Status Approved
- **Akses:** Public (semua orang)
- **Edit:** Bisa request edit ke Super Admin
- **Public:** ✅ Tampil di website publik
- **Dashboard:** ✅ Masuk statistik publik
- **Indeks:** ✅ Tercatat di Indeks Kehati Indonesia

### Status Rejected
- **Alasan:** Super Admin akan berikan alasan reject
- **Notifikasi:** Anda dapat email dengan feedback
- **Action:** Perbaiki data sesuai feedback
- **Re-submit:** Bisa submit ulang setelah revisi
- **Tips:** Baca feedback dengan teliti, perbaiki dengan lengkap

---

## 💡 TIPS & BEST PRACTICES

### Tips Umum Input Data

1. **Persiapan Matang**
   - Siapkan semua data sebelum mulai input
   - Riset terlebih dahulu untuk data yang kurang
   - Konsultasi ahli jika diperlukan

2. **Akurasi Data**
   - Double-check nama ilmiah (gunakan database kredibel)
   - Verifikasi status IUCN
   - Pastikan foto sesuai dengan spesies

3. **Kelengkapan**
   - Isi semua field yang tersedia
   - Data lengkap = approval lebih cepat
   - Data lengkap = lebih valuable untuk riset

4. **Konsistensi**
   - Gunakan format yang sama untuk semua entry
   - Standarisasi penamaan file
   - Konsisten dalam penulisan lokasi

5. **Backup Data**
   - Save Draft secara berkala
   - Simpan copy data di local (Excel/docs)
   - Backup foto original di hard drive

### Sumber Data Kredibel

#### **Flora**
- 🌐 The Plant List: http://www.theplantlist.org/
- 🌐 POWO (Kew): https://powo.science.kew.org/
- 🌐 Tropicos: https://tropicos.org/
- 📚 Flora Malesiana
- 📚 Flora of Java/Sumatra/Kalimantan (sesuai region)

#### **Fauna**
- 🌐 IUCN Red List: https://www.iucnredlist.org/
- 🌐 Catalogue of Life: https://www.catalogueoflife.org/
- 🌐 Avibase (burung): https://avibase.bsc-eoc.org/
- 🌐 Amphibian Species of the World: https://amphibiansoftheworld.amnh.org/
- 📚 Mammals of Indonesia (Payne & Francis)

#### **Status Konservasi**
- 🌐 IUCN Red List: https://www.iucnredlist.org/
- 🌐 CITES: https://www.cites.org/
- 📜 Permen LHK (untuk status Indonesia)

### Kolaborasi Tim

- 💬 Koordinasi dengan tim lapangan untuk data terbaru
- 👥 Konsultasi dengan botanist/zoologist lokal
- 📋 Buat checklist bersama untuk data yang perlu dikoleksi
- 📅 Schedule rutin untuk input data (misal: setiap Jumat)

---

## 🔧 TROUBLESHOOTING

### Masalah Umum & Solusi

#### **1. Tidak Bisa Login**

**Gejala:** Password ditolak atau "Invalid credentials"

**Solusi:**
- Pastikan email & password benar (cek CAPS LOCK)
- Clear browser cache & cookies
- Coba browser lain (Chrome, Firefox)
- Reset password via "Lupa Password"
- Hubungi Super Admin jika masih gagal

#### **2. Upload Foto Gagal**

**Gejala:** Error "File too large" atau gagal upload

**Solusi:**
- Cek ukuran file (max 5MB)
- Compress foto dengan tools online:
  - TinyPNG: https://tinypng.com/
  - Compressor.io: https://compressor.io/
- Cek format file (harus JPG/JPEG/PNG)
- Pastikan koneksi internet stabil
- Refresh halaman dan coba lagi

#### **3. Form Tidak Tersimpan**

**Gejala:** Data hilang saat klik Save atau Submit

**Solusi:**
- Jangan close browser saat menyimpan
- Klik "Simpan Draft" sebelum meninggalkan halaman
- Copy data penting ke notepad saat input
- Cek koneksi internet
- Report ke technical support jika berulang

#### **4. Foto Tidak Muncul di Preview**

**Gejala:** Setelah upload, foto tidak tampil

**Solusi:**
- Wait beberapa detik (loading)
- Refresh halaman
- Re-upload foto
- Cek format & ukuran file
- Clear browser cache

#### **5. Data Ditolak (Rejected)**

**Gejala:** Data berubah status dari "In Review" ke "Rejected"

**Solusi:**
- Cek email untuk feedback dari Super Admin
- Baca alasan penolakan dengan teliti
- Perbaiki sesuai feedback
- Re-submit setelah revisi
- Hubungi Super Admin jika feedback tidak jelas

#### **6. Tidak Dapat Notifikasi Email**

**Gejala:** Tidak terima email approval/rejection

**Solusi:**
- Cek folder SPAM/Junk
- Cek email terdaftar sudah benar
- Whitelist email: noreply@tamankehati.id
- Update email di profil jika salah
- Hubungi IT support

#### **7. Dashboard Lambat/Loading Lama**

**Gejala:** Website loading sangat lambat

**Solusi:**
- Cek koneksi internet (min 1 Mbps)
- Clear browser cache
- Close tab browser lain yang tidak perlu
- Coba akses di jam non-peak (pagi atau malam)
- Update browser ke versi terbaru
- Gunakan mode incognito/private

#### **8. Data Duplikat**

**Gejala:** Tidak sengaja input data yang sama 2x

**Solusi:**
- Jangan panic, data bisa dihapus
- Contact Super Admin untuk hapus duplikat
- Sertakan ID data yang mau dihapus
- Preventif: Cek existing data sebelum input

---

## 📞 KONTAK SUPPORT

### Tim Support Taman Kehati Indonesia

#### **Technical Support**
- 📧 Email: support@tamankehati.id
- ⏰ Response time: 1 x 24 jam (hari kerja)
- 📱 WhatsApp: +62 812-XXXX-XXXX (khusus urgent)

#### **Super Admin**
- 📧 Email: admin@tamankehati.id
- 📋 Untuk: Pertanyaan terkait approval, kebijakan data

#### **Content Moderation**
- 📧 Email: content@tamankehati.id
- 📋 Untuk: Pertanyaan tentang standar konten

#### **Jam Operasional**
- 🕐 Senin - Jumat: 08:00 - 17:00 WIB
- 🚫 Sabtu - Minggu: Libur
- ⚡ Urgent/emergency: WhatsApp support

### Format Laporan Masalah

Ketika menghubungi support, sertakan informasi:

```
Subject: [Masalah] - [Nama Taman]

Konten Email:
1. Nama Lengkap:
2. Taman Kehati:
3. Role: Regional Admin
4. Jenis Masalah:
5. Deskripsi Detail:
   - Apa yang Anda lakukan?
   - Apa yang terjadi?
   - Error message (jika ada)?
6. Screenshot (jika ada)
7. Browser & Device:
8. Waktu kejadian:
```

**Contoh:**
```
Subject: Upload Foto Gagal - Taman Kehati Kerinci

Nama: Budi Santoso
Taman: Taman Kehati Kerinci
Role: Regional Admin
Masalah: Upload foto flora gagal terus

Detail:
- Saya coba upload foto Rafflesia arnoldii
- Setiap kali klik upload, muncul error
- Error message: "Failed to upload image"
- Sudah coba 5x, tetap gagal
- Ukuran file: 2.3 MB (JPG)
- Browser: Chrome 118
- Device: Laptop Windows 11
- Waktu: 28 Oktober 2024, 14:30 WIB

Screenshot terlampir.
```

---

## 📊 MONITORING PROGRESS ANDA

### Dashboard Statistik Regional Admin

Di dashboard Anda, bisa monitor:

- 📈 **Total data yang diinput**
  - Flora: XX
  - Fauna: XX
  - Kegiatan: XX

- ⏳ **Status data**
  - Draft: XX
  - In Review: XX
  - Approved: XX
  - Rejected: XX

- 📅 **Recent activities**
  - 10 aktivitas terakhir

- 🎯 **Target bulanan**
  - Progress input data vs target

### Tips Mencapai Target

1. **Buat Schedule Rutin**
   - Input data setiap Jumat sore
   - Review draft setiap Senin pagi
   - Submit batch setiap minggu

2. **Set Milestone**
   - Target: 10 flora/bulan
   - Target: 5 fauna/bulan
   - Target: 2 kegiatan/bulan

3. **Kolaborasi Tim**
   - Assign task ke field team
   - Koordinasi fotografer
   - Konsultasi expert untuk validasi

4. **Quality over Quantity**
   - 5 data lengkap & berkualitas
   - Lebih baik dari 20 data asal-asalan
   - Data berkualitas = approval cepat

---

## 🏆 BEST PRACTICES dari Regional Admin Terbaik

### Case Study: Taman Kehati Kerinci (Best Practice)

**Achievement:**
- ✅ 120 flora documented (6 bulan)
- ✅ 95% approval rate
- ✅ Rata-rata waktu approval: 1 hari
- ✅ 100% data punya foto lengkap

**Strategi Mereka:**

1. **Persiapan Matang**
   - Survey flora/fauna sebelum input
   - Foto semua specimen dalam 1 hari
   - Riset literature sebelum input

2. **Template Data**
   - Buat template Excel untuk koleksi data lapangan
   - Standardize format deskripsi
   - Checklist lengkap sebelum submit

3. **Quality Control**
   - Internal review sebelum submit
   - Peer review dengan tim
   - Double-check nama ilmiah

4. **Fotografer Dedicated**
   - 1 orang khusus foto dokumentasi
   - Training basic photography
   - Standard equipment (DSLR + macro lens)

5. **Kolaborasi Expert**
   - MoU dengan Universitas local
   - Konsultasi botanist untuk ID
   - Sharing data dengan peneliti

**Hasil:**
- Data berkualitas tinggi
- Approval cepat
- Jadi referensi taman lain
- Publikasi di journal

---

## 📋 CHECKLIST HARIAN/MINGGUAN

### Checklist Harian Regional Admin

- [ ] Login dashboard
- [ ] Cek notifikasi/approval status
- [ ] Respond feedback jika ada rejection
- [ ] Input minimal 1 data (flora/fauna/kegiatan)
- [ ] Upload foto yang sudah diedit
- [ ] Save draft untuk data yang belum lengkap
- [ ] Backup data lokal
- [ ] Logout

### Checklist Mingguan

- [ ] Review semua draft, complete yang siap
- [ ] Submit batch (minimal 5 data) untuk review
- [ ] Koordinasi dengan field team untuk data minggu depan
- [ ] Edit & organize foto minggu ini
- [ ] Update progress ke koordinator/kepala taman
- [ ] Evaluasi approval rate
- [ ] Perbaiki data yang rejected (jika ada)

### Checklist Bulanan

- [ ] Review statistik bulan ini
- [ ] Compare dengan target
- [ ] Report bulanan ke Super Admin
- [ ] Evaluasi: apa yang perlu diperbaiki?
- [ ] Plan untuk bulan depan
- [ ] Training/update SOP jika ada perubahan
- [ ] Backup semua data & foto

---

## 📚 RESOURCES & LAMPIRAN

### Link Penting

| Resource | URL |
|----------|-----|
| Dashboard | https://tamankehati.id/dashboard |
| Public Site | https://tamankehati.id |
| IUCN Red List | https://www.iucnredlist.org/ |
| The Plant List | http://www.theplantlist.org/ |
| Support Email | support@tamankehati.id |

### Download Template

- 📄 [Template Koleksi Data Flora](link) - Excel
- 📄 [Template Koleksi Data Fauna](link) - Excel
- 📄 [Template Report Kegiatan](link) - Word
- 📄 [Checklist Fotografi](link) - PDF

### Video Tutorial

- 🎥 [Tutorial Input Data Flora](link) - 15 menit
- 🎥 [Tutorial Input Data Fauna](link) - 12 menit
- 🎥 [Tips Fotografi Keanekaragaman Hayati](link) - 20 menit
- 🎥 [Troubleshooting Common Issues](link) - 10 menit

---

## 📝 REVISI & UPDATE SOP

**Versi:** 2.0  
**Tanggal Publikasi:** 29 Oktober 2025  
**Revisi Terakhir:** 29 Oktober 2025

### Riwayat Perubahan

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 2.0 | 29 Okt 2025 | Major update: Tambah section foto detail flora, update alur approval, tambah troubleshooting |
| 1.5 | 15 Sep 2025 | Update form kegiatan |
| 1.0 | 1 Jan 2025 | Versi awal |

### Feedback SOP

Punya saran untuk improve SOP ini?
- 📧 Email: content@tamankehati.id
- 📋 Subject: "Feedback SOP Input Data"
- 💡 Kami welcome semua feedback untuk improve!

---

## ✅ CLOSING STATEMENT

Terima kasih telah membaca SOP ini dengan seksama. Sebagai Regional Admin, Anda adalah **garda terdepan** dalam dokumentasi keanekaragaman hayati Indonesia. 

Setiap data yang Anda input adalah **kontribusi berharga** untuk:
- 🌍 **Konservasi** keanekaragaman hayati
- 📊 **Riset** ilmiah
- 📚 **Edukasi** masyarakat
- 🇮🇩 **Pencatatan** warisan alam Indonesia

**Kualitas data Anda = Kualitas database nasional**

Mari bersama-sama membangun **Indeks Kehati Indonesia** yang komprehensif dan berkualitas tinggi!

---

**🌿 Taman Kehati Indonesia**  
*Melestarikan Keanekaragaman Hayati untuk Generasi Mendatang*

📧 support@tamankehati.id  
🌐 https://tamankehati.id  
📱 +62 812-XXXX-XXXX

---

**© 2025 Taman Kehati Indonesia. All Rights Reserved.**


