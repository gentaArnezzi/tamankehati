# 🔄 Update Docker Images di Server

Panduan untuk update Docker images yang sudah running di server.

---

## ❓ Pertanyaan Umum

**Q: Perlu stop container dulu?**
- ✅ Tidak perlu (recommended: rolling update)
- ⚠️ Bisa stop jika ingin lebih aman (zero-downtime)

**Q: Perlu hapus image lama?**
- ✅ Tidak perlu (optional untuk cleanup disk space)
- 🧹 Bisa hapus untuk menghemat space

---

## ✅ Method 1: Rolling Update (Recommended) ⭐

**Container tetap running, pull image baru, lalu restart.**

### Keuntungan:
- ✅ Zero-downtime (jika ada multiple replicas)
- ✅ Simple dan cepat
- ✅ Tidak perlu stop container

### Langkah:

```bash
cd ~/dasmap_prod/apps/tamankehati

# 1. Pull image baru (container tetap running)
docker compose -f docker-compose.pull.no-nginx.yml pull frontend

# 2. Restart container (akan pakai image baru)
docker compose -f docker-compose.pull.no-nginx.yml up -d frontend

# 3. Verify
docker logs tamankehati-frontend-1 --tail 20
```

**Docker akan:**
1. Pull image baru dengan tag yang sama
2. Restart container dengan image baru
3. Container lama akan di-stop dan di-replace

---

## ✅ Method 2: Stop, Pull, Start (Lebih Aman)

**Stop container dulu, pull image baru, lalu start.**

### Keuntungan:
- ✅ Lebih aman (pastikan tidak ada request yang terputus)
- ✅ Bisa verify image sebelum start

### Kekurangan:
- ⚠️ Ada downtime singkat (beberapa detik)

### Langkah:

```bash
cd ~/dasmap_prod/apps/tamankehati

# 1. Stop container
docker compose -f docker-compose.pull.no-nginx.yml stop frontend

# 2. Pull image baru
docker compose -f docker-compose.pull.no-nginx.yml pull frontend

# 3. Start container dengan image baru
docker compose -f docker-compose.pull.no-nginx.yml up -d frontend

# 4. Verify
docker logs tamankehati-frontend-1 --tail 20
```

---

## 🔄 Update Semua Services

**Jika perlu update semua services (frontend, backend, dll):**

```bash
cd ~/dasmap_prod/apps/tamankehati

# Pull semua images
docker compose -f docker-compose.pull.no-nginx.yml pull

# Restart semua services
docker compose -f docker-compose.pull.no-nginx.yml up -d

# Verify
docker ps | grep tamankehati
```

---

## 🧹 Cleanup Image Lama (Optional)

**Hapus image lama untuk menghemat disk space.**

### Cek Image yang Ada:

```bash
# List semua images
docker images | grep tamankehati

# Expected output:
# arnezzi/tamankehati-frontend   v1.0.3   xxx   2 minutes ago   500MB
# arnezzi/tamankehati-frontend   v1.0.2   xxx   1 hour ago     500MB
# arnezzi/tamankehati-frontend   latest   xxx   2 minutes ago   500MB
```

### Hapus Image Spesifik:

```bash
# Hapus image dengan tag spesifik
docker rmi arnezzi/tamankehati-frontend:v1.0.2

# Atau hapus semua image yang tidak digunakan
docker image prune -f
```

### Hapus Semua Image Lama (Dangling):

```bash
# Hapus image yang tidak digunakan (dangling)
docker image prune -f

# Hapus semua image yang tidak digunakan (termasuk yang di-tag)
docker image prune -a -f
```

**⚠️ Warning:** `docker image prune -a` akan hapus semua image yang tidak digunakan, termasuk yang mungkin masih diperlukan.

---

## 📋 Complete Update Workflow

**Copy-paste semua command berikut:**

```bash
cd ~/dasmap_prod/apps/tamankehati

# 1. Pull image baru (container tetap running)
echo "📥 Pulling new images..."
docker compose -f docker-compose.pull.no-nginx.yml pull frontend

# 2. Restart container dengan image baru
echo "🔄 Restarting container..."
docker compose -f docker-compose.pull.no-nginx.yml up -d frontend

# 3. Wait for container to be ready
echo "⏳ Waiting for container to be ready..."
sleep 5

# 4. Verify container is running
echo "✅ Checking container status..."
docker ps | grep tamankehati-frontend

# 5. Check logs
echo "📋 Checking logs..."
docker logs tamankehati-frontend-1 --tail 20

# 6. Test health
echo "🧪 Testing health..."
curl -I http://38.47.93.167:8080 | head -5

# 7. Optional: Cleanup old images
echo "🧹 Cleaning up old images (optional)..."
docker image prune -f
```

---

## 🔍 Verify Update Berhasil

**1. Cek Image Tag:**

```bash
docker inspect tamankehati-frontend-1 | grep Image
```

**2. Cek Container Status:**

```bash
docker ps | grep tamankehati-frontend
```

**Expected:**
- ✅ Status: Up
- ✅ Image: arnezzi/tamankehati-frontend:v1.0.3 (atau tag terbaru)

**3. Cek Logs:**

```bash
docker logs tamankehati-frontend-1 --tail 20
```

**Expected:**
- ✅ No errors
- ✅ "Ready on http://0.0.0.0:3000"

**4. Test Website:**

```bash
curl http://38.47.93.167:8080 | head -20
```

**Expected:**
- ✅ HTML response
- ✅ Tidak ada ERR_CONNECTION_REFUSED di console browser

---

## ⚠️ Troubleshooting

### Container Tidak Start Setelah Update

**Masalah:** Container tidak start setelah update

**Solusi:**
```bash
# Cek logs untuk error
docker logs tamankehati-frontend-1 --tail 50

# Cek container status
docker ps -a | grep tamankehati-frontend

# Restart manual
docker compose -f docker-compose.pull.no-nginx.yml restart frontend
```

---

### Image Tidak Update

**Masalah:** Container masih pakai image lama

**Solusi:**
```bash
# Force recreate container
docker compose -f docker-compose.pull.no-nginx.yml up -d --force-recreate frontend

# Atau stop, remove, dan start lagi
docker compose -f docker-compose.pull.no-nginx.yml stop frontend
docker compose -f docker-compose.pull.no-nginx.yml rm -f frontend
docker compose -f docker-compose.pull.no-nginx.yml up -d frontend
```

---

### Disk Space Full

**Masalah:** Disk space penuh karena banyak image lama

**Solusi:**
```bash
# Hapus image yang tidak digunakan
docker image prune -a -f

# Hapus container yang stopped
docker container prune -f

# Hapus semua yang tidak digunakan
docker system prune -a -f
```

**⚠️ Warning:** `docker system prune -a` akan hapus semua yang tidak digunakan, pastikan tidak ada yang penting.

---

## 📋 Checklist Update

- [ ] Pull image baru: `docker compose pull frontend`
- [ ] Restart container: `docker compose up -d frontend`
- [ ] Verify container running: `docker ps | grep tamankehati`
- [ ] Check logs: `docker logs tamankehati-frontend-1 --tail 20`
- [ ] Test website: `curl http://38.47.93.167:8080`
- [ ] Test di browser: Check console untuk ERR_CONNECTION_REFUSED
- [ ] Optional: Cleanup old images: `docker image prune -f`

---

## 💡 Best Practices

1. **Gunakan Rolling Update** - Lebih cepat dan simple
2. **Verifikasi Setelah Update** - Selalu test setelah update
3. **Keep Old Images Temporarily** - Jangan langsung hapus, keep untuk rollback
4. **Update During Low Traffic** - Update saat traffic rendah untuk minimize impact
5. **Monitor Logs** - Monitor logs setelah update untuk catch errors early

---

**Last Updated:** 2025-11-04


