# 📁 Penjelasan Struktur Folder

Perbedaan struktur folder antara aplikasi Taman Kehati dengan aplikasi lain di server.

---

## 📋 Perbandingan Struktur

### goproject (Static/Go Application)

```
goproject/
├── www/                    ← Static files (HTML, JS, CSS)
│   ├── assets/
│   ├── index.html
│   ├── lib/
│   └── ...
├── godasmap                ← Binary executable
├── start.sh
├── data/
└── ...
```

**Karakteristik:**
- ✅ Static files di folder `www/`
- ✅ Binary executable di root
- ✅ Traditional deployment (files di server)
- ✅ Nginx serve static files dari `www/`

---

### tamankehati (Docker Container Application)

```
tamankehati/
├── docker-compose.pull.no-nginx.yml  ← Docker Compose config
├── .env                              ← Environment variables
├── deploy-package/
│   └── nginx/
│       └── server-nginx-example.conf
└── scripts/
    └── verify-deployment.sh
❌ TIDAK ada folder www/
```

**Karakteristik:**
- ✅ **Semua di Docker image** (tidak perlu static files di server)
- ✅ Next.js build sudah di dalam Docker image
- ✅ Container running, bukan static files
- ✅ Nginx route ke container, bukan serve static files

---

## 💡 Kenapa Tidak Perlu Folder `www/`?

### goproject (Traditional):
```
Server File System:
goproject/www/index.html  → Nginx serve langsung
goproject/www/assets/     → Nginx serve langsung
```

### tamankehati (Containerized):
```
Docker Container:
tamankehati-frontend-prod (container)
  └── .next/              ← Build files di dalam container
  └── public/             ← Static files di dalam container
  └── Running Next.js server di port 3000

Server File System:
tamankehati/              ← Hanya config files
  └── docker-compose.yml  ← Config untuk pull containers
  └── .env                ← Environment variables
  ❌ TIDAK ada www/        ← Tidak perlu!
```

---

## 🎯 Nginx Routing

### goproject:
```nginx
location / {
    root /path/to/goproject/www;  # Serve static files
    index index.html;
}
```

### tamankehati:
```nginx
location / {
    proxy_pass http://localhost:3000;  # Route ke container
    # ... proxy headers
}
```

---

## ✅ Struktur yang Benar untuk Taman Kehati

**Di server:**
```
~/dasmap_prod/apps/tamankehati/
├── docker-compose.pull.no-nginx.yml  ✅
├── .env                              ✅
├── deploy-package/                  ✅
│   └── nginx/
│       └── server-nginx-example.conf
└── scripts/                         ✅
    └── verify-deployment.sh
```

**TIDAK perlu:**
- ❌ `www/` folder (static files)
- ❌ `apps/frontend/` (source code)
- ❌ `apps/backend/` (source code)
- ❌ `node_modules/` (dependencies)
- ❌ Build files (sudah di Docker image)

---

## 📊 Summary

| Aspect | goproject | tamankehati |
|--------|-----------|-------------|
| **Deployment Type** | Static files | Docker containers |
| **Folder `www/`** | ✅ Required | ❌ Not needed |
| **Source Code** | ✅ In server | ❌ In Docker image |
| **Build Files** | ✅ In server | ❌ In Docker image |
| **Nginx** | Serve static files | Route to containers |
| **Files Needed** | Source + build | Config only |

---

## ✅ Kesimpulan

**TIDAK perlu folder `www/` untuk Taman Kehati** karena:

1. ✅ **Next.js build sudah di Docker image**
   - Build files ada di container
   - Tidak perlu di server

2. ✅ **Container running, bukan static files**
   - Next.js server running di container
   - Nginx route ke container (port 3000)

3. ✅ **Source code tidak perlu di server**
   - Semua sudah di-build di local
   - Images sudah di-push ke Docker Hub
   - Server hanya pull dan run containers

**Struktur yang benar:** Hanya config files (docker-compose, .env, nginx config)

---

**Last Updated:** 2025-11-04

