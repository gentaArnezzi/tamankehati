# ✅ Deployment Checklist - Taman Kehati

Checklist lengkap untuk memastikan deployment berjalan dengan baik.

---

## 📋 Pre-Deployment Checklist

### Server Preparation

- [ ] Server memiliki Docker 20.10+ dan Docker Compose 2.0+
- [ ] Minimum 4GB RAM tersedia (recommended: 8GB+)
- [ ] Minimum 20GB disk space tersedia
- [ ] Firewall configured untuk allow ports: 80, 443, 8000, 3000 (jika perlu)
- [ ] Domain name configured (jika menggunakan custom domain)

### Repository & Code

- [ ] Repository sudah di-clone ke server
- [ ] Semua file lengkap dan tidak ada yang corrupted
- [ ] Branch yang digunakan adalah production-ready branch

### Environment Configuration

- [ ] File `.env` sudah dibuat dari `env.example`
- [ ] **SECRET_KEY** sudah digenerate dan di-set (minimal 32 karakter)
- [ ] **POSTGRES_PASSWORD** sudah di-set dengan password yang kuat
- [ ] **CORS_ORIGINS** sudah di-set dengan domain production
- [ ] **NEXT_PUBLIC_API_URL** sudah di-set dengan URL backend yang benar
- [ ] **ENVIRONMENT** di-set ke `"production"`
- [ ] **DEBUG** di-set ke `"false"`
- [ ] **ADMIN_EMAIL** sudah di-set (atau gunakan default)
- [ ] **ADMIN_PASSWORD** sudah di-set (atau gunakan default)

### Security

- [ ] File `.env` tidak di-commit ke repository (check `.gitignore`)
- [ ] Default passwords sudah diubah
- [ ] Firewall enabled (optional tapi recommended)
- [ ] SSL certificate sudah disiapkan (jika menggunakan HTTPS)

---

## 🚀 Deployment Steps Checklist

### Step 1: Build Images

- [ ] Run: `docker-compose -f docker-compose.prod.yml build`
- [ ] Build completed tanpa error
- [ ] All images successfully built:
  - [ ] Backend image
  - [ ] Frontend image
  - [ ] Database image (PostgreSQL)
  - [ ] Redis image

### Step 2: Start Services

- [ ] Run: `docker-compose -f docker-compose.prod.yml up -d`
- [ ] All services started successfully:
  - [ ] PostgreSQL container running
  - [ ] Redis container running
  - [ ] Backend container running
  - [ ] Frontend container running

### Step 3: Verify Services

- [ ] Check service status: `docker-compose -f docker-compose.prod.yml ps`
- [ ] All services showing as "Up" (tidak ada "Exit" atau "Restarting")
- [ ] Check logs: `docker-compose -f docker-compose.prod.yml logs` (tidak ada error critical)

### Step 4: Database Migration

- [ ] Backend logs menunjukkan "Database connection successful"
- [ ] Backend logs menunjukkan "Running database migrations"
- [ ] Migration completed tanpa error
- [ ] Check migration status: `docker-compose -f docker-compose.prod.yml exec backend alembic current`

### Step 5: Admin User Creation

- [ ] Backend logs menunjukkan "Initializing admin user"
- [ ] Admin user created successfully atau sudah exists
- [ ] Admin credentials logged in console:
  - [ ] Email: _______________
  - [ ] Password: _______________

### Step 6: Health Checks

- [ ] Backend health check: `curl http://localhost:8000/health`
  - [ ] Returns: `{"status":"ok"}`
- [ ] Frontend accessible: `curl http://localhost:3000`
  - [ ] Returns HTML content
- [ ] API docs accessible: `curl http://localhost:8000/docs`
  - [ ] Returns Swagger UI HTML

---

## 🌐 Post-Deployment Checklist

### Application Access

- [ ] Frontend accessible di browser: http://your-server-ip:3000
- [ ] Backend API accessible: http://your-server-ip:8000
- [ ] API documentation accessible: http://your-server-ip:8000/docs
- [ ] Frontend bisa connect ke backend (no CORS errors di browser console)

### Authentication

- [ ] Bisa login dengan admin credentials
- [ ] Dashboard accessible setelah login
- [ ] **CHANGED admin password** setelah login pertama ✅

### Functionality Testing

- [ ] Create/Read/Update/Delete operations working
- [ ] File upload working
- [ ] Database queries working
- [ ] API endpoints responding correctly

### Reverse Proxy (If Applicable)

- [ ] Nginx configured (jika menggunakan)
- [ ] SSL certificate installed dan working (jika menggunakan HTTPS)
- [ ] Domain pointing ke correct IP address
- [ ] HTTP redirects ke HTTPS (jika menggunakan SSL)

### Monitoring

- [ ] Logs accessible: `docker-compose -f docker-compose.prod.yml logs`
- [ ] No critical errors in logs
- [ ] Services healthy (check dengan `docker-compose ps`)

---

## 🔐 Security Post-Deployment

- [ ] Admin password sudah diubah dari default
- [ ] Database password kuat dan tidak shared
- [ ] SECRET_KEY kuat dan tidak exposed
- [ ] CORS_ORIGINS restricted ke domain production only
- [ ] Firewall enabled (jika diperlukan)
- [ ] SSL/TLS configured (jika accessible dari internet)
- [ ] Regular backup schedule setup (database & uploads)

---

## 🔄 Backup & Maintenance

### Initial Backup

- [ ] Database backup created:
  ```bash
  docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U kehati_user kehati_db > backup_initial.sql
  ```
- [ ] Backup file stored di safe location

### Maintenance Schedule Setup

- [ ] Database backup script created dan scheduled
- [ ] Log rotation configured
- [ ] Update schedule planned (Docker images, dependencies)

---

## 📊 Performance Verification

- [ ] Response time < 2 seconds untuk API calls
- [ ] Frontend loads < 3 seconds
- [ ] Database queries optimized (check slow query log)
- [ ] Memory usage reasonable (check dengan `docker stats`)
- [ ] Disk space sufficient

---

## 🐛 Troubleshooting Verification

Test common scenarios:

- [ ] Service restart works: `docker-compose -f docker-compose.prod.yml restart`
- [ ] Service stop/start works: `docker-compose stop` lalu `docker-compose start`
- [ ] Logs accessible untuk debugging
- [ ] Database connection recovery works setelah restart

---

## 📝 Documentation

- [ ] Deployment guide reviewed dan understood
- [ ] Troubleshooting guide accessible
- [ ] Contact information untuk support documented
- [ ] Credentials stored securely (password manager atau encrypted file)

---

## ✅ Final Verification

- [ ] All services running dan healthy
- [ ] Application accessible dari browser
- [ ] Authentication working
- [ ] Core functionality tested
- [ ] Security measures in place
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] Documentation complete

---

## 🎉 Deployment Complete!

Jika semua checklist items sudah dicentang ✅, deployment Anda selesai!

**Next Steps:**
1. Monitor application untuk beberapa hari pertama
2. Setup regular backups
3. Plan untuk updates dan maintenance
4. Document any custom configurations

---

**Note:** Checklist ini harus di-review dan di-approve sebelum production deployment.

