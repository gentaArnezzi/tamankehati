# 🧪 Testing Guide

Comprehensive testing strategies and practices for the Taman Kehati project.

## Overview

Testing is crucial for maintaining code quality and ensuring the reliability of the Taman Kehati system. This guide covers testing strategies for both backend and frontend components.

## Testing Pyramid

```
        ┌─────────────────┐
        │   E2E Tests     │  ← Few, High-level
        │   (Playwright)  │
        ├─────────────────┤
        │ Integration     │  ← Some, Medium-level
        │ Tests (API)     │
        ├─────────────────┤
        │ Unit Tests      │  ← Many, Low-level
        │ (Jest/Pytest)   │
        └─────────────────┘
```

## Backend Testing

### Testing Stack

- **pytest**: Python testing framework
- **pytest-asyncio**: Async testing support
- **pytest-cov**: Coverage reporting
- **httpx**: HTTP client for API testing
- **factory_boy**: Test data generation

### Test Structure

```
apps/backend/
├── tests/
│   ├── conftest.py          # Test configuration
│   ├── test_main.py         # Basic API tests
│   ├── test_auth.py         # Authentication tests
│   ├── test_parks.py        # Park endpoint tests
│   ├── test_flora.py        # Flora endpoint tests
│   ├── test_fauna.py        # Fauna endpoint tests
│   ├── test_activities.py   # Activity endpoint tests
│   ├── test_upload.py       # File upload tests
│   ├── factories/           # Test data factories
│   │   ├── __init__.py
│   │   ├── user_factory.py
│   │   ├── park_factory.py
│   │   ├── flora_factory.py
│   │   └── fauna_factory.py
│   └── utils/               # Test utilities
│       ├── __init__.py
│       ├── database.py
│       └── auth.py
```

### Test Configuration

#### conftest.py

```python
import pytest
import asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from httpx import AsyncClient
from main import app
from core.database import Base, get_db
from tests.factories import UserFactory, ParkFactory

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(db):
    user = UserFactory()
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def auth_headers(client, test_user):
    response = client.post("/api/v1/auth/login", json={
        "username": test_user.username,
        "password": "testpassword"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
```

### Unit Tests

#### Test Models

```python
# tests/test_models.py
import pytest
from sqlalchemy.orm import Session
from models.park import Park
from models.flora import Flora
from tests.factories import ParkFactory, FloraFactory

def test_park_creation(db: Session):
    """Test park model creation"""
    park = ParkFactory()
    db.add(park)
    db.commit()
    db.refresh(park)

    assert park.id is not None
    assert park.name is not None
    assert park.created_at is not None

def test_park_relationships(db: Session):
    """Test park relationships"""
    park = ParkFactory()
    flora = FloraFactory(park_id=park.id)

    db.add(park)
    db.add(flora)
    db.commit()
    db.refresh(park)

    assert len(park.flora) == 1
    assert park.flora[0].id == flora.id
```

#### Test Services

```python
# tests/test_services.py
import pytest
from sqlalchemy.orm import Session
from services.park_service import ParkService
from schemas.park import ParkCreate, ParkUpdate
from tests.factories import ParkFactory

def test_create_park(db: Session):
    """Test park creation service"""
    park_service = ParkService(db)
    park_data = ParkCreate(
        name="Test Park",
        description="Test Description",
        location="Test Location",
        area_hectares=100.0
    )

    park = park_service.create_park(park_data)

    assert park.name == "Test Park"
    assert park.description == "Test Description"
    assert park.area_hectares == 100.0
    assert park.id is not None

def test_get_park(db: Session):
    """Test park retrieval service"""
    park_service = ParkService(db)
    existing_park = ParkFactory()
    db.add(existing_park)
    db.commit()
    db.refresh(existing_park)

    park = park_service.get_park(existing_park.id)

    assert park is not None
    assert park.id == existing_park.id
    assert park.name == existing_park.name

def test_update_park(db: Session):
    """Test park update service"""
    park_service = ParkService(db)
    existing_park = ParkFactory()
    db.add(existing_park)
    db.commit()
    db.refresh(existing_park)

    update_data = ParkUpdate(name="Updated Park Name")
    updated_park = park_service.update_park(existing_park.id, update_data)

    assert updated_park is not None
    assert updated_park.name == "Updated Park Name"
    assert updated_park.id == existing_park.id

def test_delete_park(db: Session):
    """Test park deletion service"""
    park_service = ParkService(db)
    existing_park = ParkFactory()
    db.add(existing_park)
    db.commit()
    db.refresh(existing_park)

    success = park_service.delete_park(existing_park.id)

    assert success is True

    # Verify park is deleted
    deleted_park = park_service.get_park(existing_park.id)
    assert deleted_park is None
```

### Integration Tests

#### Test API Endpoints

```python
# tests/test_parks.py
import pytest
from httpx import AsyncClient
from tests.factories import ParkFactory, UserFactory

@pytest.mark.asyncio
async def test_create_park(client: AsyncClient, auth_headers: dict):
    """Test park creation endpoint"""
    park_data = {
        "name": "Test Park",
        "description": "Test Description",
        "location": "Test Location",
        "area_hectares": 100.0
    }

    response = await client.post(
        "/api/v1/parks",
        json=park_data,
        headers=auth_headers
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Park"
    assert data["description"] == "Test Description"
    assert data["area_hectares"] == 100.0

@pytest.mark.asyncio
async def test_get_parks(client: AsyncClient):
    """Test parks listing endpoint"""
    response = await client.get("/api/v1/parks")

    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert isinstance(data["items"], list)

@pytest.mark.asyncio
async def test_get_park(client: AsyncClient, db):
    """Test park retrieval endpoint"""
    park = ParkFactory()
    db.add(park)
    db.commit()
    db.refresh(park)

    response = await client.get(f"/api/v1/parks/{park.id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == park.id
    assert data["name"] == park.name

@pytest.mark.asyncio
async def test_update_park(client: AsyncClient, auth_headers: dict, db):
    """Test park update endpoint"""
    park = ParkFactory()
    db.add(park)
    db.commit()
    db.refresh(park)

    update_data = {
        "name": "Updated Park Name",
        "description": "Updated Description"
    }

    response = await client.put(
        f"/api/v1/parks/{park.id}",
        json=update_data,
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Park Name"
    assert data["description"] == "Updated Description"

@pytest.mark.asyncio
async def test_delete_park(client: AsyncClient, auth_headers: dict, db):
    """Test park deletion endpoint"""
    park = ParkFactory()
    db.add(park)
    db.commit()
    db.refresh(park)

    response = await client.delete(
        f"/api/v1/parks/{park.id}",
        headers=auth_headers
    )

    assert response.status_code == 204

    # Verify park is deleted
    get_response = await client.get(f"/api/v1/parks/{park.id}")
    assert get_response.status_code == 404
```

#### Test Authentication

```python
# tests/test_auth.py
import pytest
from httpx import AsyncClient
from tests.factories import UserFactory

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, db):
    """Test successful login"""
    user = UserFactory(password="testpassword")
    db.add(user)
    db.commit()
    db.refresh(user)

    response = await client.post("/api/v1/auth/login", json={
        "username": user.username,
        "password": "testpassword"
    })

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    """Test login with invalid credentials"""
    response = await client.post("/api/v1/auth/login", json={
        "username": "nonexistent",
        "password": "wrongpassword"
    })

    assert response.status_code == 401

@pytest.mark.asyncio
async def test_protected_endpoint(client: AsyncClient):
    """Test protected endpoint without authentication"""
    response = await client.get("/api/v1/auth/me")

    assert response.status_code == 401

@pytest.mark.asyncio
async def test_protected_endpoint_with_auth(client: AsyncClient, auth_headers: dict):
    """Test protected endpoint with authentication"""
    response = await client.get("/api/v1/auth/me", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "username" in data
```

### Test Factories

#### User Factory

```python
# tests/factories/user_factory.py
import factory
from factory.alchemy import SQLAlchemyModelFactory
from models.user import User
from tests.utils.database import TestingSessionLocal

class UserFactory(SQLAlchemyModelFactory):
    class Meta:
        model = User
        sqlalchemy_session = TestingSessionLocal()

    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.LazyAttribute(lambda obj: f"{obj.username}@example.com")
    full_name = factory.Faker("name")
    hashed_password = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"  # "secret"
    is_active = True
    is_verified = True
```

#### Park Factory

```python
# tests/factories/park_factory.py
import factory
from factory.alchemy import SQLAlchemyModelFactory
from models.park import Park
from tests.utils.database import TestingSessionLocal

class ParkFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Park
        sqlalchemy_session = TestingSessionLocal()

    name = factory.Faker("company")
    description = factory.Faker("text", max_nb_chars=200)
    location = factory.Faker("city")
    area_hectares = factory.Faker("pydecimal", left_digits=5, right_digits=2, positive=True)
    status = "active"
```

### Running Tests

#### Test Commands

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=.

# Run specific test file
pytest tests/test_parks.py

# Run specific test
pytest tests/test_parks.py::test_create_park

# Run with verbose output
pytest -v

# Run tests in parallel
pytest -n auto
```

#### Test Configuration

```ini
# pytest.ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts =
    --strict-markers
    --strict-config
    --cov=.
    --cov-report=html
    --cov-report=term-missing
    --cov-fail-under=80
markers =
    slow: marks tests as slow (deselect with '-m "not slow"')
    integration: marks tests as integration tests
    unit: marks tests as unit tests
```

## Frontend Testing

### Testing Stack

- **Jest**: JavaScript testing framework
- **React Testing Library**: React component testing
- **MSW**: API mocking
- **Playwright**: End-to-end testing

### Test Structure

```
apps/frontend/
├── src/
│   ├── __tests__/           # Test files
│   │   ├── components/      # Component tests
│   │   ├── pages/           # Page tests
│   │   ├── hooks/           # Hook tests
│   │   ├── utils/           # Utility tests
│   │   └── setup.ts         # Test setup
│   ├── components/
│   ├── pages/
│   └── utils/
├── tests/                    # E2E tests
│   ├── auth.spec.ts
│   ├── parks.spec.ts
│   └── flora.spec.ts
├── jest.config.js
├── playwright.config.ts
└── package.json
```

### Unit Tests

#### Component Tests

```typescript
// src/__tests__/components/park-card.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { ParkCard } from "@/components/features/park-card";
import { Park } from "@/types/park";

const mockPark: Park = {
  id: 1,
  name: "Test Park",
  description: "Test Description",
  location: "Test Location",
  area_hectares: 100,
  status: "active",
  created_at: "2023-10-27T10:00:00Z",
  updated_at: "2023-10-27T10:00:00Z",
};

describe("ParkCard", () => {
  it("renders park information", () => {
    render(<ParkCard park={mockPark} />);

    expect(screen.getByText("Test Park")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("100 ha")).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", () => {
    const onEdit = jest.fn();
    render(<ParkCard park={mockPark} onEdit={onEdit} />);

    fireEvent.click(screen.getByText("Edit"));
    expect(onEdit).toHaveBeenCalledWith(mockPark);
  });

  it("calls onDelete when delete button is clicked", () => {
    const onDelete = jest.fn();
    render(<ParkCard park={mockPark} onDelete={onDelete} />);

    fireEvent.click(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalledWith(mockPark);
  });

  it("shows loading state when isLoading is true", () => {
    render(<ParkCard park={mockPark} isLoading={true} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
```

#### Hook Tests

```typescript
// src/__tests__/hooks/use-parks.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useParks } from "@/hooks/use-parks";
import { server } from "@/__tests__/mocks/server";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe("useParks", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("fetches parks successfully", async () => {
    const { result } = renderHook(() => useParks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0].name).toBe("Test Park 1");
  });

  it("handles error state", async () => {
    server.use(
      rest.get("/api/v1/parks", (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result } = renderHook(() => useParks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});
```

#### API Mocking

```typescript
// src/__tests__/mocks/handlers.ts
import { rest } from "msw";

export const handlers = [
  rest.get("/api/v1/parks", (req, res, ctx) => {
    return res(
      ctx.json({
        items: [
          {
            id: 1,
            name: "Test Park 1",
            description: "Test Description 1",
            location: "Test Location 1",
            area_hectares: 100,
            status: "active",
            created_at: "2023-10-27T10:00:00Z",
            updated_at: "2023-10-27T10:00:00Z",
          },
          {
            id: 2,
            name: "Test Park 2",
            description: "Test Description 2",
            location: "Test Location 2",
            area_hectares: 200,
            status: "active",
            created_at: "2023-10-27T10:00:00Z",
            updated_at: "2023-10-27T10:00:00Z",
          },
        ],
        total: 2,
        skip: 0,
        limit: 100,
      })
    );
  }),

  rest.post("/api/v1/parks", (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 3,
        name: "New Park",
        description: "New Description",
        location: "New Location",
        area_hectares: 150,
        status: "active",
        created_at: "2023-10-27T10:00:00Z",
        updated_at: "2023-10-27T10:00:00Z",
      })
    );
  }),

  rest.get("/api/v1/auth/me", (req, res, ctx) => {
    return res(
      ctx.json({
        id: 1,
        username: "testuser",
        email: "test@example.com",
        full_name: "Test User",
        roles: ["user"],
        is_active: true,
        created_at: "2023-10-27T10:00:00Z",
      })
    );
  }),
];
```

### Integration Tests

#### Page Tests

```typescript
// src/__tests__/pages/parks.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ParksPage } from "@/app/(dashboard)/parks/page";
import { server } from "@/__tests__/mocks/server";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe("ParksPage", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("renders parks list", async () => {
    render(<ParksPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Test Park 1")).toBeInTheDocument();
    });

    expect(screen.getByText("Test Park 2")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    render(<ParksPage />, { wrapper: createWrapper() });

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("handles error state", async () => {
    server.use(
      rest.get("/api/v1/parks", (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<ParksPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Error loading parks")).toBeInTheDocument();
    });
  });
});
```

### End-to-End Tests

#### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

#### E2E Test Example

```typescript
// tests/parks.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Parks Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.fill('[data-testid="username"]', "testuser");
    await page.fill('[data-testid="password"]', "testpassword");
    await page.click('[data-testid="login-button"]');
    await page.waitForURL("/dashboard");
  });

  test("should display parks list", async ({ page }) => {
    await page.goto("/parks");

    await expect(page.locator('[data-testid="parks-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="park-card"]')).toHaveCount(2);
  });

  test("should create new park", async ({ page }) => {
    await page.goto("/parks");

    await page.click('[data-testid="create-park-button"]');

    await page.fill('[data-testid="park-name"]', "New Test Park");
    await page.fill('[data-testid="park-description"]', "New Test Description");
    await page.fill('[data-testid="park-location"]', "New Test Location");
    await page.fill('[data-testid="park-area"]', "150");

    await page.click('[data-testid="save-park-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="park-card"]')).toHaveCount(3);
  });

  test("should edit existing park", async ({ page }) => {
    await page.goto("/parks");

    await page.click('[data-testid="park-card"]:first-child [data-testid="edit-button"]');

    await page.fill('[data-testid="park-name"]', "Updated Park Name");
    await page.click('[data-testid="save-park-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="park-card"]:first-child')).toContainText("Updated Park Name");
  });

  test("should delete park", async ({ page }) => {
    await page.goto("/parks");

    const initialCount = await page.locator('[data-testid="park-card"]').count();

    await page.click('[data-testid="park-card"]:first-child [data-testid="delete-button"]');
    await page.click('[data-testid="confirm-delete-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="park-card"]')).toHaveCount(initialCount - 1);
  });
});
```

### Running Tests

#### Test Commands

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- parks.test.tsx

# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e -- --headed

# Run E2E tests for specific browser
npm run test:e2e -- --project=chromium
```

#### Test Configuration

```javascript
// jest.config.js
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testEnvironment: "jest-environment-jsdom",
  collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}", "!src/**/*.d.ts", "!src/**/*.stories.{js,jsx,ts,tsx}"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

## Test Data Management

### Test Database

```python
# tests/utils/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.database import Base

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_test_db():
    Base.metadata.create_all(bind=engine)

def drop_test_db():
    Base.metadata.drop_all(bind=engine)
```

### Test Utilities

```python
# tests/utils/auth.py
from fastapi.testclient import TestClient
from main import app
from tests.factories import UserFactory

def get_auth_headers(client: TestClient, user=None):
    """Get authentication headers for testing"""
    if not user:
        user = UserFactory()

    response = client.post("/api/v1/auth/login", json={
        "username": user.username,
        "password": "testpassword"
    })

    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
```

## Continuous Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.12"

      - name: Install dependencies
        run: |
          cd apps/backend
          pip install -r requirements.txt
          pip install pytest pytest-cov pytest-asyncio

      - name: Run tests
        run: |
          cd apps/backend
          pytest --cov=. --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: apps/backend/coverage.xml

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: apps/frontend/package-lock.json

      - name: Install dependencies
        run: |
          cd apps/frontend
          npm ci

      - name: Run tests
        run: |
          cd apps/frontend
          npm test -- --coverage --watchAll=false

      - name: Run E2E tests
        run: |
          cd apps/frontend
          npm run test:e2e
```

## Best Practices

### Test Organization

- Group related tests in describe blocks
- Use descriptive test names
- Keep tests focused and atomic
- Mock external dependencies
- Use factories for test data

### Test Data

- Use factories for consistent test data
- Clean up test data after each test
- Use realistic test data
- Avoid hardcoded values

### Assertions

- Use specific assertions
- Test both positive and negative cases
- Verify side effects
- Check error conditions

### Performance

- Run tests in parallel when possible
- Use test databases for isolation
- Mock slow operations
- Keep tests fast and reliable

## Related Documentation

- [Development Workflow](workflow.md)
- [API Documentation](api-docs.md)
- [Frontend Components](frontend-components.md)
- [Troubleshooting Guide](../troubleshooting/common-issues.md)
