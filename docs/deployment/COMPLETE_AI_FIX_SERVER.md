# 🚀 Solusi Lengkap: Fix AI Lambat & 504 Timeout di Server

Panduan lengkap untuk memperbaiki **AI lambat** dan **504 Gateway Timeout** di server.

---

## 🔍 Masalah

**Dua masalah utama:**
1. **AI lambat di server** (60-90 detik) vs cepat di local (5-15 detik)
2. **504 Gateway Timeout** setelah 60 detik

**Penyebab:**
- ❌ Ollama belum dioptimasi (tidak ada environment variables)
- ❌ Nginx timeout terlalu pendek (60 detik)
- ❌ Model belum pre-loaded
- ❌ Resource allocation belum optimal

---

## 🎯 Solusi Lengkap (2 Langkah)

### ✅ Langkah 1: Optimasi Performance Ollama (MEMPERCEPAT AI)

**Tujuan:** Mempercepat AI generation dari 60-90 detik menjadi 15-30 detik

#### 1.1 Update `docker-compose.pull.no-nginx.yml` di Server

**Di server, edit file:**
```bash
cd ~/dasmap_prod/apps/tamankehati
nano docker-compose.pull.no-nginx.yml
```

**Cari section `ollama:` dan update `environment:`:**

**Dari:**
```yaml
  ollama:
    environment:
      OLLAMA_MODEL: ${OLLAMA_MODEL:-qwen2:1.5b}
```

**Ke:**
```yaml
  ollama:
    environment:
      OLLAMA_MODEL: ${OLLAMA_MODEL:-qwen2:1.5b}
      # Performance optimization for server
      OLLAMA_NUM_PARALLEL: 1  # Limit concurrent requests (1 = faster per request)
      OLLAMA_MAX_LOADED_MODELS: 1  # Keep only 1 model loaded (faster)
      OLLAMA_KEEP_ALIVE: 10m  # Keep model in memory for 10 minutes (faster subsequent requests)
      OLLAMA_NUM_THREAD: 4  # Use 4 CPU threads (match cpus: 4.0)
```

#### 1.2 Restart Ollama

```bash
docker compose -f docker-compose.pull.no-nginx.yml up -d ollama
```

#### 1.3 Verifikasi Optimasi

```bash
# Cek environment variables
docker exec tamankehati-ollama-prod env | grep OLLAMA

# Harus ada:
# OLLAMA_NUM_PARALLEL=1
# OLLAMA_MAX_LOADED_MODELS=1
# OLLAMA_KEEP_ALIVE=10m
# OLLAMA_NUM_THREAD=4
```

**Expected improvement:**
- ✅ AI generation: **60-90 detik** → **15-30 detik** (50-70% lebih cepat)

---

### ✅ Langkah 2: Fix 504 Gateway Timeout (MENCEGAH TIMEOUT)

**Tujuan:** Mencegah 504 error saat AI generation memakan waktu > 60 detik

#### 2.1 Update Nginx Config

**Di server, edit Nginx config:**
```bash
sudo nano /etc/nginx/sites-available/default
# atau
sudo nano ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

**Tambahkan location block khusus untuk AI endpoints SEBELUM location /api/ yang umum:**

```nginx
# AI endpoints dengan timeout lebih lama (FIX 504 Gateway Timeout)
# ⚠️ PENTING: Letakkan SEBELUM location /api/ yang umum (lebih spesifik)
location ~ ^/api/v1/ai/ {
    proxy_pass http://localhost:8000;  # Ganti dengan backend URL Anda
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # ⚠️ PENTING: Timeout diperpanjang untuk AI generation
    proxy_connect_timeout 200s;
    proxy_send_timeout 200s;
    proxy_read_timeout 200s;  # PENTING: harus lebih lama dari backend timeout
    
    # Buffers untuk response yang besar
    proxy_buffering on;
    proxy_buffer_size 8k;
    proxy_buffers 16 8k;
    proxy_busy_buffers_size 16k;
}

# General API endpoints (timeout normal)
location /api/ {
    proxy_pass http://localhost:8000;
    # ... (config normal dengan timeout 60s)
}
```

#### 2.2 Test dan Reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Expected result:**
- ✅ Tidak ada 504 Gateway Timeout
- ✅ AI generation bisa selesai meskipun > 60 detik

---

## 📊 Perbandingan: Sebelum vs Sesudah

| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| **AI Generation Time** | 60-90 detik | 15-30 detik |
| **504 Timeout Error** | ❌ Sering terjadi | ✅ Tidak terjadi |
| **First Request** | 60-90 detik | 30-45 detik |
| **Subsequent Requests** | 45-60 detik | 15-25 detik |
| **User Experience** | ❌ Lambat + Timeout | ✅ Cepat + Stabil |

---

## 🔧 Script Otomatis

### Script 1: Update Ollama Performance

```bash
# Di local, copy script ke server
scp scripts/update-ollama-performance.sh ubuntu@klh-gpu-pd1:~/dasmap_prod/apps/tamankehati/scripts/

# Di server, jalankan
cd ~/dasmap_prod/apps/tamankehati
chmod +x scripts/update-ollama-performance.sh
./scripts/update-ollama-performance.sh
```

### Script 2: Fix Nginx Timeout

```bash
# Di local, copy script ke server
scp scripts/fix-nginx-ai-timeout.sh ubuntu@klh-gpu-pd1:~/dasmap_prod/apps/tamankehati/scripts/

# Di server, jalankan
cd ~/dasmap_prod/apps/tamankehati
chmod +x scripts/fix-nginx-ai-timeout.sh
sudo ./scripts/fix-nginx-ai-timeout.sh [nginx-config-path]
```

---

## ✅ Checklist Lengkap

### Optimasi Performance
- [ ] `docker-compose.pull.no-nginx.yml` sudah diupdate dengan environment variables Ollama
- [ ] `OLLAMA_NUM_PARALLEL: 1` sudah ada
- [ ] `OLLAMA_MAX_LOADED_MODELS: 1` sudah ada
- [ ] `OLLAMA_KEEP_ALIVE: 10m` sudah ada
- [ ] `OLLAMA_NUM_THREAD: 4` sudah ada
- [ ] Ollama container sudah di-restart
- [ ] Environment variables sudah terverifikasi

### Fix Timeout
- [ ] Nginx config sudah diupdate dengan AI location block
- [ ] AI location block **SEBELUM** general `/api/` location
- [ ] Timeout AI endpoints: **200 detik**
- [ ] Nginx config valid (`sudo nginx -t`)
- [ ] Nginx sudah di-reload

### Verifikasi
- [ ] Test AI endpoint berhasil (tidak 504)
- [ ] AI generation < 30 detik (untuk model kecil)
- [ ] Monitor logs tidak ada error

---

## 🎯 Expected Final Result

**Setelah kedua langkah:**
- ✅ AI generation: **15-30 detik** (dari 60-90 detik)
- ✅ Tidak ada 504 Gateway Timeout
- ✅ User experience: Cepat dan stabil
- ✅ Performance improvement: **50-70% lebih cepat**

---

## 💡 Tips Tambahan

1. **Gunakan model kecil**: `qwen2:1.5b` lebih cepat dan cukup untuk flora/fauna
2. **Monitor resource**: Pastikan server punya cukup CPU/RAM
3. **Pre-load model**: Pastikan model di-load saat container start
4. **Test bertahap**: Test dengan request kecil dulu, baru request besar

---

## 📚 Dokumentasi Terkait

- [Ollama Performance Optimization](./OLLAMA_PERFORMANCE_LOCAL_VS_SERVER.md) - Detail optimasi performance
- [Fix 504 Gateway Timeout](./FIX_504_GATEWAY_TIMEOUT.md) - Detail fix timeout
- [Update Ollama Performance Server](./UPDATE_OLLAMA_PERFORMANCE_SERVER.md) - Panduan update docker-compose

---

## 🐛 Troubleshooting

### Masalah: AI Masih Lambat Setelah Optimasi

**Kemungkinan penyebab:**
1. Environment variables belum ter-apply
2. Model terlalu besar
3. Resource server terbatas

**Solusi:**
```bash
# 1. Cek environment variables
docker exec tamankehati-ollama-prod env | grep OLLAMA

# 2. Cek resource usage
docker stats tamankehati-ollama-prod

# 3. Gunakan model lebih kecil
# Di .env: OLLAMA_MODEL=qwen2:1.5b
```

### Masalah: Masih 504 Timeout Setelah Fix

**Kemungkinan penyebab:**
1. Nginx config belum di-reload
2. AI location block tidak lebih spesifik dari `/api/`
3. Backend timeout lebih lama dari yang diharapkan

**Solusi:**
```bash
# 1. Pastikan Nginx reload
sudo systemctl reload nginx

# 2. Cek config
sudo nginx -t

# 3. Cek apakah AI location block ada
sudo grep -A 20 "location ~ \^/api/v1/ai/" /etc/nginx/sites-available/default
```

---

## 📝 Summary

**Dua solusi yang perlu dilakukan:**

1. **Optimasi Performance** → Mempercepat AI (60-90s → 15-30s)
2. **Fix Timeout** → Mencegah 504 error

**Keduanya harus dilakukan untuk hasil optimal!** ✅

