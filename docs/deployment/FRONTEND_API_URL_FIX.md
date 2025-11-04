# 🔧 Fix Frontend API URL - ERR_CONNECTION_REFUSED

Panduan untuk memperbaiki error `ERR_CONNECTION_REFUSED` ke `localhost:8000` dari frontend.

---

## ❌ Masalah

**Error di browser console:**
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
localhost:8000/api/public/flora?limit=2&sort=created_at_desc:1
localhost:8000/api/public/fauna?limit=1&sort=created_at_desc:1
localhost:8000/api/public/parks?limit=100:1
localhost:8000/api/public/stats/:1
```

**Penyebab:**
- Frontend masih pakai `localhost:8000` sebagai API URL
- `localhost:8000` tidak accessible dari browser client (browser user)
- Frontend perlu di-rebuild dengan `NEXT_PUBLIC_API_URL` yang benar

---

## ✅ Solusi: Update NEXT_PUBLIC_API_URL

**Opsi 1: Pakai Full URL (Recommended untuk Port-based Routing)**

**1. Update .env di server:**

```bash
cd ~/dasmap_prod/apps/tamankehati
nano .env
```

**Update atau tambahkan:**
```bash
NEXT_PUBLIC_API_URL=http://38.47.93.167:8080
```

**2. Rebuild frontend dengan build arg:**

```bash
# Stop frontend
docker compose -f docker-compose.pull.no-nginx.yml stop frontend
docker compose -f docker-compose.pull.no-nginx.yml rm -f frontend

# Build dengan build arg (jika pakai docker build)
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://38.47.93.167:8080 \
  -t arnezzi/tamankehati-frontend:latest \
  -f apps/frontend/Dockerfile \
  apps/frontend

# Atau rebuild via docker-compose (jika ada build context)
docker compose -f docker-compose.pull.no-nginx.yml build --no-cache frontend

# Start frontend
docker compose -f docker-compose.pull.no-nginx.yml up -d frontend
```

**3. Verify:**

```bash
# Check logs
docker logs tamankehati-frontend-1 --tail 20

# Test di browser
# http://38.47.93.167:8080
# Check console - tidak ada ERR_CONNECTION_REFUSED
```

---

**Opsi 2: Pakai Relative Path (Tidak Perlu Rebuild) ⭐**

**Ini lebih simple karena tidak perlu rebuild!**

**1. Update Nginx config untuk handle relative paths:**

Frontend akan pakai relative path `/api` yang akan di-route oleh Nginx ke backend.

**2. Pastikan Nginx config sudah benar:**

```nginx
# Di ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf

location /api/ {
    proxy_pass http://localhost:8000;
    # ... proxy headers
}
```

**3. Update .env untuk pakai relative path:**

```bash
cd ~/dasmap_prod/apps/tamankehati
nano .env
```

**Update:**
```bash
# Pakai relative path (tidak perlu rebuild)
NEXT_PUBLIC_API_URL=
```

**Atau hapus line ini** - frontend akan pakai relative path default.

**4. Restart frontend (untuk reload .env):**

```bash
docker compose -f docker-compose.pull.no-nginx.yml restart frontend
```

**5. Verify:**

```bash
# Test di browser
# http://38.47.93.167:8080
# Check Network tab - requests ke /api/... bukan localhost:8000
```

---

## 🔍 Cara Cek API URL yang Dipakai Frontend

**1. Cek di browser console:**

```javascript
// Di browser console (F12)
console.log(process.env.NEXT_PUBLIC_API_URL)
```

**2. Cek Network tab:**

- Buka Developer Tools (F12)
- Go to Network tab
- Reload page
- Cek request URL untuk API calls
- Seharusnya: `http://38.47.93.167:8080/api/...` atau `/api/...`
- Bukan: `localhost:8000/api/...`

---

## 🔧 Quick Fix (Recommended)

**Karena frontend sudah di-build, pakai relative path:**

```bash
# 1. Update .env
cd ~/dasmap_prod/apps/tamankehati
echo "NEXT_PUBLIC_API_URL=" >> .env
# Atau edit .env dan set NEXT_PUBLIC_API_URL kosong atau hapus

# 2. Restart frontend
docker compose -f docker-compose.pull.no-nginx.yml restart frontend

# 3. Verify
# Test di browser: http://38.47.93.167:8080
# Check console - tidak ada ERR_CONNECTION_REFUSED
```

**Tapi ini tidak akan work karena Next.js build time variable!**

---

## ⚠️ Catatan Penting

**NEXT_PUBLIC_API_URL adalah build-time variable!**

- ✅ Set saat build: `docker build --build-arg NEXT_PUBLIC_API_URL=...`
- ❌ Tidak bisa diubah saat runtime dengan `.env` file
- ❌ Restart container tidak akan mengubah value

**Solusi: Rebuild frontend dengan build arg yang benar.**

---

## 🔧 Complete Fix (Rebuild Frontend)

**1. Update .env:**

```bash
cd ~/dasmap_prod/apps/tamankehati
nano .env
```

**Tambah:**
```bash
NEXT_PUBLIC_API_URL=http://38.47.93.167:8080
```

**2. Rebuild dan push image:**

**Di local machine (bukan di server):**

```bash
cd /path/to/tamankehati_new

# Build dengan build arg
docker buildx build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_URL=http://38.47.93.167:8080 \
  -t arnezzi/tamankehati-frontend:latest \
  --target runner \
  -f apps/frontend/Dockerfile \
  apps/frontend

# Push ke Docker Hub
docker push arnezzi/tamankehati-frontend:latest
```

**3. Pull dan restart di server:**

```bash
cd ~/dasmap_prod/apps/tamankehati

# Pull new image
docker compose -f docker-compose.pull.no-nginx.yml pull frontend

# Restart
docker compose -f docker-compose.pull.no-nginx.yml up -d frontend

# Verify
docker logs tamankehati-frontend-1 --tail 20
```

**4. Test di browser:**

```
http://38.47.93.167:8080
```

**Check console - tidak ada ERR_CONNECTION_REFUSED**

---

## 🎯 Alternative: Pakai Relative Path (No Rebuild)

**Jika tidak mau rebuild, ubah frontend code untuk pakai relative path:**

**Tapi ini perlu update code dan rebuild juga, jadi lebih baik langsung rebuild dengan build arg yang benar.**

---

## ✅ Expected Result

**Setelah fix:**

**Network tab di browser:**
- ✅ Requests ke: `http://38.47.93.167:8080/api/public/flora?...`
- ✅ Tidak ada: `localhost:8000/api/...`

**Console:**
- ✅ Tidak ada ERR_CONNECTION_REFUSED
- ✅ API calls berhasil
- ✅ Data loading dengan benar

---

**Last Updated:** 2025-11-04


