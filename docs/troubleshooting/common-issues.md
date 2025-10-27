# 🚨 Troubleshooting Common Issues

Comprehensive troubleshooting guide for common issues in the Taman Kehati project.

## Overview

This guide provides solutions to common issues that developers and users may encounter when working with the Taman Kehati system. Issues are categorized by component and include step-by-step solutions.

## Docker Issues

### Docker Service Won't Start

#### Problem: Docker services fail to start

```bash
Error: Cannot connect to the Docker daemon
```

#### Solutions:

1. **Check Docker Desktop Status**

   ```bash
   # Check if Docker Desktop is running
   docker --version
   docker compose --version
   ```

2. **Restart Docker Desktop**

   - Close Docker Desktop completely
   - Restart Docker Desktop
   - Wait for it to fully start

3. **Check Port Availability**

   ```bash
   # Check if ports are in use
   lsof -i :3000
   lsof -i :8000
   lsof -i :5432
   lsof -i :6379

   # Kill processes using ports if needed
   kill -9 <PID>
   ```

4. **Reset Docker Environment**

   ```bash
   # Clean up Docker environment
   ./docker-dev.sh clean

   # Rebuild and start
   ./docker-dev.sh start
   ```

### Database Connection Issues

#### Problem: Backend can't connect to PostgreSQL

```bash
Error: connection to server at "postgres" (172.18.0.2), port 5432 failed
```

#### Solutions:

1. **Check Database Service Status**

   ```bash
   # Check if postgres container is running
   docker compose ps postgres

   # Check postgres logs
   docker compose logs postgres
   ```

2. **Verify Database Configuration**

   ```bash
   # Check environment variables
   docker compose exec backend env | grep DATABASE

   # Test database connection
   docker compose exec postgres pg_isready -U kehati_user -d kehati_db
   ```

3. **Reset Database**

   ```bash
   # Stop services
   docker compose down

   # Remove database volume
   docker volume rm tamankehati_21_postgres_data

   # Start services again
   docker compose up -d
   ```

### Frontend Build Issues

#### Problem: Frontend fails to build

```bash
Error: Module not found: Can't resolve '@/components/ui/button'
```

#### Solutions:

1. **Check Node Modules**

   ```bash
   # Remove node_modules and reinstall
   cd apps/frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check TypeScript Configuration**

   ```bash
   # Verify tsconfig.json paths
   cat apps/frontend/tsconfig.json | grep paths
   ```

3. **Clear Next.js Cache**
   ```bash
   # Clear Next.js cache
   rm -rf apps/frontend/.next
   npm run dev
   ```

## Backend Issues

### API Endpoint Errors

#### Problem: 500 Internal Server Error

```bash
Error: Internal Server Error
```

#### Solutions:

1. **Check Backend Logs**

   ```bash
   # View backend logs
   docker compose logs backend

   # Follow logs in real-time
   docker compose logs -f backend
   ```

2. **Check Database Connection**

   ```bash
   # Test database connection
   docker compose exec backend python -c "from core.database import engine; print('DB OK')"
   ```

3. **Verify Environment Variables**
   ```bash
   # Check environment variables
   docker compose exec backend env
   ```

### Authentication Issues

#### Problem: JWT Token Invalid

```bash
Error: Could not validate credentials
```

#### Solutions:

1. **Check Token Expiration**

   ```bash
   # Verify token expiration time
   echo $ACCESS_TOKEN_EXPIRE_MINUTES
   ```

2. **Check Secret Key**

   ```bash
   # Verify secret key is set
   docker compose exec backend env | grep SECRET_KEY
   ```

3. **Clear Browser Storage**
   - Clear browser cookies and local storage
   - Log in again

### Database Migration Issues

#### Problem: Migration fails

```bash
Error: alembic.util.exc.CommandError: Can't locate revision identified by 'head'
```

#### Solutions:

1. **Check Migration Status**

   ```bash
   # Check current migration status
   docker compose exec backend alembic current

   # Check migration history
   docker compose exec backend alembic history
   ```

2. **Reset Migrations**

   ```bash
   # Reset to base
   docker compose exec backend alembic downgrade base

   # Run migrations again
   docker compose exec backend alembic upgrade head
   ```

3. **Manual Migration**

   ```bash
   # Create new migration
   docker compose exec backend alembic revision --autogenerate -m "fix migration"

   # Apply migration
   docker compose exec backend alembic upgrade head
   ```

## Frontend Issues

### React Component Errors

#### Problem: Component not rendering

```bash
Error: Element type is invalid
```

#### Solutions:

1. **Check Import Statements**

   ```typescript
   // Verify imports are correct
   import { Button } from "@/components/ui/button";
   ```

2. **Check Component Export**

   ```typescript
   // Ensure component is properly exported
   export { Button, buttonVariants };
   ```

3. **Check TypeScript Errors**
   ```bash
   # Check TypeScript errors
   npm run type-check
   ```

### API Integration Issues

#### Problem: API calls failing

```bash
Error: Network Error
```

#### Solutions:

1. **Check API URL**

   ```typescript
   // Verify API URL in environment
   console.log(process.env.NEXT_PUBLIC_API_URL);
   ```

2. **Check CORS Configuration**

   ```bash
   # Verify CORS origins in backend
   docker compose exec backend env | grep CORS
   ```

3. **Check Network Connectivity**
   ```bash
   # Test API endpoint
   curl http://localhost:8000/health
   ```

### State Management Issues

#### Problem: State not updating

```bash
Warning: Can't perform a React state update on an unmounted component
```

#### Solutions:

1. **Check useEffect Dependencies**

   ```typescript
   // Ensure dependencies are correct
   useEffect(() => {
     // effect
   }, [dependency]);
   ```

2. **Check Component Unmounting**

   ```typescript
   // Add cleanup function
   useEffect(() => {
     const controller = new AbortController();

     return () => {
       controller.abort();
     };
   }, []);
   ```

## Database Issues

### PostgreSQL Connection Issues

#### Problem: Database connection timeout

```bash
Error: connection timeout
```

#### Solutions:

1. **Check Database Status**

   ```bash
   # Check postgres status
   docker compose exec postgres pg_isready
   ```

2. **Check Connection Pool**

   ```bash
   # Check active connections
   docker compose exec postgres psql -U kehati_user -d kehati_db -c "SELECT * FROM pg_stat_activity;"
   ```

3. **Restart Database**
   ```bash
   # Restart postgres service
   docker compose restart postgres
   ```

### Data Integrity Issues

#### Problem: Foreign key constraint violations

```bash
Error: insert or update on table violates foreign key constraint
```

#### Solutions:

1. **Check Referenced Data**

   ```bash
   # Check if referenced record exists
   docker compose exec postgres psql -U kehati_user -d kehati_db -c "SELECT * FROM parks WHERE id = 1;"
   ```

2. **Fix Data Integrity**
   ```bash
   # Update or delete orphaned records
   docker compose exec postgres psql -U kehati_user -d kehati_db -c "DELETE FROM flora WHERE park_id NOT IN (SELECT id FROM parks);"
   ```

## Performance Issues

### Slow API Responses

#### Problem: API responses are slow

```bash
Response time: 5.2s
```

#### Solutions:

1. **Check Database Queries**

   ```bash
   # Enable query logging
   docker compose exec backend env | grep DEBUG
   ```

2. **Add Database Indexes**

   ```sql
   -- Add indexes for frequently queried columns
   CREATE INDEX idx_parks_status ON parks(status);
   CREATE INDEX idx_flora_park_id ON flora(park_id);
   ```

3. **Optimize Queries**
   ```python
   # Use select_related for foreign keys
   parks = db.query(Park).options(joinedload(Park.flora)).all()
   ```

### Memory Issues

#### Problem: High memory usage

```bash
Memory usage: 85%
```

#### Solutions:

1. **Check Container Resources**

   ```bash
   # Check container memory usage
   docker stats
   ```

2. **Optimize Docker Images**

   ```dockerfile
   # Use multi-stage builds
   FROM node:20-alpine AS builder
   # ... build steps
   FROM node:20-alpine AS production
   # ... production steps
   ```

3. **Add Memory Limits**
   ```yaml
   # docker-compose.yml
   services:
     backend:
       deploy:
         resources:
           limits:
             memory: 512M
   ```

## Environment Issues

### Environment Variable Problems

#### Problem: Environment variables not loading

```bash
Error: DATABASE_URL not found
```

#### Solutions:

1. **Check .env File**

   ```bash
   # Verify .env file exists and has correct values
   cat .env | grep DATABASE_URL
   ```

2. **Check Docker Environment**

   ```bash
   # Verify environment variables in container
   docker compose exec backend env | grep DATABASE_URL
   ```

3. **Restart Services**
   ```bash
   # Restart services to reload environment
   docker compose down
   docker compose up -d
   ```

### Port Conflicts

#### Problem: Port already in use

```bash
Error: Port 3000 is already in use
```

#### Solutions:

1. **Find Process Using Port**

   ```bash
   # Find process using port
   lsof -i :3000
   ```

2. **Kill Process**

   ```bash
   # Kill process using port
   kill -9 <PID>
   ```

3. **Use Different Port**
   ```bash
   # Change port in docker-compose.yml
   ports:
     - "3001:3000"  # Use port 3001 instead
   ```

## Debugging Tools

### Logging

#### Enable Debug Logging

```bash
# Backend debug logging
docker compose exec backend env | grep DEBUG
docker compose exec backend env | grep LOG_LEVEL

# Frontend debug logging
npm run dev -- --verbose
```

#### View Logs

```bash
# View all logs
docker compose logs

# View specific service logs
docker compose logs backend
docker compose logs frontend
docker compose logs postgres

# Follow logs in real-time
docker compose logs -f
```

### Database Debugging

#### Connect to Database

```bash
# Connect to postgres
docker compose exec postgres psql -U kehati_user -d kehati_db

# Check table structure
\dt
\d parks

# Check data
SELECT * FROM parks LIMIT 5;
```

#### Check Database Performance

```sql
-- Check slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Network Debugging

#### Check Network Connectivity

```bash
# Test internal network
docker compose exec backend ping postgres
docker compose exec frontend ping backend

# Test external connectivity
docker compose exec backend curl -I https://google.com
```

#### Check Port Accessibility

```bash
# Test port accessibility
telnet localhost 3000
telnet localhost 8000
telnet localhost 5432
```

## Getting Help

### Documentation Resources

- [Docker Setup Guide](../getting-started/docker-setup.md)
- [Development Workflow](../development/workflow.md)
- [API Documentation](../development/api-docs.md)
- [Troubleshooting Guide](common-issues.md)

### Community Support

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check existing documentation
- **Stack Overflow**: Search for similar issues

### Emergency Contacts

- **Technical Support**: support@tamankehati.com
- **Emergency**: +62-xxx-xxx-xxxx

## Related Documentation

- [Docker Setup Guide](../getting-started/docker-setup.md)
- [Development Workflow](../development/workflow.md)
- [API Documentation](../development/api-docs.md)
- [Security Best Practices](../security/best-practices.md)
