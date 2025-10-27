# 🚀 Quick Start Guide

Get up and running with Taman Kehati in under 5 minutes!

## Prerequisites

- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- **Git** - For cloning the repository
- **8GB RAM** - Recommended for smooth operation

## Quick Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tamankehati_21
```

### 2. Copy Environment Variables

```bash
cp env.example .env
```

### 3. Start with Docker

```bash
# Make script executable
chmod +x docker-dev.sh

# Start all services
./docker-dev.sh start
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## What's Running?

The Docker setup includes:

- **Frontend** (Next.js) - Port 3000
- **Backend** (FastAPI) - Port 8000
- **PostgreSQL** - Port 5432
- **Redis** - Port 6379

## First Steps

1. **Create Admin User**: Visit http://localhost:3000/register
2. **Login**: Use your credentials at http://localhost:3000/login
3. **Explore Dashboard**: Navigate to the admin dashboard
4. **Add Parks**: Start by adding your first park

## Common Commands

```bash
# View logs
./docker-dev.sh logs

# Stop services
./docker-dev.sh stop

# Restart services
./docker-dev.sh restart

# Clean up (removes data)
./docker-dev.sh clean
```

## Need Help?

- Check [Troubleshooting Guide](../troubleshooting/common-issues.md)
- Review [Docker Setup Guide](docker-setup.md)
- See [Installation Guide](installation.md) for detailed setup

## Next Steps

- [Development Workflow](../development/workflow.md)
- [API Documentation](../development/api-docs.md)
- [Features Overview](../features/)
