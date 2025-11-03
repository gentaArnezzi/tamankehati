# Ilustrasi Database Schema - Taman Kehati

Dokumen ini mengilustrasikan struktur database yang akan terbuat jika melakukan migrasi menggunakan `alembic.ini` dan file-file migrasi yang ada.

## Gambaran Umum

Database ini menggunakan PostgreSQL dan terdiri dari **10 tabel utama** dengan relasi foreign key yang kompleks. Sebagian besar tabel menggunakan timezone-aware timestamps dan mendukung soft delete untuk beberapa entitas.

**Catatan:** Tabel `news` dan `announcements` ada di database tapi **tidak dibuat melalui migrasi Alembic**. Tabel-tabel ini dibuat secara manual atau melalui cara lain (seperti yang disebutkan di `alembic/env.py`).

---

## Diagram Relasi Tabel

```
┌─────────────┐
│    users    │
│─────────────│
│ id (PK)     │◄─────┐
│ email       │      │
│ role        │      │
│ park_id (FK)│      │
│ ...         │      │
└─────────────┘      │
                     │
        ┌────────────┼────────────┐
        │            │            │
        │            │            │
┌───────┴───┐  ┌─────┴──────┐  ┌─┴──────────┐
│   parks   │  │  articles  │  │  galleries  │
│───────────│  │────────────│  │─────────────│
│ id (PK)   │  │ id (PK)    │  │ id (PK)     │
│ name      │  │ title      │  │ title       │
│ slug      │  │ author_id  │  │ author_id   │
│ ...       │  │ park_id    │  │ entity_type │
└───────────┘  └────────────┘  │ entity_id   │
      │                         └─────────────┘
      │
      ├─────────────────┬─────────────────┐
      │                 │                 │
┌─────┴──────┐  ┌───────┴──────┐  ┌──────┴──────┐
│   flora    │  │    fauna     │  │ activities  │
│────────────│  │──────────────│  │─────────────│
│ id (PK)    │  │ id (PK)      │  │ id (PK)     │
│ park_id    │  │ park_id      │  │ park_id     │
│ ...        │  │ ...          │  │ ...         │
└────────────┘  └──────────────┘  └─────────────┘

┌─────────────────┐  ┌─────────────────┐
│ notifications   │  │      news        │
│─────────────────│  │─────────────────│
│ id (PK)         │  │ id (PK)         │
│ to_user_id (FK) │  │ title           │
│ from_user_id    │  │ author_id       │
│ ...             │  │ ...             │
└─────────────────┘  └─────────────────┘

┌─────────────────┐
│ announcements   │
│─────────────────│
│ id (PK)         │
│ title           │
│ author_id       │
│ ...             │
└─────────────────┘
```

---

## Detail Tabel

### 1. Tabel `parks` (Taman Kehati)

**Primary Key:** `id`

| Kolom              | Tipe                        | Keterangan                                               |
| ------------------ | --------------------------- | -------------------------------------------------------- |
| `id`               | INTEGER                     | Primary Key, Auto Increment                              |
| `name`             | VARCHAR(255)                | Nama Taman (NOT NULL)                                    |
| `slug`             | VARCHAR(255)                | URL-friendly name (UNIQUE, NOT NULL)                     |
| `sk_penetapan`     | VARCHAR(255)                | Nomor SK Penetapan                                       |
| `pengelola`        | VARCHAR(255)                | Instansi Pengelola                                       |
| `provinsi`         | VARCHAR(100)                | Provinsi                                                 |
| `kota_kabupaten`   | VARCHAR(100)                | Kota/Kabupaten                                           |
| `kecamatan`        | VARCHAR(100)                | Kecamatan                                                |
| `desa_kelurahan`   | VARCHAR(100)                | Desa/Kelurahan                                           |
| `tipe_ekoregion`   | VARCHAR(100)                | Tipe Ekoregion                                           |
| `area_ha`          | NUMERIC(10,2)               | Luas dalam hektar                                        |
| `latitude`         | NUMERIC(10,8)               | Latitude koordinat taman                                 |
| `longitude`        | NUMERIC(11,8)               | Longitude koordinat taman                                |
| `description`      | TEXT                        | Deskripsi Umum                                           |
| `kondisi_fisik`    | TEXT                        | Kondisi Fisik Kawasan                                    |
| `nilai_penting`    | TEXT                        | Nilai Penting Kawasan                                    |
| `sejarah`          | TEXT                        | Sejarah Taman                                            |
| `visi`             | TEXT                        | Visi Taman                                               |
| `misi`             | TEXT                        | Misi Taman                                               |
| `nilai_dasar`      | TEXT                        | Nilai-nilai Dasar                                        |
| `gambar_utama`     | VARCHAR(500)                | URL gambar utama taman                                   |
| `status`           | VARCHAR(20)                 | Status (default: 'draft' - menggunakan tipe park_status) |
| `submitted_by`     | INTEGER                     | FK → users.id (ON DELETE SET NULL)                       |
| `submitted_at`     | TIMESTAMP WITHOUT TIME ZONE | Timestamp submission                                     |
| `approved_by`      | INTEGER                     | FK → users.id (ON DELETE SET NULL)                       |
| `approved_at`      | TIMESTAMP WITHOUT TIME ZONE | Timestamp approval                                       |
| `rejected_by`      | INTEGER                     | FK → users.id (ON DELETE SET NULL)                       |
| `rejected_at`      | TIMESTAMP WITHOUT TIME ZONE | Timestamp rejection                                      |
| `rejection_reason` | TEXT                        | Alasan penolakan                                         |
| `deleted_at`       | TIMESTAMP WITHOUT TIME ZONE | Soft delete timestamp                                    |
| `created_at`       | TIMESTAMP WITHOUT TIME ZONE | Timestamp creation (default: CURRENT_TIMESTAMP)          |
| `updated_at`       | TIMESTAMP WITHOUT TIME ZONE | Timestamp update (default: CURRENT_TIMESTAMP)            |

**Index:**

- `ix_parks_id` (id)
- `idx_parks_coordinates` (latitude, longitude) - Composite index
- `idx_parks_latitude` (latitude)
- `idx_parks_longitude` (longitude)
- Unique constraint pada `slug` (`parks_slug_key`)

**Check Constraints:**

- `chk_latitude_range`: latitude harus antara -90 dan 90
- `chk_longitude_range`: longitude harus antara -180 dan 180

**Foreign Keys:**

- `fk_parks_submitted_by` → `users.id` (ON DELETE SET NULL)
- `fk_parks_approved_by` → `users.id` (ON DELETE SET NULL)
- `fk_parks_rejected_by` → `users.id` (ON DELETE SET NULL)

---

### 2. Tabel `users` (Pengguna)

**Primary Key:** `id`

| Kolom                 | Tipe                     | Keterangan                                                                                                     |
| --------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `id`                  | INTEGER                  | Primary Key, Auto Increment                                                                                    |
| `email`               | VARCHAR(255)             | Email (UNIQUE, NOT NULL, INDEXED)                                                                              |
| `hashed_password`     | VARCHAR(255)             | Password ter-hash (NOT NULL)                                                                                   |
| `role`                | VARCHAR(50)              | Role: 'super_admin' atau 'regional_admin' (default: **'user'** - perhatikan ini berbeda dari dokumentasi awal) |
| `park_id`             | INTEGER                  | FK → parks.id (nullable, INDEXED)                                                                              |
| `display_name`        | VARCHAR(255)             | Nama tampilan                                                                                                  |
| `full_name`           | VARCHAR(255)             | Nama lengkap                                                                                                   |
| `profile_picture_url` | VARCHAR(255)             | URL foto profil                                                                                                |
| `is_active`           | BOOLEAN                  | Status aktif (default: true)                                                                                   |
| `created_at`          | TIMESTAMP WITH TIME ZONE | Timestamp creation (default: CURRENT_TIMESTAMP)                                                                |
| `updated_at`          | TIMESTAMP WITH TIME ZONE | Timestamp update (default: CURRENT_TIMESTAMP)                                                                  |

**Index:**

- `ix_users_id` (id)
- `ix_users_email` (email, UNIQUE)
- `ix_users_park_id` (park_id)

**Foreign Keys:**

- `park_id` → `parks.id`

---

### 3. Tabel `flora` (Tumbuhan)

**Primary Key:** `id`

| Kolom                | Tipe                     | Keterangan                                      |
| -------------------- | ------------------------ | ----------------------------------------------- |
| `id`                 | INTEGER                  | Primary Key, Auto Increment                     |
| `park_id`            | INTEGER                  | FK → parks.id (NOT NULL, ON DELETE CASCADE)     |
| `local_name`         | VARCHAR                  | Nama lokal                                      |
| `scientific_name`    | VARCHAR                  | Nama ilmiah                                     |
| `family`             | VARCHAR                  | Famili                                          |
| `genus`              | VARCHAR                  | Genus                                           |
| `species`            | VARCHAR                  | Spesies                                         |
| `synonym`            | TEXT                     | Sinonim (dari migrasi 0002)                     |
| `description`        | TEXT                     | Deskripsi                                       |
| `habitat`            | TEXT                     | Habitat                                         |
| `morphology`         | TEXT                     | Morfologi                                       |
| `flowering_time`     | VARCHAR(100)             | Waktu berbunga (dari migrasi 0002)              |
| `distribution`       | TEXT                     | Penyebaran (dari migrasi 0002)                  |
| `propagation_method` | TEXT                     | Metode perbanyakan (dari migrasi 0002)          |
| `benefits`           | TEXT                     | Manfaat                                         |
| `uses`               | TEXT                     | Penggunaan                                      |
| `reference`          | TEXT                     | Referensi (dari migrasi 0002)                   |
| `local_id`           | VARCHAR                  | ID lokal                                        |
| `image_url`          | VARCHAR                  | URL gambar                                      |
| `gambar_utama`       | VARCHAR(500)             | URL gambar utama                                |
| `leaf_image_url`     | VARCHAR(500)             | Gambar pertelaan daun (dari migrasi 0002)       |
| `stem_image_url`     | VARCHAR(500)             | Gambar batang percabangan (dari migrasi 0002)   |
| `flower_image_url`   | VARCHAR(500)             | Gambar bunga (dari migrasi 0002)                |
| `fruit_image_url`    | VARCHAR(500)             | Gambar buah (dari migrasi 0002)                 |
| `is_endemic`         | BOOLEAN                  | Apakah endemik (default: false)                 |
| `iucn_status`        | VARCHAR(8)               | Status IUCN                                     |
| `status`             | VARCHAR(50)              | Status workflow (default: 'draft')              |
| `submitted_by`       | INTEGER                  | FK → users.id (ON DELETE SET NULL)              |
| `submitted_at`       | TIMESTAMP WITH TIME ZONE | Timestamp submission                            |
| `approved_by`        | INTEGER                  | FK → users.id (ON DELETE SET NULL)              |
| `approved_at`        | TIMESTAMP WITH TIME ZONE | Timestamp approval                              |
| `rejected_by`        | INTEGER                  | FK → users.id (ON DELETE SET NULL)              |
| `rejected_at`        | TIMESTAMP WITH TIME ZONE | Timestamp rejection                             |
| `rejection_reason`   | TEXT                     | Alasan penolakan                                |
| `deleted_at`         | TIMESTAMP WITH TIME ZONE | Soft delete timestamp                           |
| `created_at`         | TIMESTAMP WITH TIME ZONE | Timestamp creation (default: CURRENT_TIMESTAMP) |
| `updated_at`         | TIMESTAMP WITH TIME ZONE | Timestamp update (default: CURRENT_TIMESTAMP)   |

**Foreign Keys:**

- `park_id` → `parks.id` (ON DELETE CASCADE)
- `submitted_by` → `users.id` (ON DELETE SET NULL)
- `approved_by` → `users.id` (ON DELETE SET NULL)
- `rejected_by` → `users.id` (ON DELETE SET NULL)

---

### 4. Tabel `fauna` (Hewan)

**Primary Key:** `id`

| Kolom                    | Tipe                     | Keterangan                                      |
| ------------------------ | ------------------------ | ----------------------------------------------- |
| `id`                     | INTEGER                  | Primary Key, Auto Increment                     |
| `park_id`                | INTEGER                  | FK → parks.id (NOT NULL, ON DELETE CASCADE)     |
| `local_name`             | VARCHAR                  | Nama lokal                                      |
| `scientific_name`        | VARCHAR                  | Nama ilmiah                                     |
| `family`                 | VARCHAR                  | Famili                                          |
| `genus`                  | VARCHAR                  | Genus                                           |
| `species`                | VARCHAR                  | Spesies                                         |
| `ordo`                   | VARCHAR(100)             | Ordo hewan                                      |
| `description`            | TEXT                     | Deskripsi                                       |
| `habitat`                | TEXT                     | Habitat                                         |
| `diet`                   | TEXT                     | Pola makan                                      |
| `behavior`               | TEXT                     | Perilaku                                        |
| `morphology`             | TEXT                     | Morfologi                                       |
| `habitat_sumber_makanan` | TEXT                     | Habitat dan sumber makanan utama                |
| `status_hama`            | VARCHAR(50)              | Apakah termasuk hama (ya/tidak)                 |
| `tingkat_hama`           | VARCHAR(50)              | Tingkatan hama jika termasuk hama               |
| `local_id`               | VARCHAR                  | ID lokal                                        |
| `image_url`              | VARCHAR                  | URL gambar                                      |
| `gambar_utama`           | VARCHAR(500)             | URL gambar utama                                |
| `is_endemic`             | BOOLEAN                  | Apakah endemik (default: false)                 |
| `iucn_status`            | VARCHAR(8)               | Status IUCN                                     |
| `status`                 | VARCHAR(50)              | Status workflow (default: 'draft')              |
| `submitted_by`           | INTEGER                  | FK → users.id (ON DELETE SET NULL)              |
| `submitted_at`           | TIMESTAMP WITH TIME ZONE | Timestamp submission                            |
| `approved_by`            | INTEGER                  | FK → users.id (ON DELETE SET NULL)              |
| `approved_at`            | TIMESTAMP WITH TIME ZONE | Timestamp approval                              |
| `rejected_by`            | INTEGER                  | FK → users.id (ON DELETE SET NULL)              |
| `rejected_at`            | TIMESTAMP WITH TIME ZONE | Timestamp rejection                             |
| `rejection_reason`       | TEXT                     | Alasan penolakan                                |
| `deleted_at`             | TIMESTAMP WITH TIME ZONE | Soft delete timestamp                           |
| `created_at`             | TIMESTAMP WITH TIME ZONE | Timestamp creation (default: CURRENT_TIMESTAMP) |
| `updated_at`             | TIMESTAMP WITH TIME ZONE | Timestamp update (default: CURRENT_TIMESTAMP)   |

**Foreign Keys:**

- `park_id` → `parks.id` (ON DELETE CASCADE)
- `submitted_by` → `users.id` (ON DELETE SET NULL)
- `approved_by` → `users.id` (ON DELETE SET NULL)
- `rejected_by` → `users.id` (ON DELETE SET NULL)

---

### 5. Tabel `activities` (Kegiatan)

**Primary Key:** `id`

| Kolom              | Tipe                     | Keterangan                                      |
| ------------------ | ------------------------ | ----------------------------------------------- |
| `id`               | INTEGER                  | Primary Key, Auto Increment                     |
| `park_id`          | INTEGER                  | FK → parks.id (NOT NULL, ON DELETE CASCADE)     |
| `title`            | VARCHAR(255)             | Judul kegiatan (NOT NULL)                       |
| `description`      | TEXT                     | Deskripsi kegiatan                              |
| `activity_date`    | DATE                     | Tanggal kegiatan (NOT NULL)                     |
| `location`         | VARCHAR(255)             | Lokasi kegiatan                                 |
| `images`           | TEXT                     | JSON string dari URL gambar                     |
| `status`           | VARCHAR(50)              | Status workflow (default: 'draft')              |
| `submitted_by`     | INTEGER                  | FK → users.id (ON DELETE SET NULL)              |
| `submitted_at`     | TIMESTAMP WITH TIME ZONE | Timestamp submission                            |
| `approved_by`      | INTEGER                  | FK → users.id (ON DELETE SET NULL)              |
| `approved_at`      | TIMESTAMP WITH TIME ZONE | Timestamp approval                              |
| `rejected_by`      | INTEGER                  | FK → users.id (ON DELETE SET NULL)              |
| `rejected_at`      | TIMESTAMP WITH TIME ZONE | Timestamp rejection                             |
| `rejection_reason` | TEXT                     | Alasan penolakan                                |
| `created_at`       | TIMESTAMP WITH TIME ZONE | Timestamp creation (default: CURRENT_TIMESTAMP) |
| `updated_at`       | TIMESTAMP WITH TIME ZONE | Timestamp update (default: CURRENT_TIMESTAMP)   |

**Foreign Keys:**

- `park_id` → `parks.id` (ON DELETE CASCADE)
- `submitted_by` → `users.id` (ON DELETE SET NULL)
- `approved_by` → `users.id` (ON DELETE SET NULL)
- `rejected_by` → `users.id` (ON DELETE SET NULL)

---

### 6. Tabel `articles` (Artikel)

**Primary Key:** `id`

| Kolom              | Tipe                     | Keterangan                                      |
| ------------------ | ------------------------ | ----------------------------------------------- |
| `id`               | INTEGER                  | Primary Key, Auto Increment                     |
| `title`            | VARCHAR(255)             | Judul artikel (NOT NULL)                        |
| `slug`             | VARCHAR(255)             | URL-friendly slug                               |
| `content`          | TEXT                     | Konten artikel (NOT NULL)                       |
| `summary`          | VARCHAR(500)             | Ringkasan artikel                               |
| `category`         | VARCHAR(100)             | Kategori artikel                                |
| `featured_image`   | VARCHAR(500)             | URL gambar utama                                |
| `author_id`        | INTEGER                  | FK → users.id (ON DELETE SET NULL)              |
| `park_id`          | INTEGER                  | FK → parks.id (ON DELETE SET NULL)              |
| `status`           | VARCHAR(20)              | Status (default: 'draft')                       |
| `submitted_by`     | INTEGER                  | FK → users.id (ON DELETE SET NULL)              |
| `submitted_at`     | TIMESTAMP WITH TIME ZONE | Timestamp submission                            |
| `approved_by`      | INTEGER                  | FK → users.id (ON DELETE SET NULL)              |
| `approved_at`      | TIMESTAMP WITH TIME ZONE | Timestamp approval                              |
| `rejected_by`      | INTEGER                  | FK → users.id (ON DELETE SET NULL)              |
| `rejected_at`      | TIMESTAMP WITH TIME ZONE | Timestamp rejection                             |
| `rejection_reason` | VARCHAR(500)             | Alasan penolakan                                |
| `deleted_at`       | TIMESTAMP WITH TIME ZONE | Soft delete timestamp                           |
| `created_at`       | TIMESTAMP WITH TIME ZONE | Timestamp creation (default: CURRENT_TIMESTAMP) |
| `updated_at`       | TIMESTAMP WITH TIME ZONE | Timestamp update (default: CURRENT_TIMESTAMP)   |

**Index:**

- `ix_articles_id` (id)

**Foreign Keys:**

- `author_id` → `users.id` (ON DELETE SET NULL)
- `park_id` → `parks.id` (ON DELETE SET NULL)
- `submitted_by` → `users.id` (ON DELETE SET NULL)
- `approved_by` → `users.id` (ON DELETE SET NULL)
- `rejected_by` → `users.id` (ON DELETE SET NULL)

---

### 7. Tabel `galleries` (Galeri)

**Primary Key:** `id`

| Kolom              | Tipe                     | Keterangan                                            |
| ------------------ | ------------------------ | ----------------------------------------------------- |
| `id`               | INTEGER                  | Primary Key, Auto Increment                           |
| `title`            | VARCHAR(255)             | Judul gambar (NOT NULL)                               |
| `description`      | TEXT                     | Deskripsi gambar                                      |
| `image_url`        | VARCHAR(500)             | URL gambar (NOT NULL)                                 |
| `author_id`        | INTEGER                  | FK → users.id (ON DELETE SET NULL, INDEXED)           |
| `entity_type`      | VARCHAR(20)              | Tipe entitas: 'flora', 'fauna', 'park', dll (INDEXED) |
| `entity_id`        | INTEGER                  | ID entitas terkait (INDEXED)                          |
| `status`           | VARCHAR(20)              | Status (default: 'draft')                             |
| `submitted_by`     | INTEGER                  | FK → users.id (ON DELETE SET NULL)                    |
| `submitted_at`     | TIMESTAMP WITH TIME ZONE | Timestamp submission                                  |
| `approved_by`      | INTEGER                  | FK → users.id (ON DELETE SET NULL)                    |
| `approved_at`      | TIMESTAMP WITH TIME ZONE | Timestamp approval                                    |
| `rejected_by`      | INTEGER                  | FK → users.id (ON DELETE SET NULL)                    |
| `rejected_at`      | TIMESTAMP WITH TIME ZONE | Timestamp rejection                                   |
| `rejection_reason` | VARCHAR(500)             | Alasan penolakan                                      |
| `deleted_at`       | TIMESTAMP WITH TIME ZONE | Soft delete timestamp                                 |
| `created_at`       | TIMESTAMP WITH TIME ZONE | Timestamp creation (default: CURRENT_TIMESTAMP)       |
| `updated_at`       | TIMESTAMP WITH TIME ZONE | Timestamp update (default: CURRENT_TIMESTAMP)         |

**Index:**

- `ix_galleries_id` (id)
- `ix_galleries_author_id` (author_id)
- `ix_galleries_entity_type` (entity_type)
- `ix_galleries_entity_id` (entity_id)

**Foreign Keys:**

- `author_id` → `users.id` (ON DELETE SET NULL)
- `submitted_by` → `users.id` (ON DELETE SET NULL)
- `approved_by` → `users.id` (ON DELETE SET NULL)
- `rejected_by` → `users.id` (ON DELETE SET NULL)

**Catatan:** Tabel ini menggunakan **polymorphic relationship** dengan kolom `entity_type` dan `entity_id` untuk menghubungkan gambar dengan berbagai entitas (flora, fauna, park).

---

### 8. Tabel `notifications` (Notifikasi)

**Primary Key:** `id`

| Kolom          | Tipe                     | Keterangan                                      |
| -------------- | ------------------------ | ----------------------------------------------- |
| `id`           | INTEGER                  | Primary Key, Auto Increment                     |
| `to_user_id`   | INTEGER                  | FK → users.id (NOT NULL)                        |
| `from_user_id` | INTEGER                  | User pengirim (nullable, INDEXED)               |
| `type`         | VARCHAR(50)              | Tipe notifikasi (NOT NULL)                      |
| `title`        | VARCHAR(255)             | Judul notifikasi (NOT NULL)                     |
| `message`      | TEXT                     | Pesan notifikasi (NOT NULL)                     |
| `resource`     | VARCHAR(100)             | Resource terkait                                |
| `resource_id`  | INTEGER                  | ID resource terkait                             |
| `region_code`  | VARCHAR(10)              | Kode region (INDEXED, legacy)                   |
| `is_read`      | BOOLEAN                  | Status sudah dibaca (default: false)            |
| `created_at`   | TIMESTAMP WITH TIME ZONE | Timestamp creation (default: CURRENT_TIMESTAMP) |

**Index:**

- `ix_notifications_id` (id)
- `ix_notifications_to_user_id` (to_user_id)
- `ix_notifications_from_user_id` (from_user_id)
- `ix_notifications_region_code` (region_code)

**Catatan:** Tabel ini tidak memiliki foreign key constraint ke `users.id` pada kolom `to_user_id` dan `from_user_id` dalam migrasi, namun secara logis mengacu ke tabel `users`.

---

### 9. Tabel `news` (Berita)

**Primary Key:** `id`

**Catatan:** Tabel ini **tidak dibuat melalui migrasi Alembic** tetapi ada di database. Tabel ini kemungkinan dibuat secara manual atau melalui cara lain.

| Kolom              | Tipe                     | Keterangan                                   |
| ------------------ | ------------------------ | -------------------------------------------- |
| `id`               | INTEGER                  | Primary Key, Auto Increment                  |
| `title`            | VARCHAR(255)             | Judul berita (NOT NULL, INDEXED)             |
| `content`          | TEXT                     | Konten berita (NOT NULL)                     |
| `summary`          | VARCHAR(500)             | Ringkasan berita                             |
| `slug`             | VARCHAR(255)             | URL-friendly slug (UNIQUE, INDEXED)          |
| `category`         | VARCHAR(50)              | Kategori (default: 'general', INDEXED)       |
| `status`           | VARCHAR(50)              | Status (default: 'draft', INDEXED)           |
| `priority`         | INTEGER                  | Priority level (default: 0)                  |
| `is_featured`      | BOOLEAN                  | Apakah featured (default: false)             |
| `is_pinned`        | BOOLEAN                  | Apakah pinned (default: false)               |
| `published_at`     | TIMESTAMP WITH TIME ZONE | Waktu publish                                |
| `expires_at`       | TIMESTAMP WITH TIME ZONE | Waktu expire                                 |
| `author_id`        | INTEGER                  | FK → users.id (ON DELETE SET NULL)           |
| `submitted_by`     | INTEGER                  | FK → users.id (ON DELETE SET NULL)           |
| `submitted_at`     | TIMESTAMP WITH TIME ZONE | Timestamp submission                         |
| `approved_by`      | INTEGER                  | FK → users.id (ON DELETE SET NULL)           |
| `approved_at`      | TIMESTAMP WITH TIME ZONE | Timestamp approval                           |
| `rejected_by`      | INTEGER                  | FK → users.id (ON DELETE SET NULL)           |
| `rejected_at`      | TIMESTAMP WITH TIME ZONE | Timestamp rejection                          |
| `rejection_reason` | VARCHAR(500)             | Alasan penolakan                             |
| `featured_image`   | VARCHAR(500)             | URL gambar utama                             |
| `attachments`      | TEXT                     | JSON string dari URL attachment              |
| `tags`             | VARCHAR(500)             | Tag (comma-separated)                        |
| `view_count`       | INTEGER                  | Jumlah view (default: 0)                     |
| `reading_time`     | INTEGER                  | Waktu baca estimasi dalam menit (default: 0) |
| `created_at`       | TIMESTAMP WITH TIME ZONE | Timestamp creation (default: now())          |
| `updated_at`       | TIMESTAMP WITH TIME ZONE | Timestamp update (default: now())            |
| `deleted_at`       | TIMESTAMP WITH TIME ZONE | Soft delete timestamp                        |

**Index:**

- `ix_news_id` (id)
- `ix_news_title` (title)
- `ix_news_slug` (slug, UNIQUE)
- `ix_news_category` (category)
- `ix_news_status` (status)

**Foreign Keys:**

- `author_id` → `users.id` (ON DELETE SET NULL)
- `submitted_by` → `users.id` (ON DELETE SET NULL)
- `approved_by` → `users.id` (ON DELETE SET NULL)
- `rejected_by` → `users.id` (ON DELETE SET NULL)

---

### 10. Tabel `announcements` (Pengumuman)

**Primary Key:** `id`

**Catatan:** Tabel ini **tidak dibuat melalui migrasi Alembic** tetapi ada di database. Tabel ini kemungkinan dibuat secara manual atau melalui cara lain.

| Kolom              | Tipe                     | Keterangan                                                                              |
| ------------------ | ------------------------ | --------------------------------------------------------------------------------------- |
| `id`               | INTEGER                  | Primary Key, Auto Increment                                                             |
| `title`            | VARCHAR(255)             | Judul pengumuman (NOT NULL, INDEXED)                                                    |
| `content`          | TEXT                     | Konten pengumuman (NOT NULL)                                                            |
| `summary`          | VARCHAR(500)             | Ringkasan pengumuman                                                                    |
| `type`             | VARCHAR(50)              | Tipe: 'news', 'announcement', 'event', 'maintenance' (default: 'announcement', INDEXED) |
| `status`           | VARCHAR(50)              | Status (default: 'draft', INDEXED)                                                      |
| `target_audience`  | VARCHAR(50)              | Target audience: 'super_admin', 'regional_admin' (default: 'regional_admin')            |
| `priority`         | INTEGER                  | Priority level (default: 0)                                                             |
| `is_featured`      | BOOLEAN                  | Apakah featured (default: false)                                                        |
| `is_pinned`        | BOOLEAN                  | Apakah pinned (default: false)                                                          |
| `published_at`     | TIMESTAMP WITH TIME ZONE | Waktu publish                                                                           |
| `expires_at`       | TIMESTAMP WITH TIME ZONE | Waktu expire                                                                            |
| `author_id`        | INTEGER                  | FK → users.id (ON DELETE SET NULL)                                                      |
| `submitted_by`     | INTEGER                  | FK → users.id (ON DELETE SET NULL)                                                      |
| `submitted_at`     | TIMESTAMP WITH TIME ZONE | Timestamp submission                                                                    |
| `approved_by`      | INTEGER                  | FK → users.id (ON DELETE SET NULL)                                                      |
| `approved_at`      | TIMESTAMP WITH TIME ZONE | Timestamp approval                                                                      |
| `rejected_by`      | INTEGER                  | FK → users.id (ON DELETE SET NULL)                                                      |
| `rejected_at`      | TIMESTAMP WITH TIME ZONE | Timestamp rejection                                                                     |
| `rejection_reason` | VARCHAR(500)             | Alasan penolakan                                                                        |
| `featured_image`   | VARCHAR(500)             | URL gambar utama                                                                        |
| `attachments`      | TEXT                     | JSON string dari URL attachment                                                         |
| `tags`             | VARCHAR(500)             | Tag (comma-separated)                                                                   |
| `view_count`       | INTEGER                  | Jumlah view (default: 0)                                                                |
| `created_at`       | TIMESTAMP WITH TIME ZONE | Timestamp creation (default: now())                                                     |
| `updated_at`       | TIMESTAMP WITH TIME ZONE | Timestamp update (default: now())                                                       |
| `deleted_at`       | TIMESTAMP WITH TIME ZONE | Soft delete timestamp                                                                   |

**Index:**

- `ix_announcements_id` (id)
- `ix_announcements_title` (title)
- `ix_announcements_type` (type)
- `ix_announcements_status` (status)

**Foreign Keys:**

- `author_id` → `users.id` (ON DELETE SET NULL)
- `submitted_by` → `users.id` (ON DELETE SET NULL)
- `approved_by` → `users.id` (ON DELETE SET NULL)
- `rejected_by` → `users.id` (ON DELETE SET NULL)

---

## Relasi Antar Tabel

### Hierarki Relasi

1. **Tabel Pusat:** `users` dan `parks`

   - Users dapat memiliki park_id (many-to-one)
   - Parks dapat memiliki banyak users (one-to-many)

2. **Tabel yang Bergantung pada Parks:**

   - `flora` → banyak flora per park (one-to-many)
   - `fauna` → banyak fauna per park (one-to-many)
   - `activities` → banyak kegiatan per park (one-to-many)

3. **Tabel yang Bergantung pada Users:**

   - Semua kolom workflow (`submitted_by`, `approved_by`, `rejected_by`) di berbagai tabel
   - `articles` → author_id
   - `galleries` → author_id
   - `notifications` → to_user_id, from_user_id

4. **Tabel yang Bergantung pada Parks dan Users:**
   - `articles` → park_id dan author_id
   - `parks` → submitted_by, approved_by, rejected_by

### Pola Workflow

Hampir semua tabel utama memiliki pola workflow yang sama:

- `status`: draft → in_review → approved/rejected
- `submitted_by`, `submitted_at`: User dan waktu submission
- `approved_by`, `approved_at`: User dan waktu approval
- `rejected_by`, `rejected_at`, `rejection_reason`: User, waktu, dan alasan rejection

### Soft Delete

Tabel-tabel berikut mendukung soft delete:

- `parks` (deleted_at)
- `flora` (deleted_at)
- `fauna` (deleted_at)
- `articles` (deleted_at)
- `galleries` (deleted_at)

---

## Index dan Constraints

### Primary Keys

- Semua tabel memiliki `id` sebagai PRIMARY KEY (INTEGER, AUTO INCREMENT)

### Unique Constraints

- `users.email` → UNIQUE
- `parks.slug` → UNIQUE

### Foreign Key Constraints

Semua foreign key menggunakan:

- **ON DELETE CASCADE** untuk relasi parent-child yang ketat (flora, fauna, activities → parks)
- **ON DELETE SET NULL** untuk relasi yang lebih fleksibel (workflow fields, author_id)

### Index

- Semua primary key di-index
- Foreign key fields umumnya di-index untuk performa query
- Field-field yang sering digunakan untuk filtering juga di-index

---

## Catatan Migrasi

### Migrasi 20251029_0001 (Initial Migration)

Membuat 8 tabel utama:

1. parks
2. users
3. flora
4. fauna
5. activities
6. articles
7. galleries
8. notifications

**Catatan:** Tabel `news` dan `announcements` ada di database tapi **tidak dibuat melalui migrasi ini**. Menurut komentar di `alembic/env.py`, tabel-tabel ini dibuat secara terpisah (mungkin secara manual atau melalui script SQL).

### Migrasi 20251029_0002 (Add Flora Extended Fields)

Menambahkan field tambahan pada tabel `flora`:

- `synonym` (TEXT)
- `flowering_time` (VARCHAR(100))
- `distribution` (TEXT)
- `propagation_method` (TEXT)
- `reference` (TEXT)
- `leaf_image_url` (VARCHAR(500))
- `stem_image_url` (VARCHAR(500))
- `flower_image_url` (VARCHAR(500))
- `fruit_image_url` (VARCHAR(500))

---

## Cara Menjalankan Migrasi

### 1. Setup Environment

```bash
cd apps/backend
export DATABASE_URL_SYNC="postgresql://user:password@host:port/database"
```

### 2. Jalankan Migrasi

```bash
# Upgrade ke versi terbaru
alembic upgrade head

# Atau upgrade ke versi spesifik
alembic upgrade 20251029_0002

# Rollback ke versi sebelumnya
alembic downgrade -1
```

### 3. Verifikasi

```bash
# Cek status migrasi
alembic current

# Cek history migrasi
alembic history
```

---

## Contoh Data

### Tabel `parks`

```sql
INSERT INTO parks (name, slug, provinsi, kota_kabupaten, status)
VALUES ('Taman Kehati Bogor', 'taman-kehati-bogor', 'Jawa Barat', 'Bogor', 'approved');
```

### Tabel `users`

```sql
INSERT INTO users (email, hashed_password, role, park_id, display_name)
VALUES ('admin@example.com', '$2b$12$...', 'super_admin', NULL, 'Admin Utama');
```

### Tabel `flora`

```sql
INSERT INTO flora (park_id, local_name, scientific_name, family, genus, species, status)
VALUES (1, 'Pohon Beringin', 'Ficus benjamina', 'Moraceae', 'Ficus', 'benjamina', 'draft');
```

---

## Perbedaan Antara Dokumentasi dan Database Aktual

### Perbedaan yang Ditemukan:

1. **Tabel `parks`:**

   - `created_at` dan `updated_at` adalah `timestamp without time zone` (bukan `timestamp with time zone`)
   - Ada index tambahan: `idx_parks_coordinates`, `idx_parks_latitude`, `idx_parks_longitude`
   - Ada constraint check untuk validasi latitude (-90 sampai 90) dan longitude (-180 sampai 180)

2. **Tabel `users`:**

   - Default `role` adalah `'user'` (bukan `'regional_admin'` seperti yang disebutkan di dokumentasi awal)

3. **Tabel `news` dan `announcements`:**

   - Ada di database tapi **tidak dibuat melalui migrasi Alembic**
   - Tabel-tabel ini dibuat secara manual atau melalui cara lain

4. **Tabel `activities`:**
   - Ada foreign key constraint duplikat: `activities_submitted_by_fkey` dan `fk_activities_submitted_by_users` (duplikasi)

### Catatan Penting:

- Dokumentasi ini mencerminkan struktur database yang **sebenarnya** di Railway PostgreSQL
- Beberapa tabel dibuat melalui migrasi Alembic, sementara yang lain dibuat secara manual
- Perlu dilakukan audit untuk memastikan semua tabel memiliki migrasi yang sesuai

---

## Kesimpulan

Database schema ini dirancang untuk:

1. **Multi-tenancy**: Setiap user terhubung ke park tertentu
2. **Workflow Management**: Sistem approval/rejection untuk semua entitas utama
3. **Audit Trail**: Tracking siapa yang membuat, mengubah, atau menyetujui data
4. **Soft Delete**: Data tidak dihapus permanen, hanya ditandai sebagai deleted
5. **Extensibility**: Pola polymorphic relationship untuk galleries
6. **Data Integrity**: Foreign key constraints untuk menjaga konsistensi data

Schema ini mendukung aplikasi Taman Kehati untuk mengelola data flora, fauna, kegiatan, artikel, berita, pengumuman, dan galeri dengan sistem workflow yang lengkap.

**Total Tabel:** 10 tabel (8 dari migrasi Alembic + 2 dari pembuatan manual)
