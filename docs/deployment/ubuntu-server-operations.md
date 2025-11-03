# Ubuntu Server Operations Guide

Daily operations and maintenance guide for Taman Kehati production server.

## Quick Reference Commands

### Service Management
```bash
# Start all services
docker compose -f docker-compose.prod.yml up -d

# Stop all services
docker compose -f docker-compose.prod.yml stop

# Restart all services
docker compose -f docker-compose.prod.yml restart

# Stop and remove containers (data preserved)
docker compose -f docker-compose.prod.yml down

# Stop and remove everything including volumes (⚠️ deletes data!)
docker compose -f docker-compose.prod.yml down -v
```

### Status Checks
```bash
# Check service status
docker compose -f docker-compose.prod.yml ps

# Check all container statuses
docker ps

# Check resource usage
docker stats
```

### View Logs
```bash
# All services (follow)
docker compose -f docker-compose.prod.yml logs -f

# All services (last 100 lines)
docker compose -f docker-compose.prod.yml logs --tail=100

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f postgres
docker compose -f docker-compose.prod.yml logs -f nginx

# Logs with timestamps
docker compose -f docker-compose.prod.yml logs -f --timestamps
```

## Daily Operations

### Morning Checks

**1. Verify All Services Running**
```bash
docker compose -f docker-compose.prod.yml ps
```

All services should show "Up" status.

**2. Check Service Health**
```bash
# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000

# Nginx
curl http://localhost/health
```

**3. Check Recent Errors**
```bash
docker compose -f docker-compose.prod.yml logs --tail=50 | grep -i error
```

### Weekly Tasks

**1. Database Backup Verification**
```bash
ls -lh backups/
```

Verify backups are being created daily.

**2. Disk Space Check**
```bash
df -h
docker system df
```

**3. Update Application (if needed)**
```bash
cd /opt/tamankehati
git pull  # If using git
docker compose -f docker-compose.prod.yml up -d --build
```

## Database Operations

### Backup Database
```bash
cd /opt/tamankehati
./scripts/backup-database.sh
```

Backups are stored in `./backups/` with naming: `kehati_db_backup_YYYYMMDD_HHMMSS.sql.gz`

### List Backups
```bash
ls -lh backups/
```

### Restore Database from Backup
```bash
# 1. List available backups
ls -lh backups/

# 2. Restore (replace BACKUP_FILE with actual filename)
gunzip < backups/kehati_db_backup_20250102_020000.sql.gz | \
  docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U kehati_user -d kehati_db

# 3. Verify restore
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U kehati_user -d kehati_db -c "SELECT COUNT(*) FROM users;"
```

### Run Database Migrations Manually
```bash
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

### Access Database Shell
```bash
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U kehati_user -d kehati_db
```

**Useful SQL commands:**
```sql
-- List all tables
\dt

-- Check user count
SELECT COUNT(*) FROM users;

-- Check admin users
SELECT email, role, is_active FROM users WHERE role = 'super_admin';

-- Exit
\q
```

## Application Operations

### Restart Specific Service
```bash
# Backend only
docker compose -f docker-compose.prod.yml restart backend

# Frontend only
docker compose -f docker-compose.prod.yml restart frontend

# Database (⚠️ causes brief downtime)
docker compose -f docker-compose.prod.yml restart postgres

# Nginx
docker compose -f docker-compose.prod.yml restart nginx
```

### Rebuild Service After Code Changes
```bash
# Backend
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d backend

# Frontend
docker compose -f docker-compose.prod.yml build frontend
docker compose -f docker-compose.prod.yml up -d frontend
```

### Access Container Shells
```bash
# Backend shell
docker compose -f docker-compose.prod.yml exec backend bash

# Frontend shell
docker compose -f docker-compose.prod.yml exec frontend sh

# Database shell
docker compose -f docker-compose.prod.yml exec postgres sh
```

### Create/Update Admin User
```bash
docker compose -f docker-compose.prod.yml exec backend python3 init_admin.py
```

Follow prompts to create or update admin user.

## Monitoring

### Check Resource Usage
```bash
# Real-time stats
docker stats

# Disk usage
docker system df
df -h

# Memory usage
free -h
```

### Check Service Logs for Errors
```bash
# Recent errors in backend
docker compose -f docker-compose.prod.yml logs backend | grep -i error | tail -20

# Recent errors in frontend
docker compose -f docker-compose.prod.yml logs frontend | grep -i error | tail -20
```

### Health Check All Services
```bash
./scripts/verify-deployment.sh
```

## Troubleshooting

### Service Won't Start

**Check logs:**
```bash
docker compose -f docker-compose.prod.yml logs [service-name]
```

**Common fixes:**

1. **Port conflict:**
   ```bash
   # Find what's using the port
   sudo lsof -i :8000
   sudo lsof -i :3000
   sudo lsof -i :80
   
   # Stop conflicting service or change port in .env
   ```

2. **Volume permissions:**
   ```bash
   # Check volume permissions
   docker volume inspect tamankehati_postgres_data
   
   # Fix permissions (if needed)
   sudo chown -R 999:999 /var/lib/docker/volumes/tamankehati_postgres_data/_data
   ```

3. **Database connection issues:**
   - Verify `.env` has correct POSTGRES_PASSWORD
   - Check postgres container is running: `docker ps | grep postgres`
   - Check postgres logs: `docker compose -f docker-compose.prod.yml logs postgres`

### Application Errors

**Backend errors:**
```bash
# Check backend logs
docker compose -f docker-compose.prod.yml logs backend --tail=100

# Check if migrations ran successfully
docker compose -f docker-compose.prod.yml logs backend | grep migration

# Check database connection
docker compose -f docker-compose.prod.yml exec backend \
  python3 -c "from psycopg2 import connect; from os import getenv; \
  connect(getenv('DATABASE_URL_SYNC')); print('Connected')"
```

**Frontend errors:**
```bash
# Check frontend logs
docker compose -f docker-compose.prod.yml logs frontend --tail=100

# Verify NEXT_PUBLIC_API_URL is correct
docker compose -f docker-compose.prod.yml exec frontend env | grep NEXT_PUBLIC_API_URL
```

### Database Issues

**Connection refused:**
```bash
# Check postgres is running
docker ps | grep postgres

# Check postgres logs
docker compose -f docker-compose.prod.yml logs postgres

# Test connection
docker compose -f docker-compose.prod.yml exec postgres \
  pg_isready -U kehati_user -d kehati_db
```

**Migration errors:**
```bash
# Run migrations manually
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Check migration history
docker compose -f docker-compose.prod.yml exec backend alembic history
```

### Disk Space Issues

**Check disk usage:**
```bash
df -h
docker system df
```

**Clean up Docker:**
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes (⚠️ be careful!)
docker volume prune

# Remove unused containers
docker container prune

# Full cleanup (⚠️ removes everything unused!)
docker system prune -a --volumes
```

**Clean old backups:**
```bash
# List backups
ls -lh backups/

# Remove backups older than 30 days
find backups/ -name "kehati_db_backup_*.sql.gz" -mtime +30 -delete
```

## Backup and Recovery

### Automated Backups Setup

**Create cron job:**
```bash
crontab -e
```

**Add daily backup at 2 AM:**
```
0 2 * * * cd /opt/tamankehati && ./scripts/backup-database.sh >> logs/backup.log 2>&1
```

**Verify cron job:**
```bash
crontab -l
```

### Manual Backup
```bash
cd /opt/tamankehati
./scripts/backup-database.sh
```

### Restore Procedure

1. **Stop services (optional):**
   ```bash
   docker compose -f docker-compose.prod.yml stop backend
   ```

2. **Restore backup:**
   ```bash
   gunzip < backups/kehati_db_backup_YYYYMMDD_HHMMSS.sql.gz | \
     docker compose -f docker-compose.prod.yml exec -T postgres \
     psql -U kehati_user -d kehati_db
   ```

3. **Restart services:**
   ```bash
   docker compose -f docker-compose.prod.yml start backend
   ```

## Updates and Upgrades

### Update Application Code

**If using Git:**
```bash
cd /opt/tamankehati
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

**If copying files:**
```bash
# Copy new files
# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build
```

### Update Docker Images
```bash
# Pull latest base images
docker compose -f docker-compose.prod.yml pull

# Rebuild with new images
docker compose -f docker-compose.prod.yml build --pull

# Restart services
docker compose -f docker-compose.prod.yml up -d
```

### System Updates
```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Restart Docker (if needed)
sudo systemctl restart docker
```

## Log Management

### View Logs
```bash
# Real-time logs (all services)
docker compose -f docker-compose.prod.yml logs -f

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100

# Specific service last hour
docker compose -f docker-compose.prod.yml logs --since 1h backend
```

### Export Logs
```bash
# Export all logs to file
docker compose -f docker-compose.prod.yml logs > logs/all-logs-$(date +%Y%m%d).txt

# Export specific service
docker compose -f docker-compose.prod.yml logs backend > logs/backend-$(date +%Y%m%d).txt
```

### Log Rotation

Docker handles log rotation, but you can configure it in `/etc/docker/daemon.json`:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Then restart Docker:
```bash
sudo systemctl restart docker
```

## Performance Monitoring

### Check Resource Usage
```bash
# Real-time container stats
docker stats

# System resources
htop  # or top
free -h
df -h
```

### Database Performance
```bash
# Check active connections
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U kehati_user -d kehati_db -c "SELECT count(*) FROM pg_stat_activity;"

# Check database size
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U kehati_user -d kehati_db -c "SELECT pg_size_pretty(pg_database_size('kehati_db'));"
```

## Security

### Update Passwords
1. Update in `.env` file
2. Restart affected services
3. For database password, update `POSTGRES_PASSWORD` in `.env` and restart postgres

### Review Access Logs
```bash
# Nginx access logs
docker compose -f docker-compose.prod.yml exec nginx \
  tail -f /var/log/nginx/access.log

# Backend logs for authentication attempts
docker compose -f docker-compose.prod.yml logs backend | grep -i "login\|auth"
```

## Emergency Procedures

### Complete Service Restart
```bash
cd /opt/tamankehati
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

### Reset Everything (⚠️ Deletes All Data!)
```bash
# Stop and remove everything
docker compose -f docker-compose.prod.yml down -v

# Remove images
docker compose -f docker-compose.prod.yml rm -f

# Rebuild from scratch
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### Rollback to Previous Version
1. Restore database backup
2. Rebuild containers with previous code version
3. Restart services

## Useful Aliases

Add to `~/.bashrc` for convenience:
```bash
alias dcp='docker compose -f docker-compose.prod.yml'
alias dcp-up='docker compose -f docker-compose.prod.yml up -d'
alias dcp-down='docker compose -f docker-compose.prod.yml stop'
alias dcp-logs='docker compose -f docker-compose.prod.yml logs -f'
alias dcp-ps='docker compose -f docker-compose.prod.yml ps'
alias dcp-restart='docker compose -f docker-compose.prod.yml restart'
```

Reload:
```bash
source ~/.bashrc
```

---

**Last Updated:** 2025-01-02
**Version:** 1.0.0

