# 🌐 Setup Frontend Environment Variables

Dokumen ini menjelaskan cara setup environment variables untuk frontend Next.js.

## 📋 Prerequisites

- Node.js 22.x terinstall
- Backend server sudah berjalan (untuk local development)

## 🚀 Quick Setup

### Cara Termudah - Gunakan Script:

```bash
./scripts/setup-frontend-env.sh
```

Script ini akan:
- Membuat file `.env.local` di `apps/frontend/`
- Meminta input API URL (default: `http://localhost:8000`)
- Setup semua environment variables yang diperlukan

## 📝 Manual Setup

### 1. Buat File `.env.local`

File `.env.local` harus berada di `apps/frontend/.env.local`:

```bash
cd apps/frontend
touch .env.local
```

### 2. Konfigurasi Environment Variables

Edit `apps/frontend/.env.local` dan tambahkan:

```env
# =============================================================================
# API CONFIGURATION
# =============================================================================

# Backend API URL
# Untuk local development: http://localhost:8000
# Untuk production: https://your-production-api.com
NEXT_PUBLIC_API_URL=http://localhost:8000

# =============================================================================
# APP CONFIGURATION
# =============================================================================

NEXT_PUBLIC_APP_NAME="Taman Kehati"
NEXT_PUBLIC_APP_VERSION="2.1.0"

# =============================================================================
# NEXT.JS CONFIGURATION
# =============================================================================

NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1

# =============================================================================
# FEATURE FLAGS
# =============================================================================

NEXT_PUBLIC_ENABLE_AI=true
NEXT_PUBLIC_ENABLE_MAPS=true
NEXT_PUBLIC_ENABLE_UPLOADS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true

# =============================================================================
# MAP CONFIGURATION
# =============================================================================

NEXT_PUBLIC_MAP_TILE_URL="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
NEXT_PUBLIC_MAP_ATTRIBUTION="© OpenStreetMap contributors"
NEXT_PUBLIC_DEFAULT_LAT="-6.2088"
NEXT_PUBLIC_DEFAULT_LNG="106.8456"
NEXT_PUBLIC_DEFAULT_ZOOM="10"
```

## 🔑 Environment Variables yang Penting

### `NEXT_PUBLIC_API_URL` (Required)

URL backend API yang digunakan frontend untuk melakukan request.

**Local Development:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Production:**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
# atau
NEXT_PUBLIC_API_URL=http://38.47.93.167:8080
```

### `NEXT_PUBLIC_APP_NAME` (Optional)

Nama aplikasi yang ditampilkan di UI.

### `NEXT_PUBLIC_APP_VERSION` (Optional)

Versi aplikasi.

### Feature Flags (Optional)

Mengontrol fitur yang diaktifkan:

```env
NEXT_PUBLIC_ENABLE_AI=true          # Enable AI features
NEXT_PUBLIC_ENABLE_MAPS=true        # Enable map features
NEXT_PUBLIC_ENABLE_UPLOADS=true     # Enable file uploads
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true  # Enable notifications
```

## ⚠️ Important Notes

### 1. Prefix `NEXT_PUBLIC_`

**Hanya** environment variables dengan prefix `NEXT_PUBLIC_` yang bisa diakses di client-side (browser).

Variables tanpa prefix hanya bisa diakses di server-side (API routes, Server Components).

### 2. File `.env.local` vs `.env`

- `.env.local` - Untuk local development (tidak di-commit ke Git) ✅ **Recommended**
- `.env` - Untuk default values (bisa di-commit, tapi berisiko)
- `.env.production` - Untuk production build

**Prioritas:** `.env.local` > `.env.production` > `.env`

**Kenapa pakai `.env.local`?**
- ✅ Otomatis di-ignore oleh Git (lebih aman)
- ✅ Setiap developer bisa punya konfigurasi berbeda
- ✅ Best practice Next.js untuk local development
- ✅ Tidak akan ter-commit secara tidak sengaja

**Bisa pakai `.env` saja?**
- Bisa, tapi **tidak disarankan** karena berisiko ter-commit ke Git
- Jika tetap mau pakai, pastikan ada di `.gitignore`

**Di server production?**
- **Tidak pakai file** - Environment variables di-set via hosting platform dashboard (Vercel, Render, dll)
- Atau via Docker build args / docker-compose.yml

📖 **Lihat penjelasan lengkap:** [ENV_FILE_EXPLANATION.md](./ENV_FILE_EXPLANATION.md)

### 3. Restart Required

Setelah mengubah `.env.local`, **restart development server**:

```bash
# Stop server (Ctrl+C)
# Start lagi
npm run dev
```

### 4. Git Ignore

File `.env.local` sudah ada di `.gitignore`, jadi tidak akan di-commit ke Git.

## 🔍 Verifikasi Setup

### 1. Check File Exists

```bash
ls -la apps/frontend/.env.local
```

### 2. Check Variables Loaded

Buat file test di `apps/frontend/test-env.js`:

```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('App Name:', process.env.NEXT_PUBLIC_APP_NAME);
```

Jalankan:
```bash
cd apps/frontend
node -r dotenv/config test-env.js
```

Atau check di browser console setelah frontend berjalan:
```javascript
// Di browser console
console.log(process.env.NEXT_PUBLIC_API_URL);
```

### 3. Test API Connection

Setelah frontend berjalan, buka browser console dan test:

```javascript
fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
  .then(r => r.json())
  .then(console.log);
```

## 🐛 Troubleshooting

### Environment Variables Tidak Ter-load

1. **Pastikan file `.env.local` ada di `apps/frontend/`** (bukan di project root)
2. **Restart development server** setelah mengubah `.env.local`
3. **Check prefix** - harus `NEXT_PUBLIC_` untuk client-side access
4. **Check syntax** - tidak ada spasi di sekitar `=`

### API Connection Error

1. **Pastikan backend berjalan** di URL yang sama dengan `NEXT_PUBLIC_API_URL`
2. **Check CORS** - pastikan backend mengizinkan request dari `http://localhost:3000`
3. **Test backend langsung:**
   ```bash
   curl http://localhost:8000/health
   ```

### Build Error

Jika ada error saat build:

1. **Check semua `NEXT_PUBLIC_` variables** sudah di-set
2. **Check syntax** di `.env.local`
3. **Clear Next.js cache:**
   ```bash
   cd apps/frontend
   rm -rf .next
   npm run dev
   ```

## 📚 Related Documentation

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Setup Local Workspace](./SETUP_LOCAL_WORKSPACE.md)
- [Next Steps After Setup](./NEXT_STEPS_AFTER_SETUP.md)

## 🎯 Quick Reference

```bash
# Setup frontend env
./scripts/setup-frontend-env.sh

# Start frontend
cd apps/frontend
npm install
npm run dev

# Check env variables
cat apps/frontend/.env.local | grep NEXT_PUBLIC_API_URL
```

---

**Selamat coding! 🎉**

