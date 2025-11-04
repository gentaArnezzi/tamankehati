# 🌐 Panduan Setup DNS untuk Subdomain

Panduan lengkap untuk setup DNS A record di domain registrar untuk subdomain `tamankehati.dasmap.co.id`.

---

## 📋 Prerequisites

**Yang perlu diketahui:**
- Domain: `dasmap.co.id`
- Subdomain: `tamankehati`
- IP Server: `38.47.93.167`
- Domain Registrar: (dimana domain `dasmap.co.id` di-register)

---

## 🔍 Step 1: Cari Domain Registrar

**Cara cek dimana domain di-register:**

### Opsi 1: Cek via WHOIS

```bash
whois dasmap.co.id | grep -i registrar
```

**Atau pakai website:**
- https://whois.net
- https://who.is
- Masukkan: `dasmap.co.id`

### Opsi 2: Cek Email

**Cek email registrasi domain** - biasanya ada info dari registrar.

### Opsi 3: Cek Provider Populer

**Domain registrar populer di Indonesia:**
- **Niagahoster** (https://www.niagahoster.co.id)
- **IDCloudHost** (https://www.idcloudhost.com)
- **Rumahweb** (https://www.rumahweb.com)
- **Domainesia** (https://www.domainesia.com)
- **CloudKilat** (https://www.cloudkilat.com)
- **Namecheap** (https://www.namecheap.com)
- **GoDaddy** (https://www.godaddy.com)

**Coba login ke provider yang paling mungkin digunakan.**

---

## 🔧 Step 2: Login ke Domain Registrar

1. **Buka website registrar** (contoh: niagahoster.co.id)
2. **Login** dengan akun yang digunakan untuk register domain
3. **Cari menu "Domain Management" atau "DNS Management"**

---

## 📝 Step 3: Setup DNS A Record

### Cara Umum (Kebanyakan Registrar):

**1. Masuk ke DNS Management:**
- Pilih domain `dasmap.co.id`
- Klik "DNS Management" atau "Zone Editor" atau "DNS Settings"

**2. Tambah A Record:**
- Klik "Add Record" atau "Tambah Record"
- Pilih type: **A Record** atau **A**

**3. Isi Form:**
```
Type: A
Host/Name: tamankehati
Value/Points To: 38.47.93.167
TTL: 3600 (atau Default)
```

**4. Save/Submit**

---

## 📋 Contoh Setup per Registrar

### Niagahoster

1. Login → **Domain** → Pilih `dasmap.co.id`
2. **DNS Management** → **Tambah Record**
3. Isi:
   - **Type:** A
   - **Name:** tamankehati
   - **Value:** 38.47.93.167
   - **TTL:** 3600
4. **Simpan**

---

### IDCloudHost

1. Login → **Domain** → Pilih `dasmap.co.id`
2. **DNS Zone Editor** → **Tambah Record**
3. Isi:
   - **Type:** A
   - **Host:** tamankehati
   - **Points To:** 38.47.93.167
   - **TTL:** 3600
4. **Submit**

---

### Rumahweb

1. Login → **Domain** → Pilih `dasmap.co.id`
2. **DNS Management** → **Tambah Record**
3. Isi:
   - **Type:** A
   - **Hostname:** tamankehati
   - **Address:** 38.47.93.167
   - **TTL:** 3600
4. **Simpan**

---

### Domainesia

1. Login → **Domain** → Pilih `dasmap.co.id`
2. **DNS Zone** → **Tambah Record**
3. Isi:
   - **Type:** A
   - **Name:** tamankehati
   - **Value:** 38.47.93.167
   - **TTL:** 3600
4. **Simpan**

---

### Namecheap

1. Login → **Domain List** → Pilih `dasmap.co.id`
2. **Advanced DNS** → **Add New Record**
3. Isi:
   - **Type:** A Record
   - **Host:** tamankehati
   - **Value:** 38.47.93.167
   - **TTL:** Automatic (atau 3600)
4. **Save All Changes**

---

### GoDaddy

1. Login → **My Products** → Pilih `dasmap.co.id`
2. **DNS** → **Add**
3. Isi:
   - **Type:** A
   - **Name:** tamankehati
   - **Value:** 38.47.93.167
   - **TTL:** 600 (default)
4. **Save**

---

## ✅ Step 4: Verify DNS

**Tunggu 5-60 menit untuk DNS propagation, lalu test:**

### Test via Command Line:

```bash
# Test DNS resolution
dig tamankehati.dasmap.co.id +short
# Expected: 38.47.93.167

# Atau pakai nslookup
nslookup tamankehati.dasmap.co.id
# Expected: 38.47.93.167

# Atau pakai host
host tamankehati.dasmap.co.id
# Expected: tamankehati.dasmap.co.id has address 38.47.93.167
```

### Test via Browser:

```
http://tamankehati.dasmap.co.id
```

**Expected:** Website Taman Kehati muncul

---

## 🔍 Step 5: Cek DNS Propagation

**Jika DNS belum resolve, cek propagation:**

### Tools Online:

1. **https://dnschecker.org**
   - Masukkan: `tamankehati.dasmap.co.id`
   - Pilih type: **A**
   - Cek hasil di berbagai lokasi

2. **https://www.whatsmydns.net**
   - Masukkan: `tamankehati.dasmap.co.id`
   - Cek hasil

3. **https://mxtoolbox.com/DNSLookup.aspx**
   - Masukkan: `tamankehati.dasmap.co.id`
   - Cek hasil

**Expected:** Semua lokasi menunjukkan IP `38.47.93.167`

---

## ⚠️ Troubleshooting

### DNS Tidak Resolve

**Masalah:** `tamankehati.dasmap.co.id` tidak resolve ke IP

**Solusi:**
1. **Cek A record sudah benar:**
   - Host: `tamankehati` (bukan `tamankehati.dasmap.co.id`)
   - Value: `38.47.93.167`
   - TTL: 3600

2. **Tunggu lebih lama:**
   - DNS propagation bisa 5-60 menit
   - Kadang sampai 24 jam (jarang)

3. **Flush DNS cache:**
   ```bash
   # Di local machine (Mac/Linux)
   sudo dscacheutil -flushcache
   
   # Atau restart network
   sudo ifconfig en0 down && sudo ifconfig en0 up
   ```

4. **Cek di server:**
   ```bash
   # Test dari server
   dig tamankehati.dasmap.co.id +short
   ```

---

### Subdomain Masih Tidak Bisa Diakses

**Masalah:** DNS sudah resolve, tapi website tidak muncul

**Solusi:**
1. **Cek Nginx config:**
   ```bash
   docker exec -it dasmap_prod-go-1 cat /etc/nginx/sites-enabled/tamankehati.conf | grep server_name
   ```
   **Expected:** `server_name tamankehati.dasmap.co.id;`

2. **Test Nginx:**
   ```bash
   docker exec -it dasmap_prod-go-1 nginx -t
   docker exec -it dasmap_prod-go-1 nginx -s reload
   ```

3. **Cek container running:**
   ```bash
   docker ps | grep tamankehati
   ```

---

## 📋 Quick Reference

**DNS A Record:**
```
Type: A
Host: tamankehati
Value: 38.47.93.167
TTL: 3600
```

**Expected Result:**
- `tamankehati.dasmap.co.id` → `38.47.93.167`
- Website accessible via: `http://tamankehati.dasmap.co.id`

**Test Command:**
```bash
dig tamankehati.dasmap.co.id +short
# Expected: 38.47.93.167
```

---

## 🎯 Checklist

- [ ] Login ke domain registrar
- [ ] Masuk ke DNS Management untuk `dasmap.co.id`
- [ ] Tambah A Record:
  - [ ] Type: A
  - [ ] Host: tamankehati
  - [ ] Value: 38.47.93.167
  - [ ] TTL: 3600
- [ ] Save/Submit
- [ ] Tunggu 5-60 menit
- [ ] Test DNS: `dig tamankehati.dasmap.co.id +short`
- [ ] Test website: `curl http://tamankehati.dasmap.co.id`
- [ ] Update Nginx config (jika perlu)
- [ ] Reload Nginx: `docker exec -it dasmap_prod-go-1 nginx -s reload`

---

**Last Updated:** 2025-11-04


