# Fix Docker BuildKit I/O Error

## Error Message
```
ERROR: failed to solve: Internal: write tmp file: write /var/lib/buildkit/runc-overlayfs/content/ingest/.../updatedat.tmp: input/output error
```

## Root Cause
This error typically occurs due to:
1. **Disk space full** (most common) - Your disk is at 96% capacity
2. Docker BuildKit cache corruption
3. Temporary filesystem issues

## Solutions

### Solution 1: Free Up Disk Space (Recommended)

**Check current disk usage:**
```bash
df -h
```

**Clean up Docker resources:**
```bash
# Clean build cache
docker builder prune -af

# Clean everything (images, containers, volumes, networks)
docker system prune -af --volumes

# Clean BuildKit cache
docker buildx prune -af
```

**Free up other space:**
- Delete large files you don't need
- Empty trash
- Remove old logs
- Clear browser cache
- Remove unused applications

### Solution 2: Rebuild BuildKit Builder

```bash
# Remove old builder
docker buildx rm tamankehati-builder

# Create new builder
docker buildx create --name tamankehati-builder --use

# Bootstrap the builder
docker buildx inspect --bootstrap
```

### Solution 3: Use Regular Docker Build (Not BuildKit)

If BuildKit continues to fail, use regular Docker build:

```bash
# Disable BuildKit temporarily
export DOCKER_BUILDKIT=0

# Build backend
cd apps/backend
docker build -t arnezzi/tamankehati-backend:v1.0.6 --target production .

# Re-enable BuildKit
export DOCKER_BUILDKIT=1
```

### Solution 4: Build on Server Instead

If local machine has issues, build directly on the server:

**On server:**
```bash
# SSH into server
ssh ubuntu@38.47.93.167

# Navigate to project
cd ~/dasmap_prod/apps/tamankehati

# Build directly
docker build -f apps/backend/Dockerfile \
  -t arnezzi/tamankehati-backend:v1.0.6 \
  --target production \
  apps/backend

# Push to Docker Hub
docker push arnezzi/tamankehati-backend:v1.0.6
```

### Solution 5: Build Without Cache

If cache is corrupted, build without cache:

```bash
cd apps/backend
docker build --no-cache \
  -t arnezzi/tamankehati-backend:v1.0.6 \
  --target production .
```

### Solution 6: Restart Docker Daemon

**On macOS:**
```bash
# Restart Docker Desktop from GUI or:
killall Docker && open -a Docker
```

**On Linux:**
```bash
sudo systemctl restart docker
```

## Quick Fix Command Sequence

Try this sequence:

```bash
# 1. Clean everything
docker builder prune -af
docker system prune -af --volumes
docker buildx prune -af

# 2. Recreate builder
docker buildx rm tamankehati-builder 2>/dev/null || true
docker buildx create --name tamankehati-builder --use
docker buildx inspect --bootstrap

# 3. Try build with regular docker (no buildx)
cd apps/backend
docker build -t arnezzi/tamankehati-backend:v1.0.6 --target production .
```

## Prevention

1. **Monitor disk space regularly:**
   ```bash
   df -h
   ```

2. **Set up automatic Docker cleanup:**
   ```bash
   # Add to crontab or run weekly
   docker system prune -af --volumes
   ```

3. **Use .dockerignore** to reduce build context size

4. **Keep at least 10GB free space** for Docker operations

## Verification

After cleanup, verify:
```bash
# Check disk space
df -h

# Check Docker space
docker system df

# Should show plenty of free space
```

## If All Else Fails

1. **Build on a different machine** (CI/CD, server, or another dev machine)
2. **Use Docker Hub automated builds** (connect GitHub repo)
3. **Build on the server** directly (has more space)

## Current Status

- ✅ Cleaned ~13GB of Docker cache/images
- ✅ Recreated BuildKit builder
- ⚠️ Disk still at 96% capacity (531MB free)
- ⚠️ Need to free up more space before building

## Next Steps

1. Free up more disk space (aim for at least 5GB free)
2. Try building again with regular Docker build
3. Or build directly on the server where there's more space

