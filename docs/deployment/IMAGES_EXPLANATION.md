# 🐳 Penjelasan Docker Images untuk Deployment

## Overview

Aplikasi Taman Kehati menggunakan **6 services** total, tetapi hanya **2 images yang perlu di-build** (custom images dari source code kita).

---

## ✅ Custom Images (Yang Kita Build)

### 1. Backend API
- **Image:** `docker.io/arnezzi/tamankehati-backend:v1.0.0`
- **Source:** `apps/backend/`
- **Dockerfile:** `apps/backend/Dockerfile`
- **Status:** ✅ **Sudah di-build dan di-push**
- **Size:** ~746MB
- **Alasan build:** Ini adalah aplikasi custom kita dengan business logic, API endpoints, database models, dll.

### 2. Frontend Next.js
- **Image:** `docker.io/arnezzi/tamankehati-frontend:v1.0.0`
- **Source:** `apps/frontend/`
- **Dockerfile:** `apps/frontend/Dockerfile`
- **Status:** ✅ **Sudah di-build dan di-push**
- **Size:** ~192MB
- **Alasan build:** Ini adalah aplikasi React/Next.js custom kita dengan UI components, pages, dll.

---

## 📦 Official Images (Tidak Perlu Build)

Services berikut menggunakan **official images** dari Docker Hub yang **tidak perlu di-build**. Mereka akan di-pull otomatis saat deployment di server.

### 3. PostgreSQL Database
- **Image:** `postgres:15-alpine`
- **Source:** Official PostgreSQL image
- **Status:** ⏳ **Akan di-pull otomatis di server**
- **Alasan tidak build:**
  - Official image yang sudah di-maintain oleh PostgreSQL team
  - Kita hanya perlu configure via environment variables
  - Tidak ada custom code yang perlu di-build

### 4. Redis Cache
- **Image:** `redis:7-alpine`
- **Source:** Official Redis image
- **Status:** ⏳ **Akan di-pull otomatis di server**
- **Alasan tidak build:**
  - Official image yang sudah di-maintain oleh Redis team
  - Kita hanya perlu configure via command arguments
  - Tidak ada custom code yang perlu di-build

### 5. Ollama AI Server
- **Image:** `ollama/ollama:latest`
- **Source:** Official Ollama image
- **Status:** ⏳ **Akan di-pull otomatis di server**
- **Alasan tidak build:**
  - Official image yang sudah di-maintain oleh Ollama team
  - LLM server yang sudah ready-to-use
  - Kita hanya perlu configure via environment variables

### 6. Nginx Reverse Proxy
- **Image:** `nginx:alpine`
- **Source:** Official Nginx image
- **Status:** ⏳ **Akan di-pull otomatis di server**
- **Alasan tidak build:**
  - Official image yang sudah di-maintain oleh Nginx team
  - Kita hanya perlu mount config files (tidak perlu build)
  - Config files ada di `deploy-package/nginx/`

---

## 🔄 Workflow Deployment

### Di Local (Build Phase)
```bash
# Hanya build 2 custom images:
✅ tamankehati-backend:v1.0.0
✅ tamankehati-frontend:v1.0.0

# Push ke Docker Hub
✅ docker push docker.io/arnezzi/tamankehati-backend:v1.0.0
✅ docker push docker.io/arnezzi/tamankehati-frontend:v1.0.0
```

### Di Server (Deploy Phase)
```bash
# Pull 2 custom images dari registry kita:
docker pull docker.io/arnezzi/tamankehati-backend:v1.0.0
docker pull docker.io/arnezzi/tamankehati-frontend:v1.0.0

# Pull 4 official images otomatis via docker-compose:
# ✅ postgres:15-alpine (dari Docker Hub)
# ✅ redis:7-alpine (dari Docker Hub)
# ✅ ollama/ollama:latest (dari Docker Hub)
# ✅ nginx:alpine (dari Docker Hub)
```

Saat server menjalankan `docker compose -f docker-compose.pull.yml pull`, Docker akan:
1. Pull 2 custom images dari registry kita (arnezzi/tamankehati-*)
2. Pull 4 official images langsung dari Docker Hub

---

## 📊 Summary Table

| Service | Image Source | Need Build? | Status |
|---------|-------------|-------------|--------|
| **Backend** | `arnezzi/tamankehati-backend:v1.0.0` | ✅ Yes | ✅ Built & Pushed |
| **Frontend** | `arnezzi/tamankehati-frontend:v1.0.0` | ✅ Yes | ✅ Built & Pushed |
| **PostgreSQL** | `postgres:15-alpine` | ❌ No | ⏳ Pull on server |
| **Redis** | `redis:7-alpine` | ❌ No | ⏳ Pull on server |
| **Ollama** | `ollama/ollama:latest` | ❌ No | ⏳ Pull on server |
| **Nginx** | `nginx:alpine` | ❌ No | ⏳ Pull on server |

---

## 💡 Kenapa Hanya 2 Images?

### Custom Images (Perlu Build)
- **Backend & Frontend** = Source code aplikasi kita
- Berisi business logic, API endpoints, UI components
- Setiap perubahan code = perlu rebuild

### Official Images (Tidak Perlu Build)
- **PostgreSQL, Redis, Ollama, Nginx** = Infrastructure services
- Official images sudah di-maintain oleh masing-masing team
- Kita hanya perlu configure via:
  - Environment variables
  - Volume mounts
  - Config files (untuk Nginx)

---

## 🔍 Verification

### Check Images yang Sudah di-Build:
```bash
docker images | grep arnezzi/tamankehati
```

**Output:**
```
arnezzi/tamankehati-backend   v1.0.0    ...    746MB
arnezzi/tamankehati-frontend v1.0.0    ...    192MB
```

### Check Official Images (akan terlihat setelah pull di server):
```bash
docker images | grep -E "postgres|redis|ollama|nginx"
```

**Output (di server setelah pull):**
```
postgres:15-alpine    ...    200MB
redis:7-alpine       ...    30MB
ollama/ollama        latest  ...    1.2GB
nginx:alpine         ...    40MB
```

---

## ✅ Kesimpulan

**Hanya 2 images yang perlu di-build** karena:
1. Backend & Frontend = aplikasi custom kita
2. Lainnya = official images yang sudah ready-to-use

**Total images saat deployment di server:**
- 2 custom images (dari registry kita)
- 4 official images (dari Docker Hub)

**Semua akan di-pull otomatis** saat server menjalankan:
```bash
docker compose -f docker-compose.pull.yml pull
```

---

**Last Updated:** 2025-11-04

