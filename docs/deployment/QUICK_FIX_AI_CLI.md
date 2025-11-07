# 🚀 Quick Fix AI: Menggunakan CLI Script

Panduan cepat untuk fix AI lambat & 504 Gateway Timeout menggunakan script CLI.

---

## 📋 Prerequisites

1. **Akses SSH ke server**
2. **Sudo access** (untuk update Nginx)
3. **Docker & Docker Compose** sudah terinstall

---

## 🚀 Cara Menggunakan Script

### Step 1: Copy Script ke Server

**Di local:**
```bash
scp scripts/fix-ai-complete.sh ubuntu@klh-gpu-pd1:~/dasmap_prod/apps/tamankehati/scripts/
```

### Step 2: SSH ke Server

```bash
ssh ubuntu@klh-gpu-pd1
cd ~/dasmap_prod/apps/tamankehati
```

### Step 3: Jalankan Script

**Opsi A: Auto-detect Nginx config**
```bash
chmod +x scripts/fix-ai-complete.sh
./scripts/fix-ai-complete.sh
```

**Opsi B: Specify Nginx config path**
```bash
chmod +x scripts/fix-ai-complete.sh
./scripts/fix-ai-complete.sh /etc/nginx/sites-available/default
# atau
./scripts/fix-ai-complete.sh ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

---

## 📝 Apa yang Dilakukan Script?

### Part 1: Optimasi Performance Ollama ✅

1. **Backup** `docker-compose.pull.no-nginx.yml`
2. **Update** environment variables Ollama:
   - `OLLAMA_NUM_PARALLEL: 1`
   - `OLLAMA_MAX_LOADED_MODELS: 1`
   - `OLLAMA_KEEP_ALIVE: 10m`
   - `OLLAMA_NUM_THREAD: 4`
3. **Restart** Ollama container
4. **Verify** optimization

**Expected result:** AI generation 60-90s → 15-30s (50-70% faster)

### Part 2: Fix Nginx Timeout ✅

1. **Backup** Nginx config
2. **Detect** backend proxy_pass
3. **Add** AI location block dengan timeout 200s
4. **Test** Nginx config
5. **Reload** Nginx (optional)

**Expected result:** No more 504 Gateway Timeout

---

## 🔍 Verifikasi

### 1. Cek Ollama Optimization

```bash
docker exec tamankehati-ollama-prod env | grep OLLAMA
```

**Output yang diharapkan:**
```
OLLAMA_MODEL=qwen2:1.5b
OLLAMA_NUM_PARALLEL=1
OLLAMA_MAX_LOADED_MODELS=1
OLLAMA_KEEP_ALIVE=10m
OLLAMA_NUM_THREAD=4
```

### 2. Cek Nginx Config

```bash
sudo nginx -t
sudo grep -A 20 "location ~ \^/api/v1/ai/" /etc/nginx/sites-available/default
```

**Output yang diharapkan:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 3. Test AI Endpoint

```bash
curl -I http://localhost/api/v1/ai/test-ollama
```

**Expected:** Status 200 (tidak 504)

---

## 🐛 Troubleshooting

### Error: "File docker-compose.pull.no-nginx.yml tidak ditemukan"

**Solusi:**
```bash
# Pastikan Anda di directory yang benar
cd ~/dasmap_prod/apps/tamankehati
pwd  # Harus: /home/ubuntu/dasmap_prod/apps/tamankehati
```

### Error: "Nginx config tidak ditemukan"

**Solusi:**
```bash
# Specify Nginx config path manually
./scripts/fix-ai-complete.sh /etc/nginx/sites-available/default
```

### Error: "Permission denied" untuk Nginx

**Solusi:**
```bash
# Pastikan menggunakan sudo untuk Nginx operations
# Script akan meminta sudo password jika diperlukan
```

### Error: "Nginx config invalid"

**Solusi:**
```bash
# Restore backup
sudo cp /etc/nginx/sites-available/default.backup.* /etc/nginx/sites-available/default
sudo nginx -t
```

---

## 📊 Expected Results

**Sebelum fix:**
- ❌ AI generation: 60-90 detik
- ❌ 504 Gateway Timeout setelah 60 detik
- ❌ User experience: Lambat + Error

**Setelah fix:**
- ✅ AI generation: 15-30 detik (50-70% faster)
- ✅ Tidak ada 504 Gateway Timeout
- ✅ User experience: Cepat + Stabil

---

## 💡 Tips

1. **Backup selalu dibuat otomatis** - aman untuk rollback
2. **Script interactive** - akan meminta konfirmasi sebelum update
3. **Bisa skip bagian tertentu** - jika sudah diupdate sebelumnya
4. **Test setelah fix** - pastikan tidak ada error

---

## 🔄 Rollback (Jika Perlu)

### Rollback Ollama Optimization

```bash
# Restore docker-compose backup
cp docker-compose.pull.no-nginx.yml.backup.* docker-compose.pull.no-nginx.yml
docker compose -f docker-compose.pull.no-nginx.yml up -d ollama
```

### Rollback Nginx Config

```bash
# Restore Nginx backup
sudo cp /etc/nginx/sites-available/default.backup.* /etc/nginx/sites-available/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📚 Dokumentasi Terkait

- [Complete AI Fix Server](./COMPLETE_AI_FIX_SERVER.md) - Detail lengkap kedua fix
- [Ollama Performance Optimization](./OLLAMA_PERFORMANCE_LOCAL_VS_SERVER.md) - Detail optimasi performance
- [Fix 504 Gateway Timeout](./FIX_504_GATEWAY_TIMEOUT.md) - Detail fix timeout




