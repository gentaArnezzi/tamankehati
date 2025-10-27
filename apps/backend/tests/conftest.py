"""
Test configuration and fixtures for Taman Kehati backend tests.
"""
import pytest
import asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from httpx import AsyncClient

from main import app
from core.database.base import Base
from core.database.session import get_db
from core.config.env import get_settings

# Test database URL
TEST_DATABASE_URL = "sqlite:///./test.db"

# Create test engine
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        session.close()
        # Drop tables after test
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database session override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
async def async_client(db_session):
    """Create an async test client."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()

@pytest.fixture
def sample_flora_data():
    """Sample flora data for testing."""
    return {
        "nama_lokal": "Test Flora",
        "nama_ilmiah": "Testus scientificus",
        "famili": "Testaceae",
        "deskripsi": "Test description",
        "habitat": "Test habitat",
        "status_iucn": "LC",
        "wilayah": "Test region",
        "gambar_url": "https://example.com/test.jpg"
    }

@pytest.fixture
def sample_fauna_data():
    """Sample fauna data for testing."""
    return {
        "nama_lokal": "Test Fauna",
        "nama_ilmiah": "Testus animalis",
        "famili": "Testidae",
        "deskripsi": "Test description",
        "habitat": "Test habitat",
        "status_iucn": "LC",
        "wilayah": "Test region",
        "gambar_url": "https://example.com/test.jpg"
    }

@pytest.fixture
def admin_credentials():
    """Admin user credentials for testing."""
    return {
        "email": "admin@kehati.org",
        "password": "password"
    }
