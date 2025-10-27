# 🔐 Environment Variables Reference

Complete reference for all environment variables used in the Taman Kehati project.

## Root Environment Variables

### Database Configuration

```bash
# PostgreSQL Database URLs
DATABASE_URL="postgresql+asyncpg://kehati_user:kehati_password@localhost:5432/kehati_db"
DATABASE_URL_SYNC="postgresql://kehati_user:kehati_password@localhost:5432/kehati_db"

# Redis Cache URL
REDIS_URL="redis://localhost:6379"
```

### Security Configuration

```bash
# JWT Secret Key (CHANGE IN PRODUCTION!)
SECRET_KEY="your-secret-key-change-in-production"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES="30"
```

### CORS Configuration

```bash
# Allowed CORS origins
CORS_ORIGINS="http://localhost:3000,http://frontend:3000"
```

### Environment Settings

```bash
# Environment type
ENVIRONMENT="development"
DEBUG="true"
```

### Frontend Configuration

```bash
# API URL for frontend
NEXT_PUBLIC_API_URL="http://localhost:8000"
```

## Backend-Specific Variables

### Database Settings

```bash
# Database connection pool settings
DB_POOL_SIZE="10"
DB_MAX_OVERFLOW="20"
DB_POOL_TIMEOUT="30"
DB_POOL_RECYCLE="3600"
```

### File Upload Settings

```bash
# File upload configuration
MAX_FILE_SIZE="10485760"  # 10MB in bytes
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp"
UPLOAD_DIRECTORY="./uploads"
```

### AI Service Configuration

```bash
# AI Provider settings
AI_PROVIDER="free"  # Options: free, google, openai
AI_MODEL="gpt-3.5-turbo"
AI_MAX_TOKENS="1000"
AI_TEMPERATURE="0.7"
```

### Email Configuration (Optional)

```bash
# SMTP settings for notifications
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USERNAME="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM_EMAIL="noreply@tamankehati.com"
```

### Logging Configuration

```bash
# Logging settings
LOG_LEVEL="INFO"
LOG_FORMAT="json"
LOG_FILE="logs/app.log"
```

## Frontend-Specific Variables

### Next.js Configuration

```bash
# Next.js settings
NODE_ENV="development"
NEXT_TELEMETRY_DISABLED="1"
NEXT_PUBLIC_APP_NAME="Taman Kehati"
NEXT_PUBLIC_APP_VERSION="2.1.0"
```

### API Configuration

```bash
# API endpoints
API_BASE_URL="http://backend:8000"  # Internal Docker network
NEXT_PUBLIC_API_URL="http://localhost:8000"  # External access
API_TIMEOUT="30000"  # 30 seconds
```

### Map Configuration

```bash
# Map settings
NEXT_PUBLIC_MAP_TILE_URL="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
NEXT_PUBLIC_MAP_ATTRIBUTION="© OpenStreetMap contributors"
NEXT_PUBLIC_DEFAULT_LAT="-6.2088"
NEXT_PUBLIC_DEFAULT_LNG="106.8456"
NEXT_PUBLIC_DEFAULT_ZOOM="10"
```

### Feature Flags

```bash
# Feature toggles
NEXT_PUBLIC_ENABLE_AI="true"
NEXT_PUBLIC_ENABLE_MAPS="true"
NEXT_PUBLIC_ENABLE_UPLOADS="true"
NEXT_PUBLIC_ENABLE_NOTIFICATIONS="true"
```

## Production Environment Variables

### Security (Production)

```bash
# Production security settings
SECRET_KEY="your-super-secure-secret-key-here"
CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
ENVIRONMENT="production"
DEBUG="false"
```

### Database (Production)

```bash
# Production database
DATABASE_URL="postgresql+asyncpg://user:password@prod-db-host:5432/kehati_prod"
REDIS_URL="redis://prod-redis-host:6379"
```

### CDN & Storage (Production)

```bash
# CDN configuration
CDN_URL="https://cdn.yourdomain.com"
UPLOAD_DIRECTORY="/var/www/uploads"
STATIC_URL="https://static.yourdomain.com"
```

### Monitoring (Production)

```bash
# Monitoring and logging
SENTRY_DSN="https://your-sentry-dsn"
LOG_LEVEL="WARNING"
ENABLE_METRICS="true"
```

## Docker Environment Variables

### Docker Compose Override

```bash
# Docker-specific settings
COMPOSE_PROJECT_NAME="tamankehati"
COMPOSE_FILE="docker-compose.yml"
DOCKER_BUILDKIT="1"
```

### Container Configuration

```bash
# Container settings
BACKEND_PORT="8000"
FRONTEND_PORT="3000"
POSTGRES_PORT="5432"
REDIS_PORT="6379"
```

## Environment File Templates

### Development (.env.development)

```bash
# Development environment
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=DEBUG
DATABASE_URL=postgresql+asyncpg://kehati_user:kehati_password@localhost:5432/kehati_db
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Production (.env.production)

```bash
# Production environment
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=WARNING
DATABASE_URL=postgresql+asyncpg://prod_user:secure_password@prod-host:5432/kehati_prod
REDIS_URL=redis://prod-redis-host:6379
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
SECRET_KEY=your-super-secure-production-secret-key
```

### Testing (.env.test)

```bash
# Testing environment
ENVIRONMENT=test
DEBUG=true
LOG_LEVEL=DEBUG
DATABASE_URL=postgresql+asyncpg://test_user:test_password@localhost:5432/kehati_test
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Variable Validation

### Required Variables

These variables must be set for the application to function:

- `DATABASE_URL`
- `SECRET_KEY`
- `NEXT_PUBLIC_API_URL`

### Optional Variables

These variables have default values:

- `DEBUG` (default: false)
- `LOG_LEVEL` (default: INFO)
- `ACCESS_TOKEN_EXPIRE_MINUTES` (default: 30)

### Validation Rules

- `SECRET_KEY`: Minimum 32 characters
- `DATABASE_URL`: Must be valid PostgreSQL URL
- `REDIS_URL`: Must be valid Redis URL
- `CORS_ORIGINS`: Comma-separated URLs

## Security Best Practices

### 1. Secret Management

- Never commit `.env` files to version control
- Use strong, unique secret keys
- Rotate secrets regularly
- Use environment-specific values

### 2. Database Security

- Use strong passwords
- Limit database access by IP
- Enable SSL connections in production
- Regular security updates

### 3. CORS Configuration

- Specify exact origins in production
- Avoid wildcard origins
- Use HTTPS in production
- Validate all origins

## Troubleshooting

### Common Issues

#### Database Connection Errors

```bash
# Check database URL format
echo $DATABASE_URL

# Verify database is running
docker compose ps postgres
```

#### CORS Issues

```bash
# Check CORS origins
echo $CORS_ORIGINS

# Verify frontend URL matches
echo $NEXT_PUBLIC_API_URL
```

#### Missing Variables

```bash
# Check all required variables
env | grep -E "(DATABASE_URL|SECRET_KEY|NEXT_PUBLIC_API_URL)"
```

## Related Documentation

- [Docker Development Setup](../getting-started/docker-setup.md)
- [Production Deployment](../deployment/production.md)
- [Security Best Practices](../security/best-practices.md)
