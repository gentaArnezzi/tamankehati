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
   # Update: SERVER_IP, SECRET_KEY, POSTGRES_PASSWORD, NEXT_PUBLIC_API_URL, CORS_ORIGINS
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

- **Frontend:** http://YOUR_SERVER_IP:3000 atau http://YOUR_SERVER_IP (via Nginx)
- **Backend API:** http://YOUR_SERVER_IP:8000 atau http://YOUR_SERVER_IP/api (via Nginx)
- **API Docs:** http://YOUR_SERVER_IP:8000/docs

### Dokumentasi Lengkap

- 📘 [Ubuntu Server Deployment Guide](./docs/deployment/ubuntu-server-deployment.md)
- 📗 [Ubuntu Server Operations Guide](./docs/deployment/ubuntu-server-operations.md)
- 📕 [Security Checklist](./docs/deployment/PRODUCTION_SECURITY_CHECKLIST.md)
- ✅ [Deployment Checklist](./docs/CHECKLIST_DEPLOYMENT.md)

### Scripts yang Tersedia

- `scripts/verify-deployment.sh` - Verify semua services
- `scripts/backup-database.sh` - Backup database PostgreSQL

### Troubleshooting

Lihat [Operations Guide](./docs/deployment/ubuntu-server-operations.md) untuk troubleshooting lengkap.

---
**Version:** 1.0.0
