# 🌐 Domain Setup Guide

Panduan lengkap untuk setup domain name untuk aplikasi Taman Kehati di server Ubuntu.

---

## 📋 Status Konfigurasi Saat Ini

**Default Configuration:** 
- ✅ **IP-based access** (sudah dikonfigurasi)
- ⏳ **Domain support** (opsional, perlu setup manual)

**File yang digunakan:**
- `deploy-package/nginx/conf.d/default.conf` - Untuk IP-based access (default)
- `deploy-package/nginx/conf.d/default-with-domain.conf` - Template untuk domain (opsional)

---

## 🎯 Opsi 1: Tetap Menggunakan IP (Current)

**Saat ini sudah dikonfigurasi untuk IP-based access.**

### Konfigurasi:
- ✅ Nginx: `server_name _;` (accept all hostnames)
- ✅ Akses via: `http://YOUR_SERVER_IP:80` atau `http://YOUR_SERVER_IP:3000`
- ✅ Tidak perlu setup domain

### `.env` Configuration:
```bash
SERVER_IP=192.168.1.100  # Ganti dengan IP server Anda
CORS_ORIGINS=http://${SERVER_IP}:3000,http://${SERVER_IP}:80
NEXT_PUBLIC_API_URL=http://${SERVER_IP}:8000
```

**Status:** ✅ **Sudah siap pakai!**

---

## 🌐 Opsi 2: Setup Domain (Optional)

Jika Anda punya domain name (misal: `tamankehati.com`), ikuti langkah berikut:

### Step 1: Point Domain ke Server IP

**Di Domain Registrar (Namecheap, GoDaddy, dll):**

1. Login ke domain registrar
2. Go to DNS Management
3. Add A Record:
   ```
   Type: A
   Host: @
   Value: YOUR_SERVER_IP
   TTL: 3600
   ```

4. (Optional) Add www subdomain:
   ```
   Type: A
   Host: www
   Value: YOUR_SERVER_IP
   TTL: 3600
   ```

5. Wait for DNS propagation (5-60 minutes)

**Verify DNS:**
```bash
# Check if domain points to correct IP
dig yourdomain.com +short
# Should return YOUR_SERVER_IP
```

---

### Step 2: Update Nginx Configuration

**Di Server:**

```bash
cd /opt/tamankehati

# Backup current config
cp deploy-package/nginx/conf.d/default.conf deploy-package/nginx/conf.d/default.conf.backup

# Copy domain config template
cp deploy-package/nginx/conf.d/default-with-domain.conf deploy-package/nginx/conf.d/default.conf

# Edit config dengan domain Anda
nano deploy-package/nginx/conf.d/default.conf
```

**Ganti di config:**
- `yourdomain.com` → domain Anda (contoh: `tamankehati.com`)
- `www.yourdomain.com` → www domain Anda (contoh: `www.tamankehati.com`)

**Contoh:**
```nginx
server_name tamankehati.com www.tamankehati.com;
```

---

### Step 3: Setup SSL Certificate (Let's Encrypt)

**Di Server:**

```bash
# Install Certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Generate SSL certificate
# Certbot akan otomatis mengupdate Nginx config
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose redirect HTTP to HTTPS (recommended)
```

**Certbot akan:**
- ✅ Generate SSL certificate
- ✅ Auto-update Nginx config dengan SSL paths
- ✅ Setup auto-renewal

**Verify SSL:**
```bash
# Test auto-renewal
sudo certbot renew --dry-run
```

---

### Step 4: Update Environment Variables

**Update `.env` di server:**

```bash
cd /opt/tamankehati
nano .env
```

**Update values:**
```bash
# Domain configuration
DOMAIN=yourdomain.com

# CORS - Update dengan domain
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Frontend API URL - Update dengan domain
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
# Atau jika menggunakan subdomain:
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

**Restart services:**
```bash
docker compose -f docker-compose.pull.yml restart backend frontend
```

---

### Step 5: Update Docker Compose (Optional - untuk expose port 443)

**Jika menggunakan domain dengan HTTPS, pastikan port 443 exposed:**

`docker-compose.pull.yml` sudah support, tapi verify:

```yaml
nginx:
  ports:
    - "80:80"
    - "443:443"  # ← Pastikan ini ada untuk HTTPS
```

**Update firewall:**
```bash
# Allow HTTPS
sudo ufw allow 443/tcp

# Verify
sudo ufw status
```

---

## 🔍 Verification

### Check Domain Access:

```bash
# HTTP (should redirect to HTTPS)
curl -I http://yourdomain.com

# HTTPS
curl -I https://yourdomain.com

# API
curl https://yourdomain.com/api/health
```

### Check SSL Certificate:

```bash
# Check certificate info
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

---

## 📊 Comparison: IP vs Domain

| Aspect | IP-Based | Domain-Based |
|--------|----------|--------------|
| **Setup** | ✅ Simple | ⚠️ Perlu DNS setup |
| **SSL** | ❌ Tidak bisa (Let's Encrypt butuh domain) | ✅ Bisa pakai Let's Encrypt |
| **Professional** | ❌ Kurang professional | ✅ Lebih professional |
| **Security** | ⚠️ HTTP only | ✅ HTTPS dengan SSL |
| **SEO** | ❌ Tidak optimal | ✅ Lebih baik untuk SEO |
| **Cost** | ✅ Free | ⚠️ Perlu beli domain (~$10-15/tahun) |

---

## 🎯 Recommendation

### Untuk Production:
- ✅ **Gunakan domain** jika memungkinkan
- ✅ Setup SSL dengan Let's Encrypt (gratis)
- ✅ Lebih professional dan secure

### Untuk Testing/Development:
- ✅ **IP-based** cukup untuk testing
- ✅ Tidak perlu beli domain dulu

---

## 📝 Quick Checklist

### IP-Based (Current):
- [x] Nginx config sudah siap
- [x] `.env` template sudah ada
- [x] Firewall sudah dikonfigurasi
- [x] Ready to use!

### Domain-Based (Optional):
- [ ] Domain dibeli dan dikonfigurasi
- [ ] DNS A record pointing ke server IP
- [ ] Nginx config di-update dengan domain
- [ ] SSL certificate di-generate (Certbot)
- [ ] `.env` di-update dengan domain
- [ ] Firewall port 443 dibuka
- [ ] Services di-restart

---

## 🚀 Next Steps

**Jika ingin tetap menggunakan IP:**
→ Tidak perlu setup tambahan, langsung deploy!

**Jika ingin setup domain:**
→ Ikuti Step 1-5 di atas

---

**Last Updated:** 2025-11-04

