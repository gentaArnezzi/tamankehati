# 🚀 Development Workflow

Complete guide for developing and contributing to the Taman Kehati project.

## Development Setup

### Prerequisites

- Docker Desktop installed and running
- Git configured with your credentials
- Code editor (VS Code recommended)
- Terminal/Command line access

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd tamankehati_21

# Copy environment variables
cp env.example .env

# Start development environment
./docker-dev.sh start
```

## Development Workflow

### 1. Feature Development

#### Create Feature Branch

```bash
# Create and switch to new branch
git checkout -b feature/your-feature-name

# Make your changes
# Test locally
# Commit changes
git add .
git commit -m "feat: add your feature description"
```

#### Backend Development

```bash
# Work on backend changes
cd apps/backend

# Add new API endpoints
# Update models
# Add tests
# Update documentation
```

#### Frontend Development

```bash
# Work on frontend changes
cd apps/frontend

# Add new components
# Update pages
# Add tests
# Update styles
```

### 2. Testing

#### Backend Testing

```bash
# Run backend tests
docker compose exec backend pytest

# Run specific test file
docker compose exec backend pytest tests/test_specific.py

# Run with coverage
docker compose exec backend pytest --cov=.
```

#### Frontend Testing

```bash
# Run frontend tests
docker compose exec frontend npm test

# Run specific test
docker compose exec frontend npm test -- --testNamePattern="specific test"

# Run with coverage
docker compose exec frontend npm test -- --coverage
```

#### Integration Testing

```bash
# Test API endpoints
curl http://localhost:8000/api/health

# Test frontend
curl http://localhost:3000

# Test database connection
docker compose exec backend python -c "from core.database import engine; print('DB OK')"
```

### 3. Code Quality

#### Backend Code Quality

```bash
# Format code
docker compose exec backend black .

# Lint code
docker compose exec backend flake8 .

# Type checking
docker compose exec backend mypy .

# Sort imports
docker compose exec backend isort .
```

#### Frontend Code Quality

```bash
# Format code
docker compose exec frontend npm run format

# Lint code
docker compose exec frontend npm run lint

# Type checking
docker compose exec frontend npm run type-check
```

### 4. Database Management

#### Create Migration

```bash
# Create new migration
docker compose exec backend alembic revision --autogenerate -m "description"

# Apply migration
docker compose exec backend alembic upgrade head

# Check migration status
docker compose exec backend alembic current
```

#### Database Reset

```bash
# Reset database (development only)
./docker-dev.sh clean
./docker-dev.sh start
./docker-dev.sh migrate
```

### 5. Git Workflow

#### Commit Convention

Use conventional commits:

```
feat: add new feature
fix: fix bug
docs: update documentation
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

#### Pull Request Process

1. Create feature branch
2. Make changes and test
3. Update documentation
4. Create pull request
5. Code review
6. Merge to main

## Development Tools

### VS Code Extensions

Recommended extensions:

- Python
- TypeScript and JavaScript
- Docker
- GitLens
- Prettier
- ESLint
- Tailwind CSS IntelliSense

### VS Code Settings

```json
{
  "python.defaultInterpreterPath": "./apps/backend/venv/bin/python",
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

### Debugging

#### Backend Debugging

```bash
# Run with debug mode
docker compose exec backend python -m debugpy --listen 0.0.0.0:5678 --wait-for-client main.py

# Attach debugger in VS Code
# Use Python: Remote Attach configuration
```

#### Frontend Debugging

```bash
# Enable debug mode
NODE_ENV=development DEBUG=true

# Use browser dev tools
# React DevTools extension
# Redux DevTools (if using Redux)
```

## API Development

### Adding New Endpoints

#### Backend API

```python
# apps/backend/api/v1/endpoints/your_module.py
from fastapi import APIRouter, Depends
from core.dependencies import get_current_user

router = APIRouter()

@router.get("/your-endpoint")
async def your_endpoint(current_user = Depends(get_current_user)):
    return {"message": "Hello World"}
```

#### Register Router

```python
# apps/backend/api/v1/api.py
from api.v1.endpoints import your_module

api_router.include_router(your_module.router, prefix="/your-module", tags=["your-module"])
```

### Frontend API Integration

```typescript
// apps/frontend/src/lib/api-client.ts
export const yourApiCall = async (data: YourType) => {
  const response = await apiClient.post("/api/v1/your-endpoint", data);
  return response.data;
};
```

## Frontend Development

### Component Development

```typescript
// apps/frontend/src/components/YourComponent.tsx
import React from "react";
import { cn } from "@/lib/utils";

interface YourComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export const YourComponent: React.FC<YourComponentProps> = ({ className, children }) => {
  return <div className={cn("default-styles", className)}>{children}</div>;
};
```

### Page Development

```typescript
// apps/frontend/src/app/your-page/page.tsx
import { YourComponent } from "@/components/YourComponent";

export default function YourPage() {
  return (
    <div>
      <YourComponent>Your page content</YourComponent>
    </div>
  );
}
```

## Testing Strategies

### Unit Tests

- Test individual functions and components
- Mock external dependencies
- Aim for high coverage

### Integration Tests

- Test API endpoints
- Test database interactions
- Test component integration

### End-to-End Tests

- Test complete user workflows
- Test critical business logic
- Test cross-browser compatibility

## Performance Optimization

### Backend Optimization

- Database query optimization
- Caching strategies
- Async/await patterns
- Connection pooling

### Frontend Optimization

- Code splitting
- Image optimization
- Bundle size optimization
- Lazy loading

## Security Considerations

### Backend Security

- Input validation
- SQL injection prevention
- Authentication/authorization
- Rate limiting

### Frontend Security

- XSS prevention
- CSRF protection
- Secure data handling
- Content Security Policy

## Documentation

### Code Documentation

- Docstrings for functions
- Type annotations
- README files for modules
- API documentation

### User Documentation

- Feature documentation
- User guides
- Troubleshooting guides
- API reference

## Deployment

### Development Deployment

```bash
# Local development
./docker-dev.sh start

# Test deployment
docker compose -f docker-compose.prod.yml up -d
```

### Production Deployment

```bash
# Production deployment
# Follow production deployment guide
# Use CI/CD pipeline
# Monitor deployment
```

## Best Practices

### Code Quality

- Follow coding standards
- Write tests
- Document code
- Review code

### Git Practices

- Use meaningful commit messages
- Keep commits atomic
- Use feature branches
- Review before merging

### Security Practices

- Validate all inputs
- Use secure defaults
- Keep dependencies updated
- Follow security guidelines

## Troubleshooting

### Common Development Issues

- See [Troubleshooting Guide](../troubleshooting/common-issues.md)
- Check logs
- Verify environment
- Test components

### Getting Help

- Check documentation
- Search issues
- Ask team members
- Create issue if needed

## Related Documentation

- [Quick Start Guide](../getting-started/quick-start.md)
- [Docker Setup](../getting-started/docker-setup.md)
- [API Documentation](api-docs.md)
- [Testing Guide](testing.md)
- [Troubleshooting Guide](../troubleshooting/common-issues.md)
