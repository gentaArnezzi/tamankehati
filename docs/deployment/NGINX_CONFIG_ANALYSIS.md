# 🔍 Analisis Nginx Config di Server

Penjelasan lengkap tentang Nginx configuration yang ada di server Anda.

---

## 📋 Struktur Directory yang Ada

```
~/dasmap_prod/apps/
├── amilna.co.id/      → Website amilna
├── dasmap.co.id/      → Website dasmap
├── goproject/         → Project go
├── nginx/             → Nginx config directory
│   ├── nginx.conf     → Main Nginx config
│   └── sites-enabled/ → Active server blocks
│       └── default    → Default server config (catch-all)
└── tamankehati/       → Taman Kehati (sudah ada directory!)
```

---

## 🔍 Analisis Nginx Config (`default`)

### File: `~/dasmap_prod/apps/nginx/sites-enabled/default`

```nginx
server {
    listen 80 default_server;      # ← Default server (catch-all)
    listen [::]:80 default_server;
    server_name _;                  # ← Catch-all (semua domain)

    location / {
        proxy_pass http://38.47.93.167:8081/;  # ← Proxy ke IP external
        # ... proxy headers ...
    }

    location /uploads/ {
        proxy_pass http://38.47.93.167:8081/uploads/;
        # ... proxy headers ...
    }

    location /mbtiles/ {
        proxy_pass http://172.27.0.4:8000/services/;  # ← Proxy ke Docker network IP
    }
}
```

---

## 📖 Penjelasan Detail

### 1. **`listen 80 default_server;`**

**Arti:**
- Server ini adalah **default server** untuk port 80
- Jika tidak ada server block lain yang match dengan request, server ini yang akan digunakan
- **Semua request** ke port 80 akan masuk ke server ini jika tidak ada yang match

**Contoh:**
- Request ke `http://dasmap.co.id` → Masuk ke server ini
- Request ke `http://amilna.co.id` → Masuk ke server ini
- Request ke `http://tamankehati.dasmap.co.id` → Masuk ke server ini (jika tidak ada server block khusus)

---

### 2. **`server_name _;`**

**Arti:**
- `_` adalah **wildcard** yang berarti "catch-all"
- Server ini akan **match dengan semua domain** yang tidak memiliki server block khusus
- Tidak ada domain spesifik yang di-handle oleh server ini

**Contoh:**
- `http://dasmap.co.id` → Match dengan server ini
- `http://amilna.co.id` → Match dengan server ini
- `http://tamankehati.dasmap.co.id` → Match dengan server ini (jika tidak ada server block khusus)
- `http://any-domain.com` → Match dengan server ini

---

### 3. **`location / { proxy_pass http://38.47.93.167:8081/; }`**

**Arti:**
- Semua request ke `/` akan di-proxy ke `http://38.47.93.167:8081/`
- `38.47.93.167:8081` kemungkinan adalah:
  - IP external server lain
  - Atau IP internal service
  - Atau IP dari service `go` yang running di port 8081

**Contoh Request:**
- `http://dasmap.co.id/` → Proxy ke `http://38.47.93.167:8081/`
- `http://dasmap.co.id/about` → Proxy ke `http://38.47.93.167:8081/about`

---

### 4. **`location /uploads/ { proxy_pass http://38.47.93.167:8081/uploads/; }`**

**Arti:**
- Request ke `/uploads/` akan di-proxy ke `http://38.47.93.167:8081/uploads/`
- Ini untuk handle file uploads dari website yang ada

**Contoh Request:**
- `http://dasmap.co.id/uploads/image.jpg` → Proxy ke `http://38.47.93.167:8081/uploads/image.jpg`

---

### 5. **`location /mbtiles/ { proxy_pass http://172.27.0.4:8000/services/; }`**

**Arti:**
- Request ke `/mbtiles/` akan di-proxy ke `http://172.27.0.4:8000/services/`
- `172.27.0.4` adalah **IP di dalam Docker network** `dasmap_prod_go-net`
- Ini adalah IP dari container yang ada di network Docker

**Contoh Request:**
- `http://dasmap.co.id/mbtiles/tile.json` → Proxy ke `http://172.27.0.4:8000/services/tile.json`

---

## 🎯 Implikasi untuk Taman Kehati

### ✅ Yang Sudah Ada:

1. **Nginx Config Location:**
   - ✅ Nginx config ada di `~/dasmap_prod/apps/nginx/sites-enabled/`
   - ✅ File `default` adalah default server (catch-all)

2. **Routing:**
   - ✅ `/` → Proxy ke `38.47.93.167:8081`
   - ✅ `/uploads/` → Proxy ke `38.47.93.167:8081/uploads/`
   - ✅ `/mbtiles/` → Proxy ke `172.27.0.4:8000/services/`

3. **Default Server:**
   - ✅ Semua request tanpa server block khusus akan masuk ke default server

---

### 🚀 Yang Perlu Ditambahkan untuk Taman Kehati:

**Option 1: Buat Server Block Baru (Recommended)**

Buat file baru `~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf`:

```nginx
# Taman Kehati Application
server {
    listen 80;
    server_name tamankehati.dasmap.co.id;  # Domain spesifik untuk Taman Kehati

    # Frontend
    location / {
        proxy_pass http://localhost:3000;  # Frontend container Taman Kehati
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;  # Backend container Taman Kehati
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend uploads
    location /uploads/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Backend docs
    location /docs {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**PENTING:** Server block ini harus **sebelum** default server block di file `default`, atau buat file baru dengan nama yang akan di-load lebih dulu (misalnya `00-tamankehati.conf`).

---

**Option 2: Tambahkan ke File Default (Alternatif)**

Edit file `~/dasmap_prod/apps/nginx/sites-enabled/default` dan tambahkan server block **sebelum** default server block:

```nginx
# Taman Kehati Application (Tambahkan di bagian atas)
server {
    listen 80;
    server_name tamankehati.dasmap.co.id;
    # ... config seperti di atas ...
}

# Default server (yang sudah ada)
server {
    listen 80 default_server;
    server_name _;
    # ... existing config ...
}
```

**PENTING:** Server block untuk `tamankehati.dasmap.co.id` harus **sebelum** default server block karena Nginx akan match dengan server block pertama yang cocok.

---

## 📊 Urutan Nginx Server Block Matching

Nginx akan match server block berdasarkan urutan:

1. **Server block dengan `server_name` yang cocok** → Match pertama
2. **Server block dengan `server_name` yang wildcard** → Jika tidak ada match spesifik
3. **Default server block** (`default_server`) → Jika tidak ada yang match

**Contoh:**
- Request ke `http://tamankehati.dasmap.co.id` → Match dengan server block `tamankehati.dasmap.co.id`
- Request ke `http://dasmap.co.id` → Match dengan default server block (karena tidak ada server block khusus untuk `dasmap.co.id`)

---

## ✅ Checklist untuk Taman Kehati

- [ ] Buat server block baru untuk `tamankehati.dasmap.co.id`
- [ ] Pastikan server block **sebelum** default server block
- [ ] Test Nginx config: `docker exec -it <go-container> nginx -t`
- [ ] Reload Nginx: `docker compose restart go` (di `~/dasmap_prod`)
- [ ] Setup DNS A record untuk `tamankehati.dasmap.co.id`
- [ ] Test akses: `http://tamankehati.dasmap.co.id`

---

## 🎯 Summary

**Yang Ada di Server:**
- ✅ Nginx config ada di `~/dasmap_prod/apps/nginx/sites-enabled/default`
- ✅ Default server (catch-all) untuk semua request
- ✅ Routing ke `38.47.93.167:8081` untuk website yang ada
- ✅ Routing ke `172.27.0.4:8000` untuk `/mbtiles/`

**Yang Perlu Ditambahkan:**
- ✅ Server block baru untuk `tamankehati.dasmap.co.id`
- ✅ Routing ke `localhost:3000` (Frontend)
- ✅ Routing ke `localhost:8000` (Backend API)

**Cara Kerja:**
- Request ke `tamankehati.dasmap.co.id` → Server block Taman Kehati
- Request ke domain lain → Default server block (website yang ada)

---

**Last Updated:** 2025-11-04

