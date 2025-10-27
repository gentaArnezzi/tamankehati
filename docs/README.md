# 📚 Documentation Index

Complete index of all documentation in the Taman Kehati project.

## Overview

This index provides a comprehensive overview of all documentation available in the Taman Kehati project, organized by category and purpose.

## Getting Started

### Quick Start Guides

- **[Quick Start Guide](getting-started/quick-start.md)** - Get up and running quickly
- **[Docker Setup Guide](getting-started/docker-setup.md)** - Set up Docker development environment
- **[Installation Guide](getting-started/installation.md)** - Detailed installation instructions

### Prerequisites

- Docker Desktop
- Git
- Code Editor (VS Code recommended)

## Architecture Documentation

### System Architecture

- **[System Overview](architecture/overview.md)** - High-level system architecture
- **[Backend API Architecture](architecture/backend-api.md)** - FastAPI backend design
- **[Frontend Application Architecture](architecture/frontend-app.md)** - Next.js frontend design
- **[Database Schema Design](architecture/database-schema.md)** - PostgreSQL database design

### Design Patterns

- Clean Architecture principles
- Microservices patterns
- API design patterns
- Component architecture

## Development Guides

### Development Workflow

- **[Development Workflow](development/workflow.md)** - Complete development process
- **[API Documentation](development/api-docs.md)** - Complete API reference
- **[Testing Guide](development/testing.md)** - Testing strategies and practices
- **[Frontend Components](development/frontend-components.md)** - Component library guide

### Code Quality

- TypeScript best practices
- Python coding standards
- Testing strategies
- Code review process

## Deployment Documentation

### Production Deployment

- **[Production Deployment](deployment/production.md)** - Production deployment guide
- Docker production setup
- Environment configuration
- SSL certificate setup

### Deployment Strategies

- Docker containerization
- Environment management
- Backup and recovery
- Monitoring setup

## Security Documentation

### Authentication & Authorization

- **[Authentication System](security/authentication.md)** - JWT authentication system
- **[Security Best Practices](security/best-practices.md)** - Security guidelines
- Role-based access control
- Password security

### Security Measures

- Input validation
- SQL injection prevention
- File upload security
- Rate limiting

## AI System Documentation

### AI Features

- **[AI System Overview](ai/overview.md)** - AI capabilities and features
- Species identification
- Content generation
- Data analysis

### AI Providers

- Free AI provider
- Google AI integration
- OpenAI integration
- Provider factory pattern

## Features Documentation

### Core Features

- **[Dashboard System](features/dashboard.md)** - Admin dashboard functionality
- **[Interactive Maps](features/interactive-maps.md)** - Geospatial visualization
- Park management
- Species management

### User Features

- User authentication
- Role-based access
- File uploads
- Data visualization

## Reference Documentation

### Configuration

- **[Environment Variables](reference/environment-variables.md)** - Configuration reference
- Docker configuration
- Database configuration
- API configuration

### API Reference

- Authentication endpoints
- Park management endpoints
- Species management endpoints
- File upload endpoints

## Troubleshooting

### Common Issues

- **[Troubleshooting Guide](troubleshooting/common-issues.md)** - Solutions to common problems
- Docker issues
- Database issues
- API issues
- Frontend issues

### Debugging

- Log analysis
- Performance debugging
- Error handling
- Monitoring

## Runbooks

### Operational Procedures

- **[Operational Runbooks](runbooks/operational.md)** - Day-to-day operations
- **[Observability Guide](runbooks/observability.md)** - Monitoring and logging
- System administration
- Incident response

### Maintenance

- Daily health checks
- Weekly maintenance
- Security updates
- Backup procedures

## Documentation Standards

### Writing Guidelines

- Clear and concise language
- Code examples
- Step-by-step instructions
- Visual diagrams

### Maintenance

- Regular updates
- Version control
- Review process
- User feedback

## Getting Help

### Support Resources

- Documentation search
- Community forums
- Issue tracking
- Contact information

### Contributing

- Documentation contributions
- Code contributions
- Bug reports
- Feature requests

## Quick Reference

### Common Commands

```bash
# Docker commands
./docker-dev.sh start    # Start all services
./docker-dev.sh stop     # Stop all services
./docker-dev.sh logs     # View logs
./docker-dev.sh clean    # Clean environment

# Development commands
npm run dev              # Start frontend
npm run build            # Build frontend
npm run test             # Run tests

# Backend commands
uvicorn main:app --reload # Start backend
pytest                   # Run tests
alembic upgrade head     # Run migrations
```

### Important URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Database: localhost:5432

### Key Files

- `docker-compose.yml` - Docker configuration
- `env.example` - Environment variables template
- `package.json` - Frontend dependencies
- `requirements.txt` - Backend dependencies

## Documentation Updates

### Recent Updates

- Added comprehensive AI system documentation
- Updated security best practices
- Enhanced troubleshooting guide
- Added observability documentation

### Planned Updates

- Performance optimization guide
- Advanced deployment strategies
- Integration testing guide
- User manual

## Feedback

### Documentation Feedback

- Report documentation issues
- Suggest improvements
- Request new documentation
- Share your experience

### Contact

- Documentation Team: docs@tamankehati.com
- Technical Support: support@tamankehati.com
- General Inquiries: info@tamankehati.com

---

_This documentation index is maintained by the Taman Kehati development team. Last updated: October 2023_
