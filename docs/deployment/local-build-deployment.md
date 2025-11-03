# Local Build & Registry Deployment Guide

Guide untuk build Docker images di local dan deploy ke server menggunakan Docker registry (tanpa source code di server).

## Overview

Dengan pendekatan ini:
- ✅ Build images dilakukan di local (development machine)
- ✅ Images di-push ke Docker registry (Docker Hub atau custom registry)
- ✅ Server hanya pull images, tidak perlu source code
- ✅ Source code tetap aman di local

## Prerequisites

1. **Docker installed** di local machine
2. **Docker Hub account** (gratis) atau custom registry
3. **Server Ubuntu** dengan Docker installed (tidak perlu source code)

## Step 1: Build Images Locally

### 1.1 Setup Environment Variables

```bash
# Set Docker Hub username
export DOCKER_USERNAME=your-dockerhub-username

# Set image tag (semantic versioning recommended)
export IMAGE_TAG=v1.0.0

# Optional: Use custom registry
# export DOCKER_REGISTRY=registry.example.com
```

### 1.2 Build and Push Images

```bash
# Make script executable
chmod +x scripts/build-and-push-images.sh

# Build and push images
./scripts/build-and-push-images.sh
```

Script ini akan:
- Build backend image (`tamankehati-backend`)
- Build frontend image (`tamankehati-frontend`)
- Tag images dengan registry path
- Push images ke Docker registry

**Output:**
```
Backend:  docker.io/yourusername/tamankehati-backend:v1.0.0
Frontend: docker.io/yourusername/tamankehati-frontend:v1.0.0
```

### 1.3 Verify Images Pushed

```bash
# Check if images are in registry (requires Docker login)
docker pull docker.io/yourusername/tamankehati-backend:v1.0.0
docker pull docker.io/yourusername/tamankehati-frontend:v1.0.0
```

## Step 2: Prepare Server Files

### 2.1 Files Needed on Server

Server hanya perlu file-file berikut:
- `docker-compose.pull.yml` - Docker Compose untuk pull images
- `.env` - Environment configuration
- `deploy-package/nginx/` - Nginx configuration (optional)

**Tidak perlu:**
- Source code (`apps/backend/`, `apps/frontend/`)
- `docker-compose.prod.yml` (build version)
- Node modules, Python packages, dll

### 2.2 Create Minimal Server Package

```bash
# Create deployment package
mkdir -p deployment-package
cp docker-compose.pull.yml deployment-package/
cp env.production.example deployment-package/.env.example
cp -r deploy-package/nginx deployment-package/

# Create README for server
cat > deployment-package/README.md << 'EOF'
# Taman Kehati - Server Deployment Package

## Quick Start

1. Copy this package to server
2. Configure .env file
3. Run: docker compose -f docker-compose.pull.yml pull
4. Run: docker compose -f docker-compose.pull.yml up -d
EOF
```

## Step 3: Deploy to Server

### 3.1 Copy Files to Server

```bash
# Copy package to server
scp -r deployment-package user@server:/opt/tamankehati/
```

### 3.2 Configure Server

```bash
# SSH to server
ssh user@server

# Navigate to deployment directory
cd /opt/tamankehati

# Copy and edit .env
cp .env.example .env
nano .env
```

**Update .env dengan:**
```bash
# Docker Registry Configuration
DOCKER_REGISTRY=docker.io
DOCKER_USERNAME=yourusername
IMAGE_TAG=v1.0.0

# Server Configuration
SERVER_IP=192.168.1.100  # Replace with server IP
NEXT_PUBLIC_API_URL=http://192.168.1.100:8000
CORS_ORIGINS=http://192.168.1.100:3000,http://192.168.1.100:80

# Security
SECRET_KEY=your-generated-secret-key
POSTGRES_PASSWORD=strong-password
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=strong-admin-password

# Environment
ENVIRONMENT=production
DEBUG=false
```

### 3.3 Pull and Start Services

```bash
# Pull images from registry
docker compose -f docker-compose.pull.yml pull

# Start services
docker compose -f docker-compose.pull.yml up -d

# Check status
docker compose -f docker-compose.pull.yml ps

# View logs
docker compose -f docker-compose.pull.yml logs -f
```

## Step 4: Update Deployment

### 4.1 Build New Version

```bash
# Update version tag
export IMAGE_TAG=v1.0.1

# Build and push new images
./scripts/build-and-push-images.sh
```

### 4.2 Update on Server

```bash
# SSH to server
ssh user@server
cd /opt/tamankehati

# Update .env with new version
# IMAGE_TAG=v1.0.1

# Pull new images
docker compose -f docker-compose.pull.yml pull

# Restart services
docker compose -f docker-compose.pull.yml up -d
```

## Benefits of This Approach

1. **Security**: Source code tidak pernah ada di server
2. **Speed**: Server tidak perlu build (build hanya di local)
3. **Version Control**: Easy rollback dengan image tags
4. **CI/CD Ready**: Bisa diintegrasikan dengan GitHub Actions
5. **Multiple Servers**: Same images bisa digunakan di multiple servers

## Troubleshooting

### Images Not Found

```bash
# Check if images exist in registry
docker pull docker.io/yourusername/tamankehati-backend:v1.0.0

# Verify Docker login
docker login
```

### Permission Denied

```bash
# Make sure Docker user has permission
sudo usermod -aG docker $USER
# Logout and login again
```

### Registry Authentication

```bash
# Login to Docker Hub
docker login

# Login to custom registry
docker login registry.example.com
```

## Alternative: Private Registry

Jika ingin menggunakan private registry:

```bash
# Build script
export DOCKER_REGISTRY=registry.example.com
export DOCKER_USERNAME=your-username
./scripts/build-and-push-images.sh

# On server
export DOCKER_REGISTRY=registry.example.com
export DOCKER_USERNAME=your-username
docker login registry.example.com
docker compose -f docker-compose.pull.yml pull
```

## Security Best Practices

1. ✅ Use semantic versioning (v1.0.0, v1.0.1, etc.)
2. ✅ Never use `latest` tag in production
3. ✅ Use private registry for sensitive code
4. ✅ Rotate image tags (keep last 3-5 versions)
5. ✅ Scan images for vulnerabilities before push

## Next Steps

- [Production Deployment Guide](./ubuntu-server-deployment.md)
- [Operations Guide](./ubuntu-server-operations.md)
- [Security Checklist](./PRODUCTION_SECURITY_CHECKLIST.md)

