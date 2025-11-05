# Release History

Dokumentasi lengkap tentang semua release dan versi Taman Kehati Web Portal.

---

## Release Management

Sistem ini menggunakan **semantic versioning** (vMAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes atau perubahan besar
- **MINOR**: Fitur baru (backward compatible)
- **PATCH**: Bug fixes dan perbaikan kecil

Release otomatis dibuat setelah deployment berhasil melalui GitHub Actions workflow.

---

## Release History

### v1.0.0 (Initial Release)

**Release Date:** 2025-11-04  
**Status:** ✅ Production

**Features:**
- Initial release of Taman Kehati Web Portal
- Backend API (FastAPI)
- Frontend (Next.js)
- Database (PostgreSQL)
- AI Integration (Ollama)
- CI/CD Pipeline
- Telegram notifications

**Technical Details:**
- Backend: FastAPI + Python 3.11
- Frontend: Next.js + React
- Database: PostgreSQL
- Deployment: Docker Compose
- CI/CD: GitHub Actions

---

## How to View Releases

### GitHub Releases
Semua release dapat dilihat di: [GitHub Releases](https://github.com/your-org/tamankehati/releases)

### Git Tags
```bash
# List all tags
git tag -l

# View specific tag
git show v1.0.0

# Checkout specific release
git checkout v1.0.0
```

---

## Rollback Instructions

### Rollback to Previous Release

**Via Docker:**
```bash
# SSH to server
ssh user@38.47.93.167

# Navigate to deployment directory
cd ~/dasmap_prod/apps/tamankehati

# Update .env with previous version
echo "IMAGE_TAG=v1.0.0" > .env

# Pull and restart containers
docker compose -f docker-compose.pull.no-nginx.yml pull
docker compose -f docker-compose.pull.no-nginx.yml up -d
```

**Via Git:**
```bash
# Checkout previous tag
git checkout v1.0.0

# Rebuild and deploy
docker compose -f docker-compose.pull.no-nginx.yml build
docker compose -f docker-compose.pull.no-nginx.yml up -d
```

---

## Release Notes Template

Setiap release mencakup:

1. **Version Number** - Semantic versioning
2. **Release Date** - Tanggal release
3. **Changes** - List perubahan dari commit messages
4. **Technical Details** - Commit SHA, workflow run ID
5. **Deployment Status** - Status deployment
6. **Rollback Instructions** - Cara rollback jika diperlukan

---

## Versioning Strategy

### Automatic Version Detection

Release workflow otomatis menentukan versi berdasarkan commit messages:

- **Major Bump** (v1.0.0 → v2.0.0):
  - Commit mengandung: `breaking`, `major`, atau `!:`
  - Contoh: `fix!: remove deprecated API`

- **Minor Bump** (v1.0.0 → v1.1.0):
  - Commit mengandung: `feat`, `feature`, `add`, `new`
  - Contoh: `feat: add flora search feature`

- **Patch Bump** (v1.0.0 → v1.0.1):
  - Default untuk semua perubahan lainnya
  - Contoh: `fix: resolve timeout issue`

### Manual Version Override

Untuk override versi secara manual, edit workflow file atau gunakan workflow_dispatch dengan parameter.

---

## Monitoring & Health Checks

Setelah setiap release:
- Health check otomatis setiap 10 menit
- Daily success report jam 7 AM WIB
- Telegram notifications untuk status

Lihat: [Monitoring Workflow](../.github/workflows/monitoring.yml)

---

## Audit Trail

Setiap release tercatat dalam:
- GitHub Releases
- Git tags
- Telegram notifications
- Workflow run history

---

**Last Updated:** 2025-11-06  
**Maintained by:** DevOps Team  
**Documentation:** [Enterprise Workflow Guide](./enterprise-workflow.md)

