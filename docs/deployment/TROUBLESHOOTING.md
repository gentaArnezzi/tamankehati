# 🆘 Troubleshooting Guide

Panduan troubleshooting untuk masalah umum saat deployment aplikasi Taman Kehati.

---

## 🔴 Containers Tidak Starting

### Problem: Container fails to start

**Check logs:**
```bash
cd ~/dasmap_prod/apps/tamankehati
docker compose -f docker-compose.pull.no-nginx.yml logs

# Check specific service
docker compose -f docker-compose.pull.no-nginx.yml logs backend
docker compose -f docker-compose.pull.no-nginx.yml logs frontend
docker compose -f docker-compose.pull.no-nginx.yml logs postgres
```

**Common causes:**
1. **Image not found** → Images belum di-pull dari Docker Hub
   ```bash
   docker compose -f docker-compose.pull.no-nginx.yml pull
   ```

2. **Port conflict** → Port sudah digunakan
   ```bash
   sudo netstat -tulpn | grep -E ":3000|:8000"
   # Jika port in use, stop conflicting service atau change port
   ```

3. **Environment variables missing** → `.env` tidak lengkap
   ```bash
   cat .env | grep -E "SERVER_IP|DOCKER_USERNAME|IMAGE_TAG|SECRET_KEY"
   ```

---

## 🔴 Port Conflicts

### Problem: Port 3000 atau 8000 sudah digunakan

**Check:**
```bash
sudo netstat -tulpn | grep -E ":3000|:8000"
```

**Solution:**
```bash
# Option 1: Stop conflicting service
sudo systemctl stop conflicting-service

# Option 2: Change port di docker-compose
# Edit docker-compose.pull.no-nginx.yml:
# ports:
#   - "3001:3000"  # Change external port
#   - "8001:8000"  # Change external port
```

---

## 🔴 Nginx Not Routing

### Problem: Nginx tidak route ke containers

**Check Nginx config:**
```bash
cat ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
```

**Check Nginx logs:**
```bash
cd ~/dasmap_prod
docker compose logs go | grep -i nginx
docker compose logs go | grep -i error
```

**Common issues:**
1. **Config file tidak ada** → Create config file
   ```bash
   cd ~/dasmap_prod/apps/nginx/sites-enabled
   sudo nano tamankehati.conf
   # Copy config dari deploy-package/nginx/server-nginx-example.conf
   ```

2. **Service go tidak reload** → Restart service
   ```bash
   cd ~/dasmap_prod
   docker compose restart go
   ```

3. **Proxy_pass salah** → Check proxy_pass points to correct port
   ```nginx
   proxy_pass http://localhost:3000;  # Frontend
   proxy_pass http://localhost:8000;  # Backend
   ```

---

## 🔴 Database Connection Failed

### Problem: Backend tidak bisa connect ke database

**Check database container:**
```bash
docker compose -f docker-compose.pull.no-nginx.yml logs postgres
docker compose -f docker-compose.pull.no-nginx.yml ps postgres
```

**Check connection:**
```bash
# Test connection
docker compose -f docker-compose.pull.no-nginx.yml exec postgres psql -U tamankehati_user -d tamankehati_db -c "SELECT 1;"
```

**Common issues:**
1. **Database not ready** → Wait for database to be healthy
   ```bash
   docker compose -f docker-compose.pull.no-nginx.yml ps postgres
   # Check health status
   ```

2. **Wrong credentials** → Check `.env` DATABASE_URL
   ```bash
   grep DATABASE_URL .env
   ```

3. **Network issue** → Check network isolation
   ```bash
   docker network inspect tamankehati-network
   ```

---

## 🔴 Images Not Found

### Problem: Docker pull fails atau image not found

**Check Docker Hub login:**
```bash
docker login
```

**Check image exists:**
```bash
docker pull docker.io/arnezzi/tamankehati-backend:v1.0.0
docker pull docker.io/arnezzi/tamankehati-frontend:v1.0.0
```

**Common issues:**
1. **Not logged in** → Login to Docker Hub
   ```bash
   docker login
   ```

2. **Wrong image tag** → Check `.env` IMAGE_TAG
   ```bash
   grep IMAGE_TAG .env
   ```

3. **Network issue** → Check internet connection
   ```bash
   ping docker.io
   ```

---

## 🔴 CORS Errors

### Problem: CORS errors di browser console

**Check CORS configuration:**
```bash
grep CORS_ORIGINS ~/dasmap_prod/apps/tamankehati/.env
```

**Common issues:**
1. **CORS_ORIGINS tidak include domain** → Update `.env`
   ```bash
   CORS_ORIGINS=https://dasmap.co.id,https://www.dasmap.co.id,https://tamankehati.dasmap.co.id
   ```

2. **Backend not restarted** → Restart backend
   ```bash
   docker compose -f docker-compose.pull.no-nginx.yml restart backend
   ```

---

## 🔴 SSL Certificate Issues

### Problem: SSL certificate tidak valid atau expired

**Check certificate:**
```bash
sudo certbot certificates
```

**Check expiration:**
```bash
sudo certbot certificates | grep tamankehati.dasmap.co.id
```

**Renew certificate:**
```bash
sudo certbot renew --dry-run
sudo certbot renew
```

**Common issues:**
1. **Certificate not mounted** → Mount di service `go`
   ```yaml
   volumes:
     - /etc/letsencrypt:/etc/letsencrypt:ro
   ```

2. **Nginx config wrong path** → Check SSL paths in config
   ```nginx
   ssl_certificate /etc/letsencrypt/live/tamankehati.dasmap.co.id/fullchain.pem;
   ```

---

## 🔴 502 Bad Gateway

### Problem: Nginx returns 502 Bad Gateway

**Check containers:**
```bash
docker compose -f docker-compose.pull.no-nginx.yml ps
```

**Check if containers are healthy:**
```bash
docker compose -f docker-compose.pull.no-nginx.yml ps | grep -E "healthy|unhealthy"
```

**Common issues:**
1. **Containers not running** → Start containers
   ```bash
   docker compose -f docker-compose.pull.no-nginx.yml up -d
   ```

2. **Containers crashed** → Check logs
   ```bash
   docker compose -f docker-compose.pull.no-nginx.yml logs backend
   docker compose -f docker-compose.pull.no-nginx.yml logs frontend
   ```

3. **Wrong proxy_pass** → Check Nginx config
   ```nginx
   proxy_pass http://localhost:3000;  # Must be correct port
   ```

---

## 🔴 Images Not Loading

### Problem: Images tidak muncul di aplikasi

**Check image URLs:**
```bash
# Check browser console for errors
# Look for 404 errors for images
```

**Common issues:**
1. **localhost:8000 in URLs** → Check `imageUrl()` helper
   - Images harus di-normalize ke production URL
   - Check `NEXT_PUBLIC_API_URL` in `.env`

2. **Uploads directory not mounted** → Check volume mount
   ```bash
   docker compose -f docker-compose.pull.no-nginx.yml exec backend ls -la /app/uploads
   ```

---

## 📞 Getting Help

**If issues persist:**

1. **Collect logs:**
   ```bash
   # All logs
   docker compose -f docker-compose.pull.no-nginx.yml logs > logs.txt
   
   # Service-specific
   docker compose -f docker-compose.pull.no-nginx.yml logs backend > backend-logs.txt
   docker compose -f docker-compose.pull.no-nginx.yml logs frontend > frontend-logs.txt
   ```

2. **Check system resources:**
   ```bash
   # Check disk space
   df -h
   
   # Check memory
   free -h
   
   # Check Docker resources
   docker system df
   ```

3. **Verify configuration:**
   ```bash
   # Check .env
   cat .env
   
   # Check docker-compose
   cat docker-compose.pull.no-nginx.yml
   
   # Check Nginx config
   cat ~/dasmap_prod/apps/nginx/sites-enabled/tamankehati.conf
   ```

---

**Last Updated:** 2025-11-04

