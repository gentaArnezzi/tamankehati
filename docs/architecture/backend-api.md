# 🏗️ Backend API Architecture

Comprehensive documentation of the FastAPI backend architecture and design patterns.

## Overview

The Taman Kehati backend is built with FastAPI, providing a modern, fast, and scalable API for biodiversity management. It follows clean architecture principles with clear separation of concerns.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (FastAPI)                      │
├─────────────────────────────────────────────────────────────┤
│                 Business Logic Layer                        │
├─────────────────────────────────────────────────────────────┤
│                  Data Access Layer                          │
├─────────────────────────────────────────────────────────────┤
│                   Database Layer                            │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. API Layer (FastAPI)

#### Application Structure

```
apps/backend/
├── main.py                 # FastAPI application entry point
├── api/                    # API routes and endpoints
│   ├── v1/                # API version 1
│   │   ├── api.py         # Main API router
│   │   └── endpoints/     # Individual endpoint modules
├── core/                  # Core functionality
│   ├── config.py         # Configuration management
│   ├── database.py       # Database connection
│   ├── security.py       # Authentication & authorization
│   └── dependencies.py   # Dependency injection
├── models/               # SQLAlchemy models
├── schemas/              # Pydantic schemas
├── services/             # Business logic
└── utils/                # Utility functions
```

#### FastAPI Application Setup

```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.v1.api import api_router
from core.config import settings

app = FastAPI(
    title="Taman Kehati API",
    description="Biodiversity Management System API",
    version="2.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")
```

### 2. Configuration Management

#### Settings Configuration

```python
# core/config.py
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    DATABASE_URL_SYNC: str

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
```

### 3. Database Layer

#### SQLAlchemy Setup

```python
# core/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from core.config import settings

# Async engine for FastAPI
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=settings.DEBUG
)

# Sync engine for migrations
sync_engine = create_engine(
    settings.DATABASE_URL_SYNC,
    pool_pre_ping=True,
    pool_recycle=300
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency for database sessions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### Model Definition

```python
# models/park.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base

class Park(Base):
    __tablename__ = "parks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    location = Column(String(255))
    area = Column(Integer)  # in hectares
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    zones = relationship("Zone", back_populates="park")
    flora = relationship("Flora", back_populates="park")
    fauna = relationship("Fauna", back_populates="park")
```

### 4. Schema Layer (Pydantic)

#### Request/Response Schemas

```python
# schemas/park.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ParkBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    location: Optional[str] = None
    area: Optional[int] = Field(None, ge=0)

class ParkCreate(ParkBase):
    pass

class ParkUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    location: Optional[str] = None
    area: Optional[int] = Field(None, ge=0)

class Park(ParkBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ParkWithRelations(Park):
    zones: List["Zone"] = []
    flora: List["Flora"] = []
    fauna: List["Fauna"] = []
```

### 5. Service Layer

#### Business Logic Services

```python
# services/park_service.py
from sqlalchemy.orm import Session
from models.park import Park
from schemas.park import ParkCreate, ParkUpdate
from typing import List, Optional

class ParkService:
    def __init__(self, db: Session):
        self.db = db

    def create_park(self, park_data: ParkCreate) -> Park:
        """Create a new park"""
        db_park = Park(**park_data.dict())
        self.db.add(db_park)
        self.db.commit()
        self.db.refresh(db_park)
        return db_park

    def get_park(self, park_id: int) -> Optional[Park]:
        """Get park by ID"""
        return self.db.query(Park).filter(Park.id == park_id).first()

    def get_parks(self, skip: int = 0, limit: int = 100) -> List[Park]:
        """Get list of parks"""
        return self.db.query(Park).offset(skip).limit(limit).all()

    def update_park(self, park_id: int, park_data: ParkUpdate) -> Optional[Park]:
        """Update park"""
        db_park = self.get_park(park_id)
        if not db_park:
            return None

        update_data = park_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_park, field, value)

        self.db.commit()
        self.db.refresh(db_park)
        return db_park

    def delete_park(self, park_id: int) -> bool:
        """Delete park"""
        db_park = self.get_park(park_id)
        if not db_park:
            return False

        self.db.delete(db_park)
        self.db.commit()
        return True
```

### 6. API Endpoints

#### Endpoint Implementation

```python
# api/v1/endpoints/parks.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.database import get_db
from core.dependencies import get_current_user
from schemas.park import Park, ParkCreate, ParkUpdate
from services.park_service import ParkService
from typing import List

router = APIRouter()

@router.post("/", response_model=Park, status_code=status.HTTP_201_CREATED)
async def create_park(
    park_data: ParkCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new park"""
    park_service = ParkService(db)
    return park_service.create_park(park_data)

@router.get("/", response_model=List[Park])
async def get_parks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get list of parks"""
    park_service = ParkService(db)
    return park_service.get_parks(skip=skip, limit=limit)

@router.get("/{park_id}", response_model=Park)
async def get_park(
    park_id: int,
    db: Session = Depends(get_db)
):
    """Get park by ID"""
    park_service = ParkService(db)
    park = park_service.get_park(park_id)
    if not park:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Park not found"
        )
    return park

@router.put("/{park_id}", response_model=Park)
async def update_park(
    park_id: int,
    park_data: ParkUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update park"""
    park_service = ParkService(db)
    park = park_service.update_park(park_id, park_data)
    if not park:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Park not found"
        )
    return park

@router.delete("/{park_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_park(
    park_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete park"""
    park_service = ParkService(db)
    success = park_service.delete_park(park_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Park not found"
        )
```

## Authentication & Authorization

### JWT Authentication

```python
# core/security.py
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token"""
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return username
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
```

### Role-Based Access Control

```python
# core/dependencies.py
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import verify_token
from models.user import User
from typing import List

def get_current_user(
    token: str = Depends(verify_token),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    user = db.query(User).filter(User.username == token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user

def require_roles(required_roles: List[str]):
    """Dependency to require specific roles"""
    def role_checker(current_user: User = Depends(get_current_user)):
        if not any(role in current_user.roles for role in required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker

# Usage in endpoints
@router.post("/admin-only")
async def admin_endpoint(
    current_user: User = Depends(require_roles(["admin"]))
):
    """Admin only endpoint"""
    pass
```

## Database Migrations

### Alembic Configuration

```python
# alembic/env.py
from alembic import context
from sqlalchemy import engine_from_config, pool
from core.database import Base
from core.config import settings

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL_SYNC)

target_metadata = Base.metadata

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

## Error Handling

### Custom Exception Handlers

```python
# main.py
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError

app = FastAPI()

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "error_code": exc.status_code}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"detail": "Validation error", "errors": exc.errors()}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
```

## API Documentation

### Automatic Documentation

FastAPI automatically generates:

- **Swagger UI**: Available at `/docs`
- **ReDoc**: Available at `/redoc`
- **OpenAPI Schema**: Available at `/openapi.json`

### Custom Documentation

```python
# Custom endpoint documentation
@router.post(
    "/parks",
    response_model=Park,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new park",
    description="Create a new park with the provided information",
    response_description="The created park",
    tags=["parks"]
)
async def create_park(park_data: ParkCreate):
    """Create a new park"""
    pass
```

## Performance Optimization

### Database Optimization

```python
# Query optimization
def get_parks_with_relations(db: Session):
    """Get parks with related data using joins"""
    return db.query(Park).options(
        joinedload(Park.zones),
        joinedload(Park.flora),
        joinedload(Park.fauna)
    ).all()

# Pagination
def get_parks_paginated(db: Session, page: int = 1, size: int = 20):
    """Get paginated parks"""
    offset = (page - 1) * size
    return db.query(Park).offset(offset).limit(size).all()
```

### Caching

```python
# Redis caching
from redis import Redis
from core.config import settings

redis_client = Redis.from_url(settings.REDIS_URL)

def get_cached_parks():
    """Get parks from cache or database"""
    cached = redis_client.get("parks:all")
    if cached:
        return json.loads(cached)

    parks = get_parks_from_db()
    redis_client.setex("parks:all", 300, json.dumps(parks))  # 5 minutes
    return parks
```

## Testing

### Unit Tests

```python
# tests/test_park_service.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.database import Base
from services.park_service import ParkService
from schemas.park import ParkCreate

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_create_park(db):
    park_service = ParkService(db)
    park_data = ParkCreate(name="Test Park", description="Test Description")
    park = park_service.create_park(park_data)

    assert park.name == "Test Park"
    assert park.description == "Test Description"
    assert park.id is not None
```

## Related Documentation

- [System Architecture Overview](overview.md)
- [Frontend Application Architecture](frontend-app.md)
- [Database Schema Design](database-schema.md)
- [Security Architecture](../security/authentication.md)
- [API Documentation](../development/api-docs.md)
