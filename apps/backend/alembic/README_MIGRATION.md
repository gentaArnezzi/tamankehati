# Panduan Alembic Migration

## Setup Alembic (Sudah Selesai ✅)

Alembic telah dikonfigurasi dan dibersihkan. Migration pertama sudah dibuat di folder `versions/`.

## Cara Menggunakan

### 1. Pastikan Environment Variables Sudah Diset

Pastikan file `.env` memiliki salah satu dari variable berikut:
```bash
DATABASE_URL_SYNC=postgresql+psycopg2://user:password@host:port/dbname
# ATAU
DATABASE_URL=postgresql+psycopg2://user:password@host:port/dbname
```

### 2. Jalankan Migration

Untuk apply migration ke database:

```bash
cd apps/backend
./venv/bin/alembic upgrade head
```

### 3. Membuat Migration Baru

Setelah mengubah model di `domains/*/models.py`, buat migration baru:

```bash
./venv/bin/alembic revision --autogenerate -m "deskripsi_perubahan"
```

### 4. Rollback Migration

Untuk rollback 1 step:
```bash
./venv/bin/alembic downgrade -1
```

Untuk rollback ke revision tertentu:
```bash
./venv/bin/alembic downgrade <revision_id>
```

Untuk rollback semua:
```bash
./venv/bin/alembic downgrade base
```

### 5. Lihat History Migration

```bash
./venv/bin/alembic history
```

### 6. Lihat Current Revision

```bash
./venv/bin/alembic current
```

## Struktur Migration Saat Ini

### Initial Migration (20251029_0001)

Migration ini membuat tabel-tabel utama:

1. **parks** - Tabel taman/kawasan
2. **users** - Tabel pengguna sistem
3. **flora** - Tabel data flora
4. **fauna** - Tabel data fauna
5. **activities** - Tabel kegiatan/aktivitas
6. **articles** - Tabel artikel
7. **galleries** - Tabel galeri foto
8. **notifications** - Tabel notifikasi

Semua tabel sudah dilengkapi dengan:
- Workflow approval (submitted_by, approved_by, rejected_by)
- Soft delete (deleted_at)
- Timestamps (created_at, updated_at)
- Foreign key constraints dengan ondelete='SET NULL' atau 'CASCADE'

## Tips

1. **Selalu review migration sebelum apply** - Periksa file migration di `versions/` sebelum menjalankan upgrade
2. **Backup database** - Selalu backup database sebelum migration di production
3. **Test di development** - Test migration di development environment dulu
4. **Jangan edit migration yang sudah di-apply** - Buat migration baru untuk perubahan

## Troubleshooting

### Error: "could not translate host name"
- Pastikan network access tersedia
- Periksa DATABASE_URL_SYNC di file `.env`

### Error: "No module named 'psycopg2'"
- Gunakan virtual environment: `./venv/bin/alembic` bukan hanya `alembic`

### Error: "relation already exists"
- Database mungkin sudah punya tabel tersebut
- Cek dengan: `./venv/bin/alembic current`
- Jika perlu, stamp database ke revision tertentu: `./venv/bin/alembic stamp <revision_id>`

