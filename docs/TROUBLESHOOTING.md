# 🔧 Troubleshooting Guide

## Docker Issues

### Error: "Cannot connect to the Docker daemon"

**Problem:**
```
ERROR: no valid drivers found: Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?
```

**Solution:**

#### macOS:
1. **Start Docker Desktop:**
   ```bash
   open -a Docker
   ```
   Atau buka Docker Desktop dari Applications folder

2. **Wait for Docker to start:**
   - Tunggu sampai Docker Desktop icon muncul di menu bar
   - Icon harus hijau (running)
   - Bisa take 1-2 minutes

3. **Verify Docker is running:**
   ```bash
   docker ps
   # Should show running containers or empty list (not error)
   ```

#### Linux:
```bash
# Start Docker service
sudo systemctl start docker

# Enable Docker on boot
sudo systemctl enable docker

# Check status
sudo systemctl status docker
```

#### Windows:
1. Start Docker Desktop dari Start Menu
2. Wait for Docker to start
3. Verify:
   ```bash
   docker ps
   ```

### Build Script Issues

**Problem:** Build script fails with Docker daemon error

**Solution:**
1. Start Docker Desktop first
2. Wait until Docker is fully running (check menu bar icon)
3. Run build script again:
   ```bash
   ./scripts/build-and-push-images.sh
   ```

### Alternative: Build on Server

Jika Docker Desktop tidak bisa di-start atau tidak ada di local:

**Option 1: Build langsung di server**
```bash
# SSH ke server
ssh ubuntu@38.47.93.167

# Build di server
cd ~/dasmap_prod/apps/tamankehati
docker compose -f docker-compose.prod.yml build
```

**Option 2: Use GitHub Actions**
- Push code ke GitHub
- GitHub Actions akan auto-build dan push images
- Check `.github/workflows/docker-build-push.yml`

---

## Network Issues

### Cannot push to Docker Hub

**Problem:** Push fails with authentication error

**Solution:**
```bash
# Login to Docker Hub
docker login

# Enter username and password
# Or use access token (recommended)
```

### Slow Build/Push

**Problem:** Build atau push sangat lambat

**Solution:**
1. Check internet connection
2. Use Docker build cache
3. Build di server (better connection)

---

## Build Issues

### Frontend Build Fails

**Problem:** Frontend build error

**Common causes:**
- Missing dependencies
- Node version mismatch
- Memory issues

**Solution:**
```bash
# Check Node version (should be 22.x)
node --version

# Clean build
cd apps/frontend
rm -rf .next node_modules
npm install
npm run build
```

### Sharp Missing Error

**Problem:** `sharp is required` error

**Solution:**
- Already fixed in Dockerfile
- Rebuild image:
  ```bash
  ./scripts/build-and-push-images.sh
  ```

---

## Deployment Issues

### Container Won't Start

**Problem:** Container exits immediately

**Solution:**
```bash
# Check logs
docker logs <container-name>

# Check container status
docker ps -a

# Common issues:
# - Missing environment variables
# - Database connection failed
# - Port conflicts
```

### Port Already in Use

**Problem:** Port 3000 or 8000 already in use

**Solution:**
```bash
# Check what's using the port
sudo lsof -i :3000
sudo lsof -i :8000

# Stop conflicting service or change port in docker-compose
```

### Database Connection Failed

**Problem:** Backend can't connect to database

**Solution:**
```bash
# Check database container
docker ps | grep postgres

# Check database logs
docker logs tamankehati-postgres-prod

# Verify DATABASE_URL in .env
# Should use 'postgres' as hostname (Docker service name)
```

---

## Quick Fixes

### Restart All Services
```bash
docker compose -f docker-compose.pull.no-nginx.yml restart
```

### View All Logs
```bash
docker compose -f docker-compose.pull.no-nginx.yml logs -f
```

### Clean and Rebuild
```bash
# Stop and remove containers
docker compose -f docker-compose.pull.no-nginx.yml down

# Remove volumes (⚠️ deletes data!)
docker compose -f docker-compose.pull.no-nginx.yml down -v

# Rebuild
docker compose -f docker-compose.pull.no-nginx.yml up -d --build
```

---

## Getting Help

1. Check logs first: `docker logs <container-name>`
2. Check container status: `docker ps -a`
3. Check network: `docker network ls`
4. Check volumes: `docker volume ls`
5. Review deployment guide: `docs/deployment/COMPLETE_DEPLOYMENT_GUIDE.md`

