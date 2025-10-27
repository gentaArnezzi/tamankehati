# 🏗️ System Architecture

High-level overview of the Taman Kehati system architecture and design principles.

## Architecture Overview

Taman Kehati follows a modern microservices architecture with clear separation of concerns:

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
│   Static Files  │    │   Redis Cache    │    │   File Storage   │
│   (Public)       │    │   Port: 6379     │    │   (Uploads)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Core Components

### 1. Frontend Layer (Next.js)

- **Framework**: Next.js 14 with App Router
- **UI Library**: React with Tailwind CSS
- **State Management**: TanStack Query + Zustand
- **Maps**: Leaflet with React-Leaflet
- **Charts**: Recharts for data visualization

### 2. Backend Layer (FastAPI)

- **Framework**: FastAPI with Python 3.12
- **Authentication**: JWT with role-based access control
- **API Documentation**: Automatic OpenAPI/Swagger
- **Validation**: Pydantic models
- **Database ORM**: SQLAlchemy with Alembic migrations

### 3. Database Layer (PostgreSQL)

- **Database**: PostgreSQL 15 with PostGIS extension
- **Connection Pooling**: AsyncPG for async operations
- **Migrations**: Alembic for schema management
- **Spatial Data**: PostGIS for geospatial features

### 4. Cache Layer (Redis)

- **Cache**: Redis 7 for session storage and caching
- **Session Management**: Redis-based sessions
- **Background Tasks**: Celery integration (optional)

## Technology Stack

### Frontend Technologies

- **Next.js 14**: React framework with SSR/SSG
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Animation library
- **React Hook Form**: Form management
- **Zod**: Schema validation

### Backend Technologies

- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: Python SQL toolkit and ORM
- **Alembic**: Database migration tool
- **Pydantic**: Data validation using Python type hints
- **JWT**: JSON Web Token authentication
- **Python-multipart**: File upload handling

### Database & Storage

- **PostgreSQL 15**: Primary database
- **PostGIS**: Spatial database extension
- **Redis 7**: Caching and session storage
- **File System**: Local file storage for uploads

### DevOps & Deployment

- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Nginx**: Reverse proxy (production)
- **GitHub Actions**: CI/CD pipeline

## Design Principles

### 1. Separation of Concerns

- Clear boundaries between frontend, backend, and database
- Modular architecture with independent services
- Single responsibility principle for each component

### 2. Scalability

- Stateless backend services
- Horizontal scaling capabilities
- Database connection pooling
- Caching strategies

### 3. Security

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- CORS configuration
- Environment-based configuration

### 4. Maintainability

- Type safety with TypeScript and Pydantic
- Comprehensive API documentation
- Database migrations
- Modular component structure

### 5. Performance

- Async/await patterns
- Database query optimization
- Frontend code splitting
- Image optimization
- Caching strategies

## Data Flow

### 1. User Authentication

```
User Login → Frontend → Backend API → JWT Validation → Database → Response
```

### 2. Data Retrieval

```
Frontend Request → API Gateway → Backend Service → Database Query → Cache Check → Response
```

### 3. File Upload

```
File Upload → Frontend → Backend API → File Validation → Storage → Database Record
```

### 4. Real-time Updates

```
Data Change → Backend → Cache Update → Frontend Polling → UI Update
```

## Security Architecture

### Authentication Flow

1. User submits credentials
2. Backend validates against database
3. JWT token generated with user roles
4. Token stored in Redis for session management
5. Frontend stores token for subsequent requests

### Authorization Levels

- **Super Admin**: Full system access
- **Regional Admin**: Regional park management
- **Park Admin**: Single park management
- **User**: Basic park viewing

### Data Protection

- Input validation on all endpoints
- SQL injection prevention via ORM
- XSS protection via React sanitization
- CSRF protection via SameSite cookies

## Scalability Considerations

### Horizontal Scaling

- Stateless backend services
- Load balancer ready
- Database read replicas support
- Redis clustering capability

### Performance Optimization

- Database indexing strategy
- Query optimization
- Frontend code splitting
- CDN integration ready

### Monitoring & Observability

- Health check endpoints
- Structured logging
- Error tracking
- Performance metrics

## Development Architecture

### Local Development

- Docker Compose for service orchestration
- Hot reload for both frontend and backend
- Volume mounts for live code editing
- Health checks for service monitoring

### Testing Strategy

- Unit tests for individual components
- Integration tests for API endpoints
- End-to-end tests for user workflows
- Database migration testing

## Future Considerations

### Planned Enhancements

- Microservices decomposition
- Event-driven architecture
- Real-time notifications
- Mobile application support
- Advanced AI integration

### Technology Upgrades

- Next.js 15 migration
- FastAPI 0.100+ features
- PostgreSQL 16 support
- Redis 8 integration

## Related Documentation

- [Backend API Architecture](backend-api.md)
- [Frontend Application Architecture](frontend-app.md)
- [Database Schema Design](database-schema.md)
- [Security Architecture](../security/authentication.md)
