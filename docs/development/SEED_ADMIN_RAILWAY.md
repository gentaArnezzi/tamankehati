# 🔐 Seed Super Admin untuk Railway PostgreSQL

Guide untuk membuat super admin user di Railway PostgreSQL database.

## 🚀 Cara 1: Menggunakan Script (Recommended)

### Opsi A: Script Python Langsung

```bash
# Dari project root
cd apps/backend
python3 ../scripts/seed-admin-railway.py
```

### Opsi B: Script Shell (dengan venv)

```bash
# Dari project root
./scripts/seed-admin-railway.sh
```

## 📝 Input yang Diperlukan

Script akan meminta:
- **Email**: Email untuk super admin (default: `admin@kehati.org`)
- **Password**: Password untuk super admin (default: `admin123`)

## 🔧 Menggunakan Environment Variables

Anda juga bisa set email dan password via environment variables:

```bash
export ADMIN_EMAIL="admin@kehati.org"
export ADMIN_PASSWORD="your_secure_password"
python3 scripts/seed-admin-railway.py
```

## ✅ Verifikasi

Setelah script berhasil, Anda akan melihat:

```
============================================================
✅ Super Admin Created Successfully!
============================================================
ID:       1
Email:    admin@kehati.org
Password: admin123
Role:     super_admin
============================================================
⚠️  PLEASE CHANGE PASSWORD AFTER FIRST LOGIN!
============================================================
```

## 🔄 Jika Admin Sudah Ada

Jika super admin sudah ada, script akan menampilkan info admin yang ada dan menanyakan apakah Anda ingin membuat admin baru.

## 🐛 Troubleshooting

### Error: Module not found
```bash
# Pastikan Anda di directory yang benar
cd apps/backend
python3 ../scripts/seed-admin-railway.py
```

### Error: Database connection failed
- Pastikan `.env` file sudah di-set dengan Railway database URL
- Pastikan database Railway sudah aktif dan accessible
- Cek connection string di `apps/backend/.env`

### Error: Import error
```bash
# Pastikan virtual environment aktif
source apps/backend/venv/bin/activate
python3 scripts/seed-admin-railway.py
```

## 📋 Next Steps

Setelah super admin dibuat:
1. Login ke aplikasi dengan email dan password yang dibuat
2. **PENTING**: Ganti password setelah login pertama kali
3. Verifikasi bahwa Anda bisa mengakses semua fitur admin

---

**Note**: Script ini aman untuk dijalankan berkali-kali. Jika admin sudah ada, script akan menanyakan konfirmasi sebelum membuat admin baru.

