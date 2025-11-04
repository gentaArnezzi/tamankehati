# 🔄 Update Nginx Config File

Panduan untuk update/replace file Nginx config.

---

## 📋 Situasi

**File yang ada:**
- `tamankehati.conf` (file lama)
- `tamankehati.conf.new` (file baru)

**Tujuan:** Replace `tamankehati.conf` dengan `tamankehati.conf.new`

---

## 🔧 Method 1: Copy (Recommended - Keep Backup)

**Backup file lama, lalu replace dengan file baru.**

```bash
cd ~/dasmap_prod/apps/nginx/sites-enabled

# 1. Backup file lama
cp tamankehati.conf tamankehati.conf.backup

# 2. Replace dengan file baru
cp tamankehati.conf.new tamankehati.conf

# 3. Verify
cat tamankehati.conf | head -20

# 4. Test Nginx config
docker exec -it dasmap_prod-go-1 nginx -t

# 5. Reload Nginx
docker exec -it dasmap_prod-go-1 nginx -s reload

# 6. Test
curl http://38.47.93.167:8080 | head -20
```

**Keuntungan:**
- ✅ File lama tetap ada sebagai backup
- ✅ Bisa rollback jika ada masalah
- ✅ Safe operation

---

## 🔧 Method 2: Move (Direct Replace)

**Langsung replace tanpa backup.**

```bash
cd ~/dasmap_prod/apps/nginx/sites-enabled

# 1. Replace langsung (pakai -f untuk auto-confirm)
mv -f tamankehati.conf.new tamankehati.conf

# 2. Verify
cat tamankehati.conf | head -20

# 3. Test Nginx config
docker exec -it dasmap_prod-go-1 nginx -t

# 4. Reload Nginx
docker exec -it dasmap_prod-go-1 nginx -s reload

# 5. Test
curl http://38.47.93.167:8080 | head -20
```

**Keuntungan:**
- ✅ Simple dan cepat
- ✅ Tidak ada file duplikat
- ✅ Flag `-f` auto-confirm tanpa prompt

**Kekurangan:**
- ⚠️ Tidak ada backup file lama

**Note:** Jika muncul prompt `replace 'tamankehati.conf'?`, pakai `mv -f` untuk auto-confirm, atau ketik `y` lalu Enter.

---

## ✅ Complete Command (Copy-Paste)

**Copy semua command berikut di server:**

```bash
cd ~/dasmap_prod/apps/nginx/sites-enabled

# Backup dan replace
cp tamankehati.conf tamankehati.conf.backup
cp tamankehati.conf.new tamankehati.conf

# Verify
echo "✅ Config file updated"
cat tamankehati.conf | grep -E "(listen|server_name)" | head -5

# Test Nginx
echo "🧪 Testing Nginx config..."
docker exec -it dasmap_prod-go-1 nginx -t

# Reload
echo "🔄 Reloading Nginx..."
docker exec -it dasmap_prod-go-1 nginx -s reload

# Test
echo "🌐 Testing website..."
curl -I http://38.47.93.167:8080
```

---

## 🔍 Verify Config

**Cek config yang aktif:**

```bash
# Cek listen port
docker exec -it dasmap_prod-go-1 cat /etc/nginx/sites-enabled/tamankehati.conf | grep listen

# Expected untuk port-based: listen 8080;
# Expected untuk subdomain: listen 80;

# Cek server_name
docker exec -it dasmap_prod-go-1 cat /etc/nginx/sites-enabled/tamankehati.conf | grep server_name

# Expected: server_name 38.47.93.167 _; atau server_name tamankehati.dasmap.co.id;
```

---

## ⚠️ Troubleshooting

### Nginx Config Test Failed

**Error:** `nginx: configuration file /etc/nginx/nginx.conf test failed`

**Solusi:**
1. **Cek syntax error:**
   ```bash
   docker exec -it dasmap_prod-go-1 nginx -t
   ```

2. **Cek file yang di-copy:**
   ```bash
   cat tamankehati.conf | head -30
   ```

3. **Restore backup jika perlu:**
   ```bash
   cp tamankehati.conf.backup tamankehati.conf
   docker exec -it dasmap_prod-go-1 nginx -t
   ```

---

### 502 Bad Gateway Setelah Reload

**Masalah:** 502 Bad Gateway setelah reload Nginx

**Solusi:**
1. **Cek container running:**
   ```bash
   docker ps | grep tamankehati
   ```

2. **Cek proxy_pass:**
   ```bash
   docker exec -it dasmap_prod-go-1 cat /etc/nginx/sites-enabled/tamankehati.conf | grep proxy_pass
   ```

3. **Test dari container:**
   ```bash
   docker exec -it dasmap_prod-go-1 curl http://localhost:3000
   docker exec -it dasmap_prod-go-1 curl http://localhost:8000/api/health
   ```

---

## 📋 Checklist

- [ ] Backup file lama: `cp tamankehati.conf tamankehati.conf.backup`
- [ ] Replace dengan file baru: `cp tamankehati.conf.new tamankehati.conf`
- [ ] Verify config: `cat tamankehati.conf | head -20`
- [ ] Test Nginx: `docker exec -it dasmap_prod-go-1 nginx -t`
- [ ] Reload Nginx: `docker exec -it dasmap_prod-go-1 nginx -s reload`
- [ ] Test website: `curl http://38.47.93.167:8080 | head -20`
- [ ] Verify port: `docker exec -it dasmap_prod-go-1 cat /etc/nginx/sites-enabled/tamankehati.conf | grep listen`

---

**Last Updated:** 2025-11-04

