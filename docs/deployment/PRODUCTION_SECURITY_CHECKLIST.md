# Production Security Checklist

Comprehensive security checklist for Ubuntu server deployment.

## Critical Security Settings

### Environment Variables

- [ ] **SECRET_KEY** - Generated new (32+ characters), NOT using default
  ```bash
  # Generate with:
  python3 -c "import secrets; print(secrets.token_urlsafe(32))"
  ```

- [ ] **POSTGRES_PASSWORD** - Strong password set, NOT using default "kehati_password"
  - Minimum 16 characters
  - Mix of uppercase, lowercase, numbers, symbols
  - NOT in any dictionary

- [ ] **ADMIN_PASSWORD** - Strong password set, NOT using default "admin123"
  - Minimum 12 characters
  - Mix of uppercase, lowercase, numbers
  - Changed after first login

- [ ] **DEBUG** - Set to `false` (NOT `true` or `"true"`)
  ```bash
  DEBUG=false
  ```

- [ ] **ENVIRONMENT** - Set to `production`
  ```bash
  ENVIRONMENT=production
  ```

### Network Security

- [ ] **Database Port** - NOT exposed externally (ports commented in docker-compose.prod.yml)
  ```yaml
  # ports:
  #   - "5432:5432"
  ```

- [ ] **Redis Port** - NOT exposed externally (ports commented in docker-compose.prod.yml)
  ```yaml
  # ports:
  #   - "6379:6379"
  ```

- [ ] **CORS_ORIGINS** - Restricted to known IPs/domains only
  - NO wildcard "*"
  - NO "localhost" in production (unless internal access only)
  - Format: `http://YOUR_SERVER_IP:3000,http://YOUR_SERVER_IP:80`

- [ ] **Firewall (UFW)** - Enabled with proper rules
  ```bash
  # Set default policies
  sudo ufw default deny incoming
  sudo ufw default allow outgoing
  
  # Allow required ports
  sudo ufw allow 22/tcp    # SSH (CRITICAL)
  sudo ufw allow 80/tcp    # HTTP (Nginx)
  sudo ufw allow 443/tcp   # HTTPS (for future SSL)
  
  # Enable firewall
  sudo ufw enable
  sudo ufw status verbose
  
  # Verify ports 8000, 3000, 5432, 6379 are NOT open
  sudo ufw status | grep -E "8000|3000|5432|6379" && echo "❌ Unsafe ports exposed!" || echo "✅ Safe ports only"
  ```
  
  **Required ports:**
  - ✅ Port 22 (SSH) - Required
  - ✅ Port 80 (HTTP) - Nginx reverse proxy
  - ✅ Port 443 (HTTPS) - For SSL/TLS
  - ❌ Port 8000 - Should NOT be public (internal only)
  - ❌ Port 3000 - Should NOT be public (internal only)
  - ❌ Port 5432 - Should NOT be public (PostgreSQL)
  - ❌ Port 6379 - Should NOT be public (Redis)
  
  **Quick Setup:**
  ```bash
  # Use automated script
  sudo ./scripts/setup-firewall.sh
  ```

### File Permissions

- [ ] **.env file** - NOT committed to git
  ```bash
  # Check .gitignore contains .env
  grep "^\.env$" .gitignore
  ```

- [ ] **Uploads directory** - Proper permissions (non-root user)
  - Container runs as non-root user (verified in Dockerfile)

- [ ] **Log files** - Accessible but not world-writable

### Application Security

- [ ] **Non-root containers** - All containers run as non-root users
  - Backend: user `app` (UID from Dockerfile)
  - Frontend: user `nextjs` (UID 1001)
  - Postgres: user `postgres` (internal)
  - Redis: user `redis` (internal)

- [ ] **HTTPS/SSL** - Configured (if domain available)
  - SSL certificate installed
  - HTTP redirects to HTTPS

- [ ] **Security headers** - Configured in Nginx
  - X-Frame-Options
  - X-Content-Type-Options
  - X-XSS-Protection

### Database Security

- [ ] **Database user** - Limited permissions (only what's needed)
  - User `kehati_user` has access only to `kehati_db`

- [ ] **Backup encryption** - Backups stored securely (optional)
  ```bash
  # Encrypt backup
  gzip -c backups/backup.sql | openssl enc -aes-256-cbc -salt -out backup.sql.gz.enc
  ```

### Monitoring & Logging

- [ ] **Log rotation** - Configured to prevent disk fill
  - Docker log rotation configured
  - Application log rotation configured

- [ ] **Audit logs** - Review logs regularly
  - Failed login attempts
  - Unusual API requests
  - Error patterns

## Pre-Deployment Security Scan

### Check for Hardcoded Secrets
```bash
# Search for potential secrets in code
grep -r "password.*=" apps/ --exclude-dir=node_modules --exclude-dir=venv
grep -r "secret.*=" apps/ --exclude-dir=node_modules --exclude-dir=venv
grep -r "localhost:8000" apps/ --exclude-dir=node_modules --exclude-dir=venv
```

### Verify Environment Variables
```bash
# Check .env file exists and is not empty
test -f .env && echo "✅ .env exists" || echo "❌ .env missing"
test -s .env && echo "✅ .env not empty" || echo "❌ .env is empty"

# Verify critical variables set
grep -q "SECRET_KEY=" .env && ! grep -q "SECRET_KEY=.*CHANGE\|SECRET_KEY=.*your-secret" .env && echo "✅ SECRET_KEY configured" || echo "❌ SECRET_KEY needs update"
grep -q "DEBUG=false" .env && echo "✅ DEBUG=false" || echo "❌ DEBUG not set to false"
grep -q "ENVIRONMENT=production" .env && echo "✅ ENVIRONMENT=production" || echo "❌ ENVIRONMENT not set"
```

## Post-Deployment Security Verification

### Verify Ports Not Exposed
```bash
# Check database port not exposed
docker port kehati-postgres-prod 5432/tcp 2>&1 | grep -q "5432/tcp" && echo "❌ Database port exposed!" || echo "✅ Database port not exposed"

# Check Redis port not exposed
docker port kehati-redis-prod 6379/tcp 2>&1 | grep -q "6379/tcp" && echo "❌ Redis port exposed!" || echo "✅ Redis port not exposed"
```

### Verify CORS Configuration
```bash
# Check CORS allows only known origins
docker compose -f docker-compose.prod.yml exec backend env | grep CORS_ORIGINS
```

### Verify Debug Mode Disabled
```bash
# Check backend DEBUG setting
docker compose -f docker-compose.prod.yml exec backend env | grep DEBUG
# Should show: DEBUG=false
```

## Regular Security Tasks

### Weekly
- [ ] Review access logs for suspicious activity
- [ ] Check for failed login attempts
- [ ] Review error logs for patterns
- [ ] Verify backups are running

### Monthly
- [ ] Update system packages: `sudo apt update && sudo apt upgrade`
- [ ] Update Docker images: `docker compose -f docker-compose.prod.yml pull`
- [ ] Review and rotate secrets (if needed)
- [ ] Audit user accounts and permissions
- [ ] Review firewall rules

### Quarterly
- [ ] Full security audit
- [ ] Review and update dependencies
- [ ] Test backup restore procedure
- [ ] Review CORS origins and remove unused

## Incident Response

### If Security Breach Suspected

1. **Immediately:**
   ```bash
   # Stop services
   docker compose -f docker-compose.prod.yml stop
   
   # Review logs
   docker compose -f docker-compose.prod.yml logs > security-audit-$(date +%Y%m%d).log
   ```

2. **Change all passwords:**
   - SECRET_KEY
   - POSTGRES_PASSWORD
   - ADMIN_PASSWORD

3. **Review access:**
   - Check unauthorized logins
   - Review database access logs
   - Check file modifications

4. **Restore from backup** (if needed):
   ```bash
   ./scripts/backup-database.sh
   # Restore from clean backup if data compromised
   ```

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)

---

**Last Updated:** 2025-01-02
**Version:** 1.0.0

