# 🌐 Setup DNS di DCloud

Panduan untuk setup DNS A Record untuk subdomain `tamankehati.dasmap.co.id` di DCloud.

---

## 📋 Langkah-langkah Setup DNS

### Step 1: Buka Menu Email & Domain

1. **Login ke DCloud Dashboard**
   - URL: `https://my.dcloud.co.id`
   - Login dengan credentials Anda

2. **Klik Menu "Email & Domain"**
   - Menu ini ada di sidebar kiri (berwarna biru gelap)
   - Setelah klik, akan muncul halaman pengelolaan domain

---

### Step 2: Cari Domain dasmap.co.id

1. **Di halaman Email & Domain, cari domain `dasmap.co.id`**
   - Pastikan domain sudah terdaftar di DCloud
   - Jika belum, perlu registrasi domain dulu

2. **Klik domain `dasmap.co.id`** untuk melihat pengaturan DNS

---

### Step 3: Tambahkan DNS A Record

1. **Cari menu "DNS Management" atau "Zone Editor" atau "DNS Records"**
   - Nama menu bisa berbeda tergantung panel DCloud
   - Bisa juga ada di tab "DNS" atau "DNS Settings"

2. **Klik "Add Record" atau "Tambah Record"**

3. **Isi form DNS A Record:**
   ```
   Type: A
   Name: tamankehati
   Value: 38.47.93.167
   TTL: 3600 (atau Auto)
   ```

4. **Klik "Save" atau "Simpan"**

---

## 📝 Detail DNS A Record

**Yang perlu diisi:**

| Field | Value | Keterangan |
|-------|-------|------------|
| **Type** | `A` | Record type untuk IP address |
| **Name/Host** | `tamankehati` | Subdomain name (tanpa domain utama) |
| **Value/Content** | `38.47.93.167` | IP address server |
| **TTL** | `3600` atau `Auto` | Time to live (biasanya 3600 detik = 1 jam) |

**Hasil:**
- Subdomain: `tamankehati.dasmap.co.id`
- IP: `38.47.93.167`
- URL lengkap: `http://tamankehati.dasmap.co.id`

---

## 🔍 Cara Cek Jika Menu Tersedia

**Jika tidak menemukan menu "Email & Domain":**

1. **Cek apakah domain sudah terdaftar:**
   - Domain harus sudah terdaftar di DCloud
   - Jika belum, perlu registrasi domain dulu

2. **Cek di menu lain:**
   - Cari menu "DNS"
   - Cari menu "Domain Management"
   - Cari menu "Network" atau "Networking"
   - Cari menu "Settings" → "DNS"

3. **Contact DCloud Support:**
   - Jika tidak ada menu DNS, hubungi support DCloud
   - Tanyakan cara setup DNS A record untuk domain

---

## ⏱️ DNS Propagation

**Setelah setup DNS:**

1. **Wait DNS Propagation** (5-60 menit)
   - DNS changes tidak langsung aktif
   - Butuh waktu untuk propagate ke semua DNS server

2. **Test DNS Resolution:**
   ```bash
   # Test dengan dig
   dig tamankehati.dasmap.co.id +short
   # Should return: 38.47.93.167
   
   # Test dengan nslookup
   nslookup tamankehati.dasmap.co.id
   # Should show IP: 38.47.93.167
   
   # Test dengan ping
   ping tamankehati.dasmap.co.id
   # Should ping IP: 38.47.93.167
   ```

3. **Jika belum resolve:**
   - Tunggu lebih lama (bisa sampai 24 jam untuk first time)
   - Clear DNS cache: `sudo systemd-resolve --flush-caches` (Linux)
   - Atau pakai DNS lain: `8.8.8.8` (Google DNS)

---

## 🔄 Alternative: Setup DNS di Registrar

**Jika DCloud tidak punya fitur DNS management:**

1. **Login ke Domain Registrar** (tempat beli domain `dasmap.co.id`)
   - Bisa jadi Namecheap, GoDaddy, Cloudflare, dll
   - Atau jika domain di DCloud, cek apakah ada link ke registrar

2. **Setup DNS A Record di Registrar:**
   - Login ke registrar account
   - Cari "DNS Management" atau "Zone Editor"
   - Add A record: `tamankehati` → `38.47.93.167`

3. **Atau pakai Cloudflare** (free):
   - Transfer nameservers ke Cloudflare
   - Setup DNS di Cloudflare dashboard
   - Add A record: `tamankehati` → `38.47.93.167`

---

## 📊 Verifikasi DNS Setup

**Setelah DNS A record dibuat:**

```bash
# Test dari server
dig tamankehati.dasmap.co.id +short
# Expected: 38.47.93.167

# Test dari local machine
nslookup tamankehati.dasmap.co.id
# Expected: 38.47.93.167

# Test HTTP access (setelah Nginx config updated)
curl -I http://tamankehati.dasmap.co.id
# Expected: HTTP 200 atau 301 redirect
```

---

## 🎯 Next Steps Setelah DNS Setup

1. **✅ DNS A Record dibuat**
2. **⏳ Wait DNS propagation** (5-60 menit)
3. **✅ Test DNS resolution**
4. **✅ Update Nginx config** (lihat `MIGRATION_CHECKLIST.md`)
5. **✅ Rebuild frontend** dengan domain API URL
6. **✅ Test domain access**

---

## 📝 Quick Reference

**DNS A Record:**
```
Type: A
Name: tamankehati
Value: 38.47.93.167
TTL: 3600
```

**Expected Result:**
- `tamankehati.dasmap.co.id` → `38.47.93.167`

**Test Command:**
```bash
dig tamankehati.dasmap.co.id +short
```

---

## 💡 Tips

1. **TTL Recommendation:**
   - Production: `3600` (1 jam) - baik untuk flexibility
   - Development: `300` (5 menit) - lebih cepat update

2. **DNS Cache:**
   - Clear cache jika DNS sudah update tapi belum resolve
   - Pakai `8.8.8.8` (Google DNS) untuk test yang lebih cepat

3. **Multiple Records:**
   - Bisa tambah multiple A records untuk load balancing
   - Atau pakai CNAME untuk subdomain lain

---

**Last Updated:** 2025-11-05

