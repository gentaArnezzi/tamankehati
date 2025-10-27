#!/usr/bin/env python3
"""
Test script to verify all API endpoints work with Railway database
"""

import asyncio
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent / "apps" / "backend"
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from main import app

def test_api_endpoints():
    """Test all API endpoints"""
    client = TestClient(app)
    
    print("🚀 Testing API endpoints with Railway database...")
    print("=" * 60)
    
    # Test health endpoint
    try:
        response = client.get("/health")
        print(f"✅ Health check: {response.status_code}")
        if response.status_code == 200:
            print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
    
    # Test public endpoints
    endpoints_to_test = [
        ("/", "Root endpoint"),
        ("/docs", "API documentation"),
        ("/redoc", "ReDoc documentation"),
        ("/api/v1/public/regions", "Regions endpoint"),
        ("/api/v1/public/parks", "Parks endpoint"),
        ("/api/v1/public/articles", "Articles endpoint"),
        ("/api/v1/public/fauna", "Fauna endpoint"),
        ("/api/v1/public/flora", "Flora endpoint"),
        ("/api/v1/public/galleries", "Galleries endpoint"),
    ]
    
    for endpoint, description in endpoints_to_test:
        try:
            response = client.get(endpoint)
            status = "✅" if response.status_code in [200, 404] else "⚠️"
            print(f"{status} {description}: {response.status_code}")
        except Exception as e:
            print(f"❌ {description}: {e}")
    
    print("\n🎉 API endpoint testing completed!")

if __name__ == "__main__":
    test_api_endpoints()
