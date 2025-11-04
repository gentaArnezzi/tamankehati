# 🔍 Troubleshooting: 405 Method Not Allowed

Panduan untuk mengatasi error "405 Method Not Allowed" saat mengakses via Nginx.

---

## 📋 Error yang Terjadi

```bash
curl -I http://38.47.93.167
# Response: HTTP/1.1 405 Method Not Allowed
# Allow: GET, OPTIONS
```

---

## ✅ Analisis

**Yang Terjadi:**
- ✅ Nginx sudah route dengan benar (terlihat dari response header)
- ✅ Request sampai ke aplikasi (Next.js)
- ❌ `curl -I` menggunakan **HEAD method**
- ❌ Next.js tidak support HEAD method untuk root path

**Ini BUKAN masalah routing!** Nginx sudah bekerja dengan benar.

---

## 🔧 Solusi

### Test dengan GET Request (Bukan HEAD)

**Gunakan `curl` tanpa flag `-I`:**

```bash
# Test frontend dengan GET (bukan HEAD)
curl http://38.47.93.167

# Test backend API
curl http://38.47.93.167/api/health
```

**Expected output:**
- Frontend: HTML content dari Next.js
- Backend: `{"status":"ok"}`

---

## 📝 Penjelasan Methods

### HEAD Method (`curl -I`)
- Mengirim HEAD request (hanya header, tidak ada body)
- Beberapa aplikasi tidak support HEAD untuk semua path
- Next.js mungkin tidak support HEAD untuk root path

### GET Method (`curl` tanpa flag)
- Mengirim GET request (standard request)
- Semua aplikasi support GET
- Recommended untuk test

---

## ✅ Test yang Benar

### 1. Test Frontend

```bash
# GET request (recommended)
curl http://38.47.93.167

# Atau dengan verbose untuk lihat full response
curl -v http://38.47.93.167 | head -50
```

**Expected:** HTML content dari Next.js (bukan 405)

---

### 2. Test Backend API

```bash
# GET request
curl http://38.47.93.167/api/health
```

**Expected:** `{"status":"ok"}`

---

### 3. Test dari Browser

**Buka browser:**
```
http://38.47.93.167
```

**Expected:** Frontend aplikasi Taman Kehati tampil

---

## 🎯 Kesimpulan

**405 Error BUKAN masalah routing!**

- ✅ Nginx sudah route dengan benar
- ✅ Request sampai ke aplikasi
- ❌ Hanya HEAD method yang tidak support

**Solusi:** Gunakan GET request (tanpa flag `-I`) atau test dari browser.

---

## 📋 Quick Test Commands

```bash
# Test frontend (GET)
curl http://38.47.93.167 | head -20

# Test backend (GET)
curl http://38.47.93.167/api/health

# Test dengan browser
# Buka: http://38.47.93.167
```

---

**Last Updated:** 2025-11-04


