# 🚀 Production Deployment Guide

Comprehensive guide for deploying Taman Kehati to production environments.

## Overview

This guide covers production deployment strategies, environment setup, security considerations, and maintenance procedures for the Taman Kehati system.

## Production Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer                            │
│                 (Nginx/HAProxy)                             │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                        │
│                 (Docker Containers)                        │
├─────────────────────────────────────────────────────────────┤
│                    Database Layer                            │
│                 (PostgreSQL + Redis)                        │
├─────────────────────────────────────────────────────────────┤
│                    Storage Layer                            │
│                 (File Storage + Backups)                    │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

### System Requirements

- **CPU**: 4+ cores (8+ recommended)
- **RAM**: 8GB minimum (16GB+ recommended)
- **Storage**: 100GB+ SSD storage
- **Network**: Stable internet connection
- **OS**: Ubuntu 20.04+ or CentOS 8+

### Required Software

- Docker 20.10+
- Docker Compose 2.0+
- Nginx 1.18+
- Certbot (for SSL)
- Git 2.30+

## Environment Setup

### 1. Server Preparation

#### Update System

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Create Application User

```bash
# Create application user
sudo useradd -m -s /bin/bash tamankehati
sudo usermod -aG docker tamankehati

# Switch to application user
sudo su - tamankehati
```

### 2. Application Deployment

#### Clone Repository

```bash
# Clone repository
git clone https://github.com/your-org/tamankehati.git
cd tamankehati

# Checkout production branch
git checkout production
```

#### Environment Configuration

```bash
# Copy production environment template
cp env.prod.example .env.production

# Edit environment variables
nano .env.production
```

#### Production Environment Variables

```bash
# Production environment
ENVIRONMENT=production
DEBUG=false

# Database
DATABASE_URL="postgresql+asyncpg://kehati_user:secure_password@postgres:5432/kehati_db"
DATABASE_URL_SYNC="postgresql://kehati_user:secure_password@postgres:5432/kehati_db"

# Security
SECRET_KEY="your-super-secure-secret-key-minimum-32-characters"
ENCRYPTION_KEY="your-encryption-key-base64-encoded"

# CORS
CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# File Upload
MAX_FILE_SIZE="10485760"
UPLOAD_DIR="/app/uploads"

# Logging
LOG_LEVEL="WARNING"
ENABLE_SECURITY_LOGGING="true"

# AI Configuration
AI_PROVIDER="google"
GOOGLE_AI_API_KEY="your-google-ai-api-key"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="noreply@yourdomain.com"
SMTP_PASSWORD="your-app-password"
```

### 3. Docker Production Setup

#### Production Docker Compose

```yaml
# docker-compose.prod.yml
version: "3.8"

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: tamankehati-postgres-prod
    environment:
      POSTGRES_DB: kehati_db
      POSTGRES_USER: kehati_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - tamankehati-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U kehati_user -d kehati_db"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: tamankehati-redis-prod
    volumes:
      - redis_data:/data
    networks:
      - tamankehati-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend Service
  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile.prod
    container_name: tamankehati-backend-prod
    environment:
      DATABASE_URL: ${DATABASE_URL}
      DATABASE_URL_SYNC: ${DATABASE_URL_SYNC}
      REDIS_URL: redis://redis:6379
      SECRET_KEY: ${SECRET_KEY}
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}
      CORS_ORIGINS: ${CORS_ORIGINS}
      ENVIRONMENT: production
      DEBUG: false
      LOG_LEVEL: ${LOG_LEVEL}
    volumes:
      - uploads_data:/app/uploads
      - logs_data:/app/logs
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - tamankehati-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend Service
  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile.prod
    container_name: tamankehati-frontend-prod
    environment:
      NEXT_PUBLIC_API_URL: https://api.yourdomain.com
      NODE_ENV: production
      NEXT_TELEMETRY_DISABLED: "1"
    networks:
      - tamankehati-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  tamankehati-network:
    name: tamankehati_prod_network
    driver: bridge

volumes:
  postgres_data:
    name: tamankehati_postgres_prod_data
    driver: local
  redis_data:
    name: tamankehati_redis_prod_data
    driver: local
  uploads_data:
    name: tamankehati_uploads_prod_data
    driver: local
  logs_data:
    name: tamankehati_logs_prod_data
    driver: local
```

#### Backend Production Dockerfile

```dockerfile
# apps/backend/Dockerfile.prod
FROM python:3.12-slim AS base

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONPATH=/app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create non-root user
RUN adduser --system --group app

# Stage 2: Dependencies
FROM base AS dependencies

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 3: Production
FROM dependencies AS production

# Copy application code
COPY . .

# Set permissions
RUN chown -R app:app /app

# Create directories
RUN mkdir -p /app/uploads /app/logs
RUN chown -R app:app /app/uploads /app/logs

# Switch to non-root user
USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

#### Frontend Production Dockerfile

```dockerfile
# apps/frontend/Dockerfile.prod
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Stage 2: Builder
FROM base AS builder

# Copy source code
COPY . .

# Build application
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Install production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Command to run the application
CMD ["npm", "start"]
```

### 4. Nginx Configuration

#### Nginx Configuration

```nginx
# /etc/nginx/sites-available/tamankehati
upstream backend {
    server localhost:8000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File uploads
    location /uploads/ {
        alias /var/lib/docker/volumes/tamankehati_uploads_prod_data/_data/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Static files
    location /static/ {
        alias /var/lib/docker/volumes/tamankehati_frontend_prod_data/_data/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
```

#### Enable Nginx Site

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/tamankehati /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 5. SSL Certificate Setup

#### Install Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

#### SSL Renewal Cron Job

```bash
# Add to crontab
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

## Database Setup

### 1. Database Configuration

#### Create Production Database

```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U kehati_user -d kehati_db

# Create database user
CREATE USER kehati_user WITH PASSWORD 'secure_password';
CREATE DATABASE kehati_db OWNER kehati_user;
GRANT ALL PRIVILEGES ON DATABASE kehati_db TO kehati_user;
```

#### Run Migrations

```bash
# Run database migrations
docker compose exec backend alembic upgrade head

# Verify migrations
docker compose exec backend alembic current
```

### 2. Database Backup Setup

#### Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Create backup
docker compose exec postgres pg_dump -U kehati_user kehati_db > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Keep only last 30 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

#### Automated Backups

```bash
# Make script executable
chmod +x backup.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

## Deployment Process

### 1. Initial Deployment

#### Build and Start Services

```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Start services
docker compose -f docker-compose.prod.yml up -d

# Check service status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

#### Verify Deployment

```bash
# Check API health
curl https://yourdomain.com/api/health

# Check frontend
curl https://yourdomain.com

# Check database connection
docker compose exec postgres pg_isready -U kehati_user -d kehati_db
```

### 2. Zero-Downtime Deployment

#### Blue-Green Deployment Script

```bash
#!/bin/bash
# deploy.sh

# Build new images
docker compose -f docker-compose.prod.yml build

# Start new services with different names
docker compose -f docker-compose.prod.yml -p tamankehati-new up -d

# Wait for new services to be healthy
sleep 30

# Check new services health
docker compose -p tamankehati-new ps

# Switch traffic (update Nginx config)
sudo nginx -s reload

# Stop old services
docker compose -f docker-compose.prod.yml down

# Rename new services
docker compose -f docker-compose.prod.yml -p tamankehati-new down
docker compose -f docker-compose.prod.yml up -d

echo "Deployment completed successfully"
```

## Monitoring and Maintenance

### 1. Health Checks

#### Application Health Check

```bash
#!/bin/bash
# health_check.sh

# Check Docker services
if ! docker compose ps | grep -q "Up"; then
    echo "ERROR: Docker services not running"
    exit 1
fi

# Check API health
if ! curl -f https://yourdomain.com/api/health > /dev/null 2>&1; then
    echo "ERROR: API health check failed"
    exit 1
fi

# Check database
if ! docker compose exec postgres pg_isready -U kehati_user -d kehati_db > /dev/null 2>&1; then
    echo "ERROR: Database not ready"
    exit 1
fi

echo "All systems healthy"
exit 0
```

#### Resource Monitoring

```bash
#!/bin/bash
# monitor_resources.sh

# Check CPU usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    echo "WARNING: High CPU usage: $CPU_USAGE%"
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ $MEMORY_USAGE -gt 80 ]; then
    echo "WARNING: High memory usage: $MEMORY_USAGE%"
fi

# Check disk usage
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)
if [ $DISK_USAGE -gt 80 ]; then
    echo "WARNING: High disk usage: $DISK_USAGE%"
fi
```

### 2. Log Management

#### Log Rotation

```bash
# Configure logrotate
sudo nano /etc/logrotate.d/tamankehati

# Logrotate configuration
/var/lib/docker/volumes/tamankehati_logs_prod_data/_data/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker compose restart backend
    endscript
}
```

#### Log Monitoring

```bash
#!/bin/bash
# log_monitor.sh

# Check for errors in last hour
ERROR_COUNT=$(docker compose logs --since=1h | grep -i error | wc -l)
if [ $ERROR_COUNT -gt 10 ]; then
    echo "WARNING: High error count in last hour: $ERROR_COUNT"
fi

# Check for critical errors
CRITICAL_ERRORS=$(docker compose logs --since=1h | grep -i "critical\|fatal\|panic" | wc -l)
if [ $CRITICAL_ERRORS -gt 0 ]; then
    echo "CRITICAL: Critical errors detected: $CRITICAL_ERRORS"
fi
```

### 3. Security Updates

#### Update Dependencies

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker compose pull
docker compose up -d

# Update application dependencies
cd apps/backend
pip install --upgrade -r requirements.txt

cd ../frontend
npm update
```

#### Security Monitoring

```bash
#!/bin/bash
# security_monitor.sh

# Check for failed login attempts
FAILED_LOGINS=$(docker compose logs --since=1h | grep -i "login failed\|authentication failed" | wc -l)
if [ $FAILED_LOGINS -gt 5 ]; then
    echo "WARNING: High number of failed logins: $FAILED_LOGINS"
fi

# Check for suspicious activity
SUSPICIOUS_ACTIVITY=$(docker compose logs --since=1h | grep -i "suspicious\|unauthorized\|forbidden" | wc -l)
if [ $SUSPICIOUS_ACTIVITY -gt 0 ]; then
    echo "WARNING: Suspicious activity detected: $SUSPICIOUS_ACTIVITY"
fi
```

## Backup and Recovery

### 1. Database Backup

#### Full Backup

```bash
#!/bin/bash
# full_backup.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/full_backup_$DATE.sql"

# Create full backup
docker compose exec postgres pg_dump -U kehati_user -d kehati_db > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_FILE.gz s3://your-backup-bucket/

echo "Full backup completed: $BACKUP_FILE.gz"
```

#### Incremental Backup

```bash
#!/bin/bash
# incremental_backup.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create incremental backup
docker compose exec postgres pg_dump -U kehati_user -d kehati_db --data-only > $BACKUP_DIR/incremental_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/incremental_backup_$DATE.sql

echo "Incremental backup completed: $BACKUP_DIR/incremental_backup_$DATE.sql.gz"
```

### 2. Data Recovery

#### Restore from Backup

```bash
#!/bin/bash
# restore.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# Stop services
docker compose down

# Start database only
docker compose up -d postgres

# Wait for database to be ready
sleep 10

# Restore database
docker compose exec postgres psql -U kehati_user -d kehati_db < $BACKUP_FILE

# Start all services
docker compose up -d

echo "Database restored from: $BACKUP_FILE"
```

## Performance Optimization

### 1. Database Optimization

#### Database Tuning

```sql
-- Optimize PostgreSQL configuration
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Reload configuration
SELECT pg_reload_conf();
```

#### Index Optimization

```sql
-- Create indexes for frequently queried columns
CREATE INDEX CONCURRENTLY idx_parks_status ON parks(status);
CREATE INDEX CONCURRENTLY idx_flora_park_id ON flora(park_id);
CREATE INDEX CONCURRENTLY idx_fauna_park_id ON fauna(park_id);
CREATE INDEX CONCURRENTLY idx_activities_park_id ON activities(park_id);
CREATE INDEX CONCURRENTLY idx_users_username ON users(username);
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
```

### 2. Application Optimization

#### Caching Configuration

```python
# Redis caching configuration
CACHE_CONFIG = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://redis:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        },
        "TIMEOUT": 300,  # 5 minutes
    }
}
```

#### Database Connection Pooling

```python
# Database connection pooling
DATABASE_CONFIG = {
    "pool_size": 20,
    "max_overflow": 30,
    "pool_pre_ping": True,
    "pool_recycle": 300,
}
```

## Troubleshooting

### 1. Common Issues

#### Service Won't Start

```bash
# Check service logs
docker compose logs backend
docker compose logs frontend
docker compose logs postgres

# Check service status
docker compose ps

# Restart services
docker compose restart
```

#### Database Connection Issues

```bash
# Check database status
docker compose exec postgres pg_isready

# Check database logs
docker compose logs postgres

# Test database connection
docker compose exec backend python -c "from core.database import engine; print('DB OK')"
```

#### SSL Certificate Issues

```bash
# Check certificate validity
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL configuration
openssl s_client -connect yourdomain.com:443
```

### 2. Performance Issues

#### Slow API Responses

```bash
# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com/api/health

# Check database query performance
docker compose exec postgres psql -U kehati_user -d kehati_db -c "SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

#### High Memory Usage

```bash
# Check memory usage
docker stats

# Check for memory leaks
docker compose exec backend ps aux --sort=-%mem
```

## Security Considerations

### 1. Firewall Configuration

#### Configure UFW

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Deny all other traffic
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

### 2. Database Security

#### Secure Database Configuration

```sql
-- Create read-only user
CREATE USER readonly_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE kehati_db TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- Enable SSL
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = 'server.crt';
ALTER SYSTEM SET ssl_key_file = 'server.key';
```

### 3. Application Security

#### Security Headers

```python
# Security middleware
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy": "default-src 'self'",
}
```

## Related Documentation

- [Security Best Practices](../security/best-practices.md)
- [Operational Runbooks](../runbooks/operational.md)
- [Observability Guide](../runbooks/observability.md)
- [Troubleshooting Guide](../troubleshooting/common-issues.md)
