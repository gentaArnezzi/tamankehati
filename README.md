# 🌿 Taman Kehati

**Modern Biodiversity Management System**

A comprehensive platform for managing biodiversity data, park information, and environmental monitoring built with modern web technologies.

## 🚀 Quick Start

Get up and running in under 5 minutes:

```bash
# Clone the repository
git clone <repository-url>
cd tamankehati_21

# Copy environment variables
cp env.example .env

# Start with Docker (Recommended)
chmod +x docker-dev.sh
./docker-dev.sh start

# Or using Makefile
make up
```

**Access the application:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python 3.12 + SQLAlchemy
- **Database**: PostgreSQL 15 + PostGIS
- **Cache**: Redis 7
- **Containerization**: Docker + Docker Compose

### System Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│  (PostgreSQL)   │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Files  │    │   Redis Cache   │    │   File Storage   │
│   (Public)       │    │   Port: 6379     │    │   (Uploads)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📚 Documentation

### For Clients (Deployment):
👉 **START HERE**: [`docs/client/QUICK_START_CLIENT.md`](docs/client/QUICK_START_CLIENT.md)

All client deployment documentation: [`docs/client/`](docs/client/)

### For Developers:
Comprehensive documentation is available in the [`docs/`](docs/) directory:

### Getting Started

- [Quick Start Guide](docs/getting-started/quick-start.md) - Get up and running quickly
- [Docker Setup](docs/getting-started/docker-setup.md) - Complete Docker development guide
- [Installation Guide](docs/getting-started/installation.md) - Detailed installation instructions

### Development

- [Development Workflow](docs/development/workflow.md) - How to contribute and develop
- [API Documentation](docs/development/api-docs.md) - Complete API reference
- [Frontend Components](docs/development/frontend-components.md) - UI component library
- [Testing Guide](docs/development/testing.md) - Testing strategies and practices

### Architecture

- [System Architecture](docs/architecture/overview.md) - High-level system design
- [Backend API](docs/architecture/backend-api.md) - FastAPI backend documentation
- [Frontend Application](docs/architecture/frontend-app.md) - Next.js frontend documentation
- [Database Schema](docs/architecture/database-schema.md) - PostgreSQL database design

### Deployment

- [Docker Development](docs/deployment/docker-development.md) - Local development with Docker
- [Production Deployment](docs/deployment/production.md) - Production deployment guide
- [Environment Configuration](docs/deployment/environment-config.md) - Environment variables setup

### Features

- [Dashboard System](docs/features/dashboard.md) - Admin dashboard functionality
- [Park Management](docs/features/park-management.md) - Park data management
- [Interactive Maps](docs/features/interactive-maps.md) - Geospatial features
- [File Upload System](docs/features/file-upload.md) - Media management

### Troubleshooting

- [Common Issues](docs/troubleshooting/common-issues.md) - Frequently encountered problems
- [Debug Guide](docs/troubleshooting/debugging.md) - Debugging techniques
- [Performance Optimization](docs/troubleshooting/performance.md) - Performance tuning

## 🐳 Docker Commands

### Development Commands

```bash
./docker-dev.sh start    # Start all services
./docker-dev.sh stop     # Stop all services
./docker-dev.sh logs     # View logs
./docker-dev.sh restart  # Restart services
./docker-dev.sh clean    # Clean up (removes data)
```

### Production Deployment (for Client)

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check status
docker-compose -f docker-compose.prod.yml ps
```

📚 **Client Documentation:**
- Quick Start: [`docs/client/QUICK_START_CLIENT.md`](docs/client/QUICK_START_CLIENT.md)
- Full Guide: [`docs/client/CLIENT_DEPLOYMENT_GUIDE.md`](docs/client/CLIENT_DEPLOYMENT_GUIDE.md)
- Checklist: [`docs/client/DEPLOYMENT_CHECKLIST.md`](docs/client/DEPLOYMENT_CHECKLIST.md)
- All Client Docs: [`docs/client/`](docs/client/)

### Direct Docker Compose (Development)

```bash
docker compose up -d           # Start in background
docker compose down -v          # Stop and remove volumes
docker compose logs -f          # Follow logs
docker compose restart          # Restart services
docker compose build           # Rebuild images
```

## 🔧 Development

### Prerequisites

- Docker Desktop installed and running
- Git configured
- Code editor (VS Code recommended)

### Setup

1. Clone the repository
2. Copy `env.example` to `.env`
3. Run `./docker-dev.sh start`
4. Access http://localhost:3000

### Project Structure

```
tamankehati_21/
├── apps/
│   ├── backend/          # FastAPI backend
│   └── frontend/         # Next.js frontend
├── docs/                 # Documentation
├── docker-compose.yml    # Docker orchestration
├── docker-dev.sh        # Development script
└── env.example          # Environment template
```

## 🔐 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- CORS configuration
- Environment-based configuration

## 🤖 AI Features

- Flora and fauna detection
- Species identification
- AI-powered content generation
- Multiple AI provider support

## 📊 Features

### Core Features

- **Dashboard**: Comprehensive admin dashboard
- **Park Management**: Complete park data management
- **Interactive Maps**: Geospatial visualization
- **File Upload**: Media management system
- **User Management**: Role-based access control
- **AI Integration**: Species detection and identification

### Technical Features

- **Hot Reload**: Development with live updates
- **Health Checks**: Service monitoring
- **Database Migrations**: Schema management
- **API Documentation**: Automatic OpenAPI/Swagger
- **Type Safety**: TypeScript and Pydantic validation

## 🚀 Deployment

### Development

```bash
./docker-dev.sh start
```

### Production

See [Production Deployment Guide](docs/deployment/production.md) for detailed instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

See [Development Workflow](docs/development/workflow.md) for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the [`docs/`](docs/) directory
- **Issues**: Create an issue on GitHub
- **Troubleshooting**: See [Common Issues](docs/troubleshooting/common-issues.md)

## 🔄 Version History

- **v2.1.0**: Current version with Docker support
- **v2.0.0**: Major refactor with modern architecture
- **v1.0.0**: Initial release

## 📞 Contact

For questions or support, please contact the development team.

---

**Built with ❤️ for biodiversity conservation**
