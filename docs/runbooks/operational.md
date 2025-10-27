# 📋 Runbooks

Operational runbooks for the Taman Kehati system.

## Overview

Runbooks provide step-by-step procedures for common operational tasks, incident response, and maintenance activities for the Taman Kehati system.

## System Administration

### Daily Health Checks

#### 1. Check System Status
```bash
# Check Docker services
docker compose ps

# Check service health
curl http://localhost:8000/health
curl http://localhost:3000

# Check database connectivity
docker compose exec postgres pg_isready -U kehati_user -d kehati_db
```

#### 2. Check Resource Usage
```bash
# Check container resources
docker stats

# Check disk space
df -h

# Check memory usage
free -h
```

#### 3. Check Logs
```bash
# Check for errors in logs
docker compose logs --tail=100 | grep -i error

# Check for warnings
docker compose logs --tail=100 | grep -i warning
```

### Weekly Maintenance

#### 1. Database Maintenance
```bash
# Backup database
docker compose exec postgres pg_dump -U kehati_user kehati_db > backup_$(date +%Y%m%d).sql

# Vacuum database
docker compose exec postgres psql -U kehati_user -d kehati_db -c "VACUUM ANALYZE;"

# Check database size
docker compose exec postgres psql -U kehati_user -d kehati_db -c "SELECT pg_size_pretty(pg_database_size('kehati_db'));"
```

#### 2. Log Rotation
```bash
# Rotate application logs
docker compose exec backend logrotate /etc/logrotate.conf

# Clean old logs
find /var/log -name "*.log" -mtime +30 -delete
```

#### 3. Security Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker compose pull
docker compose up -d
```

## Incident Response

### Service Outage

#### 1. Identify Affected Services
```bash
# Check service status
docker compose ps

# Check service logs
docker compose logs backend
docker compose logs frontend
docker compose logs postgres
```

#### 2. Restart Services
```bash
# Restart specific service
docker compose restart backend

# Restart all services
docker compose restart

# Full restart with rebuild
docker compose down
docker compose up -d --build
```

#### 3. Verify Recovery
```bash
# Test API endpoints
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/parks

# Test frontend
curl http://localhost:3000
```

### Database Issues

#### 1. Database Connection Problems
```bash
# Check database status
docker compose exec postgres pg_isready

# Check database logs
docker compose logs postgres

# Check connection pool
docker compose exec postgres psql -U kehati_user -d kehati_db -c "SELECT * FROM pg_stat_activity;"
```

#### 2. Database Recovery
```bash
# Restart database
docker compose restart postgres

# Check database integrity
docker compose exec postgres psql -U kehati_user -d kehati_db -c "VACUUM ANALYZE;"

# Restore from backup if needed
docker compose exec postgres psql -U kehati_user -d kehati_db < backup_20231027.sql
```

### Performance Issues

#### 1. High CPU Usage
```bash
# Check container CPU usage
docker stats

# Check system CPU usage
top

# Check specific process
docker compose exec backend top
```

#### 2. High Memory Usage
```bash
# Check memory usage
free -h
docker stats

# Check for memory leaks
docker compose exec backend ps aux --sort=-%mem
```

#### 3. Slow Response Times
```bash
# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8000/api/v1/parks

# Check database query performance
docker compose exec postgres psql -U kehati_user -d kehati_db -c "SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

## Backup and Recovery

### Database Backup

#### 1. Full Backup
```bash
# Create full backup
docker compose exec postgres pg_dump -U kehati_user -d kehati_db > backup_full_$(date +%Y%m%d_%H%M%S).sql

# Compress backup
gzip backup_full_$(date +%Y%m%d_%H%M%S).sql
```

#### 2. Incremental Backup
```bash
# Create incremental backup
docker compose exec postgres pg_dump -U kehati_user -d kehati_db --schema-only > backup_schema_$(date +%Y%m%d).sql
docker compose exec postgres pg_dump -U kehati_user -d kehati_db --data-only > backup_data_$(date +%Y%m%d).sql
```

#### 3. Automated Backup
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

docker compose exec postgres pg_dump -U kehati_user -d kehati_db > $BACKUP_FILE
gzip $BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x backup.sh

# Add to crontab
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

### Data Recovery

#### 1. Restore from Backup
```bash
# Stop services
docker compose down

# Restore database
docker compose up -d postgres
docker compose exec postgres psql -U kehati_user -d kehati_db < backup_20231027.sql

# Restart services
docker compose up -d
```

#### 2. Point-in-Time Recovery
```bash
# Create recovery point
docker compose exec postgres psql -U kehati_user -d kehati_db -c "SELECT pg_create_restore_point('before_update');"

# Perform operations
# ... make changes ...

# Restore to point
docker compose exec postgres psql -U kehati_user -d kehati_db -c "SELECT pg_switch_wal();"
```

## Monitoring and Alerting

### System Monitoring

#### 1. Health Check Script
```bash
#!/bin/bash
# health_check.sh

# Check Docker services
if ! docker compose ps | grep -q "Up"; then
    echo "ERROR: Docker services not running"
    exit 1
fi

# Check API health
if ! curl -f http://localhost:8000/health > /dev/null 2>&1; then
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

#### 2. Resource Monitoring
```bash
#!/bin/bash
# resource_monitor.sh

# Check CPU usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    echo "WARNING: High CPU usage: $CPU_USAGE%"
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')
if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    echo "WARNING: High memory usage: $MEMORY_USAGE%"
fi

# Check disk usage
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)
if [ $DISK_USAGE -gt 80 ]; then
    echo "WARNING: High disk usage: $DISK_USAGE%"
fi
```

### Log Monitoring

#### 1. Error Log Monitoring
```bash
#!/bin/bash
# error_monitor.sh

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

## Security Operations

### Security Monitoring

#### 1. Failed Login Monitoring
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

#### 2. Access Log Analysis
```bash
#!/bin/bash
# access_analysis.sh

# Analyze access patterns
docker compose logs --since=24h | grep "GET\|POST\|PUT\|DELETE" | \
awk '{print $1, $2, $3}' | sort | uniq -c | sort -nr | head -10

# Check for unusual access patterns
docker compose logs --since=24h | grep "GET\|POST\|PUT\|DELETE" | \
awk '{print $1}' | sort | uniq -c | sort -nr | head -5
```

### Security Updates

#### 1. Dependency Updates
```bash
# Update Python dependencies
cd apps/backend
pip list --outdated
pip install --upgrade -r requirements.txt

# Update Node.js dependencies
cd apps/frontend
npm outdated
npm update
```

#### 2. Security Patches
```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Update Docker images
docker compose pull
docker compose up -d
```

## Maintenance Procedures

### Regular Maintenance

#### 1. Weekly Maintenance Checklist
- [ ] Check system health
- [ ] Review logs for errors
- [ ] Check resource usage
- [ ] Update dependencies
- [ ] Backup database
- [ ] Clean old logs
- [ ] Check security updates

#### 2. Monthly Maintenance Checklist
- [ ] Review system performance
- [ ] Analyze access patterns
- [ ] Update documentation
- [ ] Review security logs
- [ ] Test backup recovery
- [ ] Update monitoring scripts
- [ ] Review capacity planning

### Emergency Procedures

#### 1. Service Outage Response
1. **Immediate Response**
   - Check service status
   - Identify affected services
   - Notify stakeholders

2. **Recovery Actions**
   - Restart services
   - Check logs
   - Verify functionality

3. **Post-Incident**
   - Document incident
   - Analyze root cause
   - Update procedures

#### 2. Security Incident Response
1. **Detection**
   - Monitor security logs
   - Check for anomalies
   - Verify incident

2. **Containment**
   - Isolate affected systems
   - Preserve evidence
   - Notify security team

3. **Recovery**
   - Remove threats
   - Restore systems
   - Update security measures

## Documentation

### Runbook Maintenance

#### 1. Update Procedures
- Review procedures monthly
- Update based on incidents
- Test procedures regularly
- Document lessons learned

#### 2. Version Control
- Keep runbooks in version control
- Tag versions for releases
- Maintain change log
- Review changes with team

## Related Documentation

- [Troubleshooting Guide](common-issues.md)
- [Security Best Practices](../security/best-practices.md)
- [Production Deployment](../deployment/production.md)
- [Monitoring Guide](../docs/runbooks/observability.md)
