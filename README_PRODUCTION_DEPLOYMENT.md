# 🚀 Production Deployment - Quick Start

## Ubuntu Server Deployment

Untuk deploy aplikasi Taman Kehati ke server Ubuntu menggunakan Docker Compose:

### Quick Start (5 langkah)

1. **Copy environment file:**
   ```bash
   cp env.production.example .env
   ```

2. **Edit .env file dengan IP server Anda:**
   ```bash
   nano .env
   # Update: SERVER_IP, SECRET_KEY, POSTGRES_PASSWORD, NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SITE_URL, CORS_ORIGINS
   ```

3. **Build images:**
   ```bash
   docker compose -f docker-compose.prod.yml build
   ```

4. **Start services:**
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

5. **Verify deployment:**
   ```bash
   ./scripts/verify-deployment.sh
   ```

### Akses Aplikasi

- **Frontend:** http://YOUR_SERVER_IP:8080
- **Backend API:** http://YOUR_SERVER_IP:8080/api
- **Health Check:** http://YOUR_SERVER_IP:8080/health
- **API Docs:** http://YOUR_SERVER_IP:8080/docs

### KKH Server Note

Untuk server KKH saat ini, Dasmap memakai host `nginx` di port `80`. Jadi Taman Kehati sementara dipublikasikan di `8080` memakai container `nginx` sendiri agar tidak bentrok.

### Dokumentasi Lengkap

- 📘 [Ubuntu Server Deployment Guide](./docs/deployment/ubuntu-server-deployment.md)
- 📗 [Ubuntu Server Operations Guide](./docs/deployment/ubuntu-server-operations.md)
- 📕 [Security Checklist](./docs/deployment/PRODUCTION_SECURITY_CHECKLIST.md)
- ✅ [Deployment Checklist](./docs/CHECKLIST_DEPLOYMENT.md)

### Scripts yang Tersedia

- `scripts/verify-deployment.sh` - Verify semua services
- `scripts/backup-database.sh` - Backup database PostgreSQL
- `scripts/setup-kkh-server.sh` - Setup Docker dan firewall host KKH
- `scripts/deploy-kkh.sh` - Build dan jalankan stack production
- `scripts/install-kkh-nginx.sh` - Pasang reverse proxy host Nginx untuk KKH
- `scripts/restore-database.sh` - Restore dump PostgreSQL ke container production
- `scripts/restore-uploads.sh` - Restore file upload ke volume backend

### Troubleshooting

Lihat [Operations Guide](./docs/deployment/ubuntu-server-operations.md) untuk troubleshooting lengkap.

---
**Version:** 1.0.0
