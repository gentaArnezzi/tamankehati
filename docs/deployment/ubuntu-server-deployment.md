# Ubuntu Server Deployment Guide

Complete guide for deploying Taman Kehati application to Ubuntu server using Docker Compose.

## Prerequisites

### System Requirements
- Ubuntu 20.04 LTS or newer (22.04 LTS recommended)
- Minimum 2GB RAM (4GB recommended)
- Minimum 20GB disk space
- Root or sudo access

### Required Software
- Docker Engine 20.10+
- Docker Compose 2.0+ (or docker compose plugin)

## Step 1: Server Preparation

### 1.1 Update System
```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Install Docker
```bash
# Remove old versions
sudo apt remove docker docker-engine docker.io containerd runc

# Install prerequisites
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### 1.3 Configure Firewall (Optional but Recommended)
```bash
# Allow HTTP (port 80)
sudo ufw allow 80/tcp

# Allow backend direct access (optional, if not using Nginx)
sudo ufw allow 8000/tcp

# Allow frontend direct access (optional, if not using Nginx)
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

### 1.4 Get Server IP Address
```bash
# Get public IP
curl ifconfig.me

# Or get private IP (for local network)
hostname -I | awk '{print $1}'
```
**Save this IP address** - you'll need it for configuration.

## Step 2: Application Setup

### 2.1 Clone/Copy Application Files
```bash
# Create application directory
sudo mkdir -p /opt/tamankehati
sudo chown $USER:$USER /opt/tamankehati
cd /opt/tamankehati

# Copy application files here (via scp, git clone, etc.)
# Example with git:
# git clone <your-repo-url> .

# Example with scp (from local machine):
# scp -r /path/to/tamankehati_new/* user@server:/opt/tamankehati/
```

### 2.2 Create Production Environment File
```bash
cd /opt/tamankehati

# Copy example environment file
cp env.production.example .env

# Edit .env file
nano .env
```

### 2.3 Configure Environment Variables

**Critical variables to update in `.env`:**

1. **SERVER_IP** - Your server IP address
   ```bash
   SERVER_IP=192.168.1.100  # Replace with your actual IP
   ```

2. **SECRET_KEY** - Generate strong secret key
   ```bash
   python3 -c "import secrets; print(secrets.token_urlsafe(32))"
   # Copy output to SECRET_KEY in .env
   ```

3. **POSTGRES_PASSWORD** - Strong database password
   ```bash
   POSTGRES_PASSWORD=your-very-strong-password-here
   ```

4. **CORS_ORIGINS** - Frontend access URL
   ```bash
   CORS_ORIGINS=http://YOUR_SERVER_IP:3000,http://YOUR_SERVER_IP:80
   ```

5. **NEXT_PUBLIC_API_URL** - Backend API URL
   ```bash
   # Option 1: Direct backend access
   NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:8000
   
   # Option 2: Via Nginx (recommended)
   NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP/api
   ```

6. **ENVIRONMENT and DEBUG**
   ```bash
   ENVIRONMENT=production
   DEBUG=false
   ```

7. **ADMIN_EMAIL and ADMIN_PASSWORD**
   ```bash
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=your-secure-admin-password
   ```

**Example complete `.env` configuration:**
```bash
SERVER_IP=192.168.1.100
POSTGRES_DB=kehati_db
POSTGRES_USER=kehati_user
POSTGRES_PASSWORD=StrongPassword123!
SECRET_KEY=your-generated-secret-key-32-chars-minimum
CORS_ORIGINS=http://192.168.1.100:3000,http://192.168.1.100:80
NEXT_PUBLIC_API_URL=http://192.168.1.100/api
ENVIRONMENT=production
DEBUG=false
ADMIN_EMAIL=admin@kehati.org
ADMIN_PASSWORD=SecureAdminPass123!
```

## Step 3: Build and Start Services

### 3.1 Create Required Directories
```bash
mkdir -p backups logs
```

### 3.2 Build Docker Images
```bash
docker compose -f docker-compose.prod.yml build
```

This may take 10-15 minutes on first build.

### 3.3 Start Services
```bash
docker compose -f docker-compose.prod.yml up -d
```

### 3.4 Verify Services Are Running
```bash
docker compose -f docker-compose.prod.yml ps
```

All services should show "Up" status.

### 3.5 Check Logs
```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f postgres
```

## Step 4: Verification

### 4.1 Run Verification Script
```bash
chmod +x scripts/verify-deployment.sh
./scripts/verify-deployment.sh
```

### 4.2 Manual Checks

**Backend Health:**
```bash
curl http://YOUR_SERVER_IP:8000/health
# Should return: {"status":"healthy"}
```

**Frontend:**
```bash
curl http://YOUR_SERVER_IP:3000
# Should return HTML
```

**Nginx (if configured):**
```bash
curl http://YOUR_SERVER_IP/health
curl http://YOUR_SERVER_IP/api/health
```

**Database Connection:**
```bash
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U kehati_user -d kehati_db
```

### 4.3 Access Application

- **Frontend (direct):** http://YOUR_SERVER_IP:3000
- **Frontend (via Nginx):** http://YOUR_SERVER_IP
- **Backend API:** http://YOUR_SERVER_IP:8000
- **API Docs:** http://YOUR_SERVER_IP:8000/docs

## Step 5: Post-Deployment

### 5.1 Create Admin User

Admin user should be created automatically on first startup. Check logs:
```bash
docker compose -f docker-compose.prod.yml logs backend | grep "Admin"
```

If admin was not created, run manually:
```bash
docker compose -f docker-compose.prod.yml exec backend python3 init_admin.py
```

### 5.2 Verify Admin Login

1. Open frontend: http://YOUR_SERVER_IP:3000
2. Navigate to login page
3. Use credentials from `.env` file (ADMIN_EMAIL and ADMIN_PASSWORD)

### 5.3 Setup Automated Backups

**Create cron job for database backups:**
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /opt/tamankehati/scripts/backup-database.sh >> /opt/tamankehati/logs/backup.log 2>&1
```

**Test backup manually:**
```bash
cd /opt/tamankehati
./scripts/backup-database.sh
```

## Troubleshooting

### Services Not Starting

**Check service status:**
```bash
docker compose -f docker-compose.prod.yml ps
```

**Check specific service logs:**
```bash
docker compose -f docker-compose.prod.yml logs [service-name]
```

**Common issues:**

1. **Port already in use:**
   ```bash
   # Check what's using the port
   sudo lsof -i :80
   sudo lsof -i :3000
   sudo lsof -i :8000
   
   # Stop conflicting service or change port in .env
   ```

2. **Database connection failed:**
   - Verify POSTGRES_PASSWORD in .env matches docker-compose
   - Check database container is running: `docker ps | grep postgres`
   - Check database logs: `docker compose -f docker-compose.prod.yml logs postgres`

3. **CORS errors:**
   - Verify CORS_ORIGINS in .env includes your server IP
   - Ensure format is correct: `http://IP:PORT` (no trailing slash)
   - Restart backend after changing CORS: `docker compose -f docker-compose.prod.yml restart backend`

4. **Frontend can't connect to backend:**
   - Verify NEXT_PUBLIC_API_URL in .env
   - Check backend is accessible: `curl http://YOUR_SERVER_IP:8000/health`
   - Rebuild frontend if NEXT_PUBLIC_API_URL changed:
     ```bash
     docker compose -f docker-compose.prod.yml build frontend
     docker compose -f docker-compose.prod.yml up -d frontend
     ```

### View Logs
```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f postgres
```

### Restart Services
```bash
# Restart all
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker compose -f docker-compose.prod.yml restart backend
docker compose -f docker-compose.prod.yml restart frontend
```

### Stop Services
```bash
docker compose -f docker-compose.prod.yml stop
```

### Start Services
```bash
docker compose -f docker-compose.prod.yml start
```

### Rebuild After Code Changes
```bash
# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# Rebuild specific service
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d backend
```

## Maintenance

### Daily Operations
See [Ubuntu Server Operations Guide](./ubuntu-server-operations.md) for daily tasks.

### Update Application
```bash
cd /opt/tamankehati

# Pull latest code (if using git)
git pull

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build
```

### Database Migrations
Migrations run automatically on backend startup. To run manually:
```bash
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

### Backup Database
```bash
./scripts/backup-database.sh
```

Backups are stored in `./backups/` directory.

### Restore Database
```bash
# List available backups
ls -lh backups/

# Restore from backup (replace with actual backup file)
gunzip < backups/kehati_db_backup_20250102_020000.sql.gz | \
  docker compose -f docker-compose.prod.yml exec -T postgres psql -U kehati_user -d kehati_db
```

## Security Checklist

- [ ] Changed SECRET_KEY from default
- [ ] Changed POSTGRES_PASSWORD from default
- [ ] Changed ADMIN_PASSWORD from default
- [ ] Set DEBUG=false
- [ ] Set ENVIRONMENT=production
- [ ] CORS_ORIGINS restricted to known IPs
- [ ] Firewall enabled (ufw)
- [ ] Database not exposed externally (ports commented)
- [ ] Redis not exposed externally (ports commented)
- [ ] Regular backups configured
- [ ] .env file not committed to version control

## Next Steps

1. **Configure SSL/HTTPS** (when you have domain)
2. **Setup monitoring** (optional)
3. **Configure automatic updates** (optional)
4. **Setup log rotation** (optional)

## Support

For issues or questions:
1. Check logs: `docker compose -f docker-compose.prod.yml logs -f`
2. Run verification: `./scripts/verify-deployment.sh`
3. Check [Operations Guide](./ubuntu-server-operations.md)
4. Review [Troubleshooting Section](#troubleshooting)

---

**Last Updated:** 2025-01-02
**Version:** 1.0.0

