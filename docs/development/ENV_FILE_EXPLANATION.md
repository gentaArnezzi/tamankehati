# 📝 Penjelasan: `.env.local` vs `.env` di Next.js

## ❓ Kenapa Pakai `.env.local` Bukan `.env`?

### Next.js Environment File Hierarchy

Next.js memiliki **prioritas loading** untuk environment files:

```
Prioritas Tertinggi → Terendah:
1. .env.local              ← Untuk local development (tidak di-commit)
2. .env.development.local   ← Untuk development (tidak di-commit)
3. .env.production.local    ← Untuk production build (tidak di-commit)
4. .env.development         ← Untuk development (bisa di-commit)
5. .env.production          ← Untuk production (bisa di-commit)
6. .env                     ← Default values (bisa di-commit)
```

### Alasan Pakai `.env.local`

1. **Tidak di-commit ke Git** (lebih aman)
   - `.env.local` otomatis di-ignore oleh Git
   - Tidak akan ter-commit secara tidak sengaja
   - Setiap developer bisa punya konfigurasi berbeda

2. **Override `.env` yang di-commit**
   - `.env` bisa di-commit sebagai template/default
   - `.env.local` akan override values dari `.env`
   - Berguna untuk development yang berbeda-beda

3. **Best Practice Next.js**
   - Official Next.js documentation merekomendasikan `.env.local` untuk local development
   - Standard practice di komunitas Next.js

## 🖥️ Di Server Production

### Tidak Pakai File `.env.local` atau `.env`

Di server production, environment variables biasanya **tidak disimpan di file**, melainkan:

#### 1. **Hosting Platform (Vercel, Render, dll)**

Environment variables di-set melalui **dashboard hosting platform**:

**Contoh Vercel:**
```
Settings → Environment Variables
- NEXT_PUBLIC_API_URL = https://api.yourdomain.com
- NODE_ENV = production
```

**Contoh Render:**
```yaml
# render.yaml
envVars:
  - key: NEXT_PUBLIC_API_URL
    value: https://api.yourdomain.com
```

#### 2. **Docker Deployment**

Environment variables di-pass saat build/run:

```bash
# Build dengan build args
docker build --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com .

# Atau via docker-compose.yml
environment:
  - NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

#### 3. **Server Manual (Ubuntu Server)**

Bisa pakai file `.env.production` atau environment variables di system:

```bash
# Option 1: File .env.production (untuk build time)
NEXT_PUBLIC_API_URL=http://38.47.93.167:8080

# Option 2: System environment variables (untuk runtime)
export NEXT_PUBLIC_API_URL=http://38.47.93.167:8080
npm run build
```

## 📊 Perbandingan

| Lokasi | File yang Digunakan | Kapan Digunakan |
|--------|-------------------|-----------------|
| **Local Development** | `.env.local` | Development di laptop/PC |
| **Production Build** | `.env.production` atau build args | Saat build di CI/CD |
| **Production Runtime** | Environment variables dari hosting platform | Saat aplikasi berjalan di server |

## ✅ Rekomendasi Setup

### Local Development

```bash
# File: apps/frontend/.env.local (tidak di-commit)
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development
```

### Production (Vercel/Render)

**Tidak pakai file**, tapi set via dashboard:
- Vercel: Settings → Environment Variables
- Render: Environment Variables di dashboard
- Docker: Build args atau docker-compose.yml

### Production (Manual Server)

```bash
# File: apps/frontend/.env.production (bisa di-commit sebagai template)
NEXT_PUBLIC_API_URL=http://38.47.93.167:8080
NODE_ENV=production
```

## 🔄 Bisa Pakai `.env` Saja?

**Bisa**, tapi **tidak disarankan** karena:

1. **Risiko commit credentials** - Jika lupa, bisa ter-commit ke Git
2. **Tidak fleksibel** - Semua developer harus pakai values yang sama
3. **Tidak sesuai best practice** - Next.js merekomendasikan `.env.local` untuk local

### Jika Tetap Mau Pakai `.env`:

```bash
# File: apps/frontend/.env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Pastikan:**
- File `.env` ada di `.gitignore` (jika berisi credentials)
- Atau commit sebagai template tanpa credentials

## 📝 Kesimpulan

| Use Case | File yang Digunakan |
|----------|-------------------|
| **Local Development** | `.env.local` ✅ (Recommended) |
| **Production (Hosting)** | Environment variables di dashboard (bukan file) |
| **Production (Manual)** | `.env.production` atau system env vars |

**TL;DR:**
- Local: Pakai `.env.local` (aman, tidak di-commit)
- Production: Tidak pakai file, pakai environment variables dari hosting platform atau system

---

**Referensi:**
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Next.js .env.local Best Practices](https://nextjs.org/docs/basic-features/environment-variables#local-development)

