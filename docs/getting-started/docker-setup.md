# 🐳 Docker Development Setup

Complete guide for running Taman Kehati with Docker for development.

## Overview

This project uses Docker Compose to orchestrate multiple services:

- **Backend**: FastAPI + Python 3.12
- **Frontend**: Next.js + Node.js 20
- **Database**: PostgreSQL 15
- **Cache**: Redis 7

## Quick Start

### 1. Prerequisites

- Docker Desktop installed and running
- At least 8GB RAM available
- Ports 3000, 8000, 5432, 6379 available

### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit if needed (defaults work for development)
nano .env
```

### 3. Start Development Environment

```bash
# Make script executable
chmod +x docker-dev.sh

# Start all services
./docker-dev.sh start
```

### 4. Verify Installation

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Docker Commands

### Using the Script

```bash
./docker-dev.sh start    # Start all services
./docker-dev.sh stop     # Stop all services
./docker-dev.sh logs     # View logs
./docker-dev.sh restart  # Restart services
./docker-dev.sh clean    # Clean up (removes data)
```

### Direct Docker Compose

```bash
docker compose up -d           # Start in background
docker compose down -v          # Stop and remove volumes
docker compose logs -f          # Follow logs
docker compose restart          # Restart services
docker compose build           # Rebuild images
```

## Service Details

### Backend Service

- **Image**: `kehati-backend:dev`
- **Port**: 8000
- **Hot Reload**: Enabled
- **Volume Mount**: `./apps/backend:/app`

### Frontend Service

- **Image**: `kehati-frontend:dev`
- **Port**: 3000
- **Hot Reload**: Enabled
- **Volume Mount**: `./apps/frontend:/app`

### PostgreSQL Database

- **Image**: `postgres:15-alpine`
- **Port**: 5432
- **Database**: `kehati_db`
- **User**: `kehati_user`
- **Password**: `kehati_password`

### Redis Cache

- **Image**: `redis:7-alpine`
- **Port**: 6379
- **Persistence**: Enabled

## Development Features

### Hot Reload

Both frontend and backend support hot reload:

- **Backend**: Changes to Python files trigger auto-restart
- **Frontend**: Changes to React/Next.js files trigger auto-reload

### Volume Mounts

- Source code is mounted for live editing
- `node_modules` and `.next` are excluded for performance
- `__pycache__` is excluded to prevent conflicts

### Health Checks

All services include health checks:

- Database connectivity
- Redis connectivity
- Backend API health
- Frontend accessibility

## Database Management

### Run Migrations

```bash
# Inside backend container
docker compose exec backend alembic upgrade head

# Or using script
./docker-dev.sh migrate
```

### Database Access

```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U kehati_user -d kehati_db

# Connect to Redis
docker compose exec redis redis-cli
```

### Reset Database

```bash
# Stop services and remove volumes
./docker-dev.sh clean

# Start fresh
./docker-dev.sh start
```

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Check what's using the port
lsof -i :3000
lsof -i :8000

# Kill the process or change ports in docker-compose.yml
```

#### Permission Issues

```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod +x docker-dev.sh
```

#### Out of Memory

```bash
# Increase Docker memory limit in Docker Desktop settings
# Or reduce services by commenting out unused ones
```

#### Database Connection Issues

```bash
# Check if PostgreSQL is healthy
docker compose ps postgres

# View PostgreSQL logs
docker compose logs postgres
```

### Debug Commands

```bash
# View all service status
docker compose ps

# View service logs
docker compose logs [service-name]

# Execute commands in containers
docker compose exec backend bash
docker compose exec frontend sh
```

## Production Considerations

For production deployment:

- Use production Dockerfiles (`Dockerfile.prod`)
- Set up proper environment variables
- Configure SSL/TLS
- Set up monitoring and logging
- Use external database services

## Next Steps

- [Production Deployment](../deployment/production.md)
- [Environment Configuration](../deployment/environment-config.md)
- [Development Workflow](../development/workflow.md)
