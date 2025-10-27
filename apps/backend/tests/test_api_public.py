"""
Test cases for public API endpoints.
"""
import pytest
from fastapi.testclient import TestClient

def test_health_check(client: TestClient):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "healthy"

def test_public_flora_list(client: TestClient, sample_flora_data):
    """Test public flora list endpoint."""
    # First, create a flora entry
    response = client.post("/api/v1/flora/", json=sample_flora_data)
    assert response.status_code == 201
    
    # Test public endpoint
    response = client.get("/api/public/flora/")
    assert response.status_code == 200
    
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "limit" in data
    assert "offset" in data

def test_public_flora_search(client: TestClient, sample_flora_data):
    """Test public flora search functionality."""
    # Create test data
    response = client.post("/api/v1/flora/", json=sample_flora_data)
    assert response.status_code == 201
    
    # Test search
    response = client.get("/api/public/flora/?search=Test")
    assert response.status_code == 200
    
    data = response.json()
    assert len(data["items"]) > 0

def test_public_flora_pagination(client: TestClient, sample_flora_data):
    """Test public flora pagination."""
    # Create multiple entries
    for i in range(5):
        data = sample_flora_data.copy()
        data["nama_lokal"] = f"Test Flora {i}"
        response = client.post("/api/v1/flora/", json=data)
        assert response.status_code == 201
    
    # Test pagination
    response = client.get("/api/public/flora/?limit=2&offset=0")
    assert response.status_code == 200
    
    data = response.json()
    assert len(data["items"]) <= 2
    assert data["limit"] == 2
    assert data["offset"] == 0

def test_public_fauna_list(client: TestClient, sample_fauna_data):
    """Test public fauna list endpoint."""
    # Create fauna entry
    response = client.post("/api/v1/fauna/", json=sample_fauna_data)
    assert response.status_code == 201
    
    # Test public endpoint
    response = client.get("/api/public/fauna/")
    assert response.status_code == 200
    
    data = response.json()
    assert "items" in data
    assert "total" in data

def test_public_search_endpoint(client: TestClient, sample_flora_data, sample_fauna_data):
    """Test global search endpoint."""
    # Create test data
    client.post("/api/v1/flora/", json=sample_flora_data)
    client.post("/api/v1/fauna/", json=sample_fauna_data)
    
    # Test global search
    response = client.get("/api/public/search/?q=Test")
    assert response.status_code == 200
    
    data = response.json()
    assert "flora" in data
    assert "fauna" in data
    assert "artikel" in data

def test_public_flora_filters(client: TestClient, sample_flora_data):
    """Test flora filtering by various parameters."""
    # Create test data
    response = client.post("/api/v1/flora/", json=sample_flora_data)
    assert response.status_code == 201
    
    # Test filtering by famili
    response = client.get("/api/public/flora/?famili=Testaceae")
    assert response.status_code == 200
    
    data = response.json()
    if data["items"]:
        assert data["items"][0]["famili"] == "Testaceae"
    
    # Test filtering by status_iucn
    response = client.get("/api/public/flora/?status_iucn=LC")
    assert response.status_code == 200
    
    # Test filtering by wilayah
    response = client.get("/api/public/flora/?wilayah=Test%20region")
    assert response.status_code == 200
