# 🔧 Fix 504 Gateway Timeout untuk AI Endpoints

Panduan lengkap untuk memperbaiki error **504 Gateway Timeout** saat menggunakan fitur AI di server.

---

## 🔍 Masalah

**Error yang terjadi:**
```
Failed to load resource: the server responded with a status of 504 (Gateway Time-out)
```

**Penyebab:**
1. **Nginx timeout terlalu pendek**: Nginx default timeout adalah **60 detik**
2. **Backend AI timeout lebih lama**: Backend AI bisa memakan waktu **120-180 detik** (tergantung model)
3. **Nginx timeout sebelum backend selesai**: Nginx akan return 504 sebelum backend selesai generate

**Kenapa di local cepat tapi di server lambat?**
- **Local**: Tidak ada Nginx, langsung ke backend (tidak ada timeout layer)
- **Server**: Ada Nginx sebagai reverse proxy dengan timeout 60 detik

---

## 🎯 Solusi

### 1. Update Nginx Timeout untuk AI Endpoints

Nginx perlu timeout yang lebih lama untuk endpoint AI (`/api/v1/ai/`).

**Timeout yang diperlukan:**
- **Backend timeout**: 120 detik (small models) / 180 detik (large models)
- **Nginx timeout**: **200 detik** (harus lebih lama dari backend)
- **Frontend timeout**: 190 detik

### 2. Cara Update Manual

#### Opsi A: Update Nginx Config Langsung

1. **Edit Nginx config di server**:
```bash
# Di server
sudo nano /etc/nginx/sites-available/default
# atau
sudo nano ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

2. **Tambahkan location block khusus untuk AI endpoints SEBELUM location /api/ yang umum**:

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

3. **Test dan reload Nginx**:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

#### Opsi B: Gunakan Script Otomatis

1. **Copy script ke server**:
```bash
# Di local
scp scripts/fix-nginx-ai-timeout.sh ubuntu@klh-gpu-pd1:~/dasmap_prod/apps/tamankehati/scripts/
```

2. **Jalankan script di server**:
```bash
# Di server
cd ~/dasmap_prod/apps/tamankehati
chmod +x scripts/fix-nginx-ai-timeout.sh
sudo ./scripts/fix-nginx-ai-timeout.sh [nginx-config-path]
```

Script akan:
- ✅ Backup config otomatis
- ✅ Detect backend proxy_pass
- ✅ Tambahkan AI location block dengan timeout 200s
- ✅ Test config dan reload Nginx

---

## 🔍 Verifikasi Fix

### 1. Test Nginx Config

```bash
sudo nginx -t
```

**Output yang diharapkan:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 2. Test AI Endpoint

```bash
# Test dari server
curl -I http://localhost/api/v1/ai/test-ollama

# Atau test dari browser
# Buka: http://YOUR_SERVER_IP/api/v1/ai/test-ollama
```

### 3. Monitor Logs

```bash
# Nginx error log
sudo tail -f /var/log/nginx/error.log

# Nginx access log
sudo tail -f /var/log/nginx/access.log

# Backend logs
docker logs tamankehati-backend-prod --tail 50 -f
```

---

## 📊 Timeout Configuration Summary

| Layer | Timeout | Keterangan |
|-------|---------|------------|
| **Ollama Provider** | 120s (small) / 180s (large) | Backend timeout untuk AI generation |
| **Nginx (AI endpoints)** | **200s** | ⚠️ Harus lebih lama dari backend |
| **Nginx (general API)** | 60s | Timeout normal untuk API lain |
| **Frontend** | 190s | Client-side timeout |

**Urutan timeout:**
```
Frontend (190s) > Nginx AI (200s) > Backend (120s/180s)
```

---

## 🐛 Troubleshooting

### Masalah 1: Masih 504 Timeout

**Kemungkinan penyebab:**
1. Nginx config belum di-reload
2. Location block AI tidak lebih spesifik dari `/api/`
3. Backend timeout lebih lama dari yang diharapkan

**Solusi:**
```bash
# 1. Pastikan Nginx reload
sudo systemctl reload nginx

# 2. Cek config
sudo nginx -t

# 3. Cek apakah AI location block ada dan lebih spesifik
sudo grep -A 20 "location ~ \^/api/v1/ai/" /etc/nginx/sites-available/default

# 4. Cek backend timeout
docker exec tamankehati-backend-prod env | grep OLLAMA_MODEL
```

### Masalah 2: Nginx Config Error

**Error:**
```
nginx: [emerg] unexpected "}" in /etc/nginx/sites-available/default
```

**Solusi:**
```bash
# Restore backup
sudo cp /etc/nginx/sites-available/default.backup.* /etc/nginx/sites-available/default

# Atau edit manual
sudo nano /etc/nginx/sites-available/default
```

### Masalah 3: AI Masih Lambat

**Kemungkinan penyebab:**
1. Ollama belum dioptimasi (belum ada environment variables)
2. Model terlalu besar
3. Resource server terbatas

**Solusi:**
1. **Pastikan optimasi Ollama sudah diterapkan**:
```bash
# Di server, cek docker-compose
cat docker-compose.pull.no-nginx.yml | grep -A 10 "ollama:"

# Harus ada:
# OLLAMA_NUM_PARALLEL: 1
# OLLAMA_MAX_LOADED_MODELS: 1
# OLLAMA_KEEP_ALIVE: 10m
# OLLAMA_NUM_THREAD: 4
```

2. **Gunakan model lebih kecil**:
```bash
# Di server .env
OLLAMA_MODEL=qwen2:1.5b  # Lebih cepat dari llama3.1:8b
```

3. **Cek resource server**:
```bash
docker stats tamankehati-ollama-prod
free -h
```

---

## 📝 Checklist Fix 504 Timeout

- [ ] Nginx config sudah diupdate dengan AI location block
- [ ] Timeout AI endpoints: **200 detik**
- [ ] AI location block **SEBELUM** general `/api/` location
- [ ] Nginx config valid (`sudo nginx -t`)
- [ ] Nginx sudah di-reload (`sudo systemctl reload nginx`)
- [ ] Test AI endpoint berhasil (tidak 504)
- [ ] Monitor logs untuk memastikan tidak ada error

---

## 🎯 Expected Result

**Sebelum fix:**
- ❌ 504 Gateway Timeout setelah 60 detik
- ❌ AI generation tidak pernah selesai

**Setelah fix:**
- ✅ AI generation bisa selesai (120-180 detik)
- ✅ Tidak ada 504 timeout
- ✅ Response berhasil sampai ke frontend

---

## 💡 Tips

1. **Gunakan model kecil**: `qwen2:1.5b` lebih cepat dan cukup untuk flora/fauna
2. **Monitor timeout**: Pastikan Nginx timeout selalu lebih lama dari backend timeout
3. **Test secara bertahap**: Test dengan request kecil dulu, baru request besar
4. **Backup selalu**: Selalu backup Nginx config sebelum edit

---

## 📚 Referensi

- [Nginx Proxy Timeout Documentation](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_read_timeout)
- [Ollama Performance Optimization](./OLLAMA_PERFORMANCE_LOCAL_VS_SERVER.md)
- [AI Timeout Fix](./AI_TIMEOUT_FIX.md)




