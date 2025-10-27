#!/usr/bin/env python3
"""
Test script to verify all authenticated endpoints work with Railway database
"""

import asyncio
import sys
import json
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent / "apps" / "backend"
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from main import app

def test_authentication_and_endpoints():
    """Test authentication and all endpoints"""
    client = TestClient(app)
    
    print("🚀 Testing authenticated endpoints with Railway database...")
    print("=" * 70)
    
    # Test accounts
    accounts = [
        {
            "email": "admin@kehati.org",
            "password": "password",
            "role": "super_admin"
        },
        {
            "email": "kaltim.admin@kehati.org", 
            "password": "password",
            "role": "regional_admin"
        }
    ]
    
    tokens = {}
    
    # Test authentication for both accounts
    for account in accounts:
        print(f"\n🔐 Testing authentication for {account['role']}...")
        try:
            # Test login endpoint
            response = client.post("/api/v1/auth/login", json={
                "email": account["email"],
                "password": account["password"]
            })
            
            if response.status_code == 200:
                data = response.json()
                tokens[account["role"]] = data.get("access_token")
                print(f"✅ {account['role']} login successful")
                print(f"   Token: {tokens[account['role']][:50]}...")
            else:
                print(f"❌ {account['role']} login failed: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"❌ {account['role']} authentication error: {e}")
    
    # Test endpoints with authentication
    print(f"\n📡 Testing API endpoints with authentication...")
    
    # Define endpoints to test
    endpoints_to_test = [
        # Public endpoints (no auth required)
        ("/", "GET", "Root endpoint", None),
        ("/health", "GET", "Health check", None),
        ("/docs", "GET", "API documentation", None),
        ("/redoc", "GET", "ReDoc documentation", None),
        
        # Protected endpoints (auth required)
        ("/api/v1/public/regions", "GET", "Get regions", "super_admin"),
        ("/api/v1/public/parks", "GET", "Get parks", "super_admin"),
        ("/api/v1/public/articles", "GET", "Get articles", "super_admin"),
        ("/api/v1/public/fauna", "GET", "Get fauna", "super_admin"),
        ("/api/v1/public/flora", "GET", "Get flora", "super_admin"),
        ("/api/v1/public/galleries", "GET", "Get galleries", "super_admin"),
        
        # Admin endpoints
        ("/api/v1/admin/users", "GET", "Get users (admin)", "super_admin"),
        ("/api/v1/admin/regions", "GET", "Get regions (admin)", "super_admin"),
        ("/api/v1/admin/parks", "GET", "Get parks (admin)", "super_admin"),
        ("/api/v1/admin/articles", "GET", "Get articles (admin)", "super_admin"),
        ("/api/v1/admin/fauna", "GET", "Get fauna (admin)", "super_admin"),
        ("/api/v1/admin/flora", "GET", "Get flora (admin)", "super_admin"),
        ("/api/v1/admin/galleries", "GET", "Get galleries (admin)", "super_admin"),
        
        # Regional admin endpoints
        ("/api/v1/regional/parks", "GET", "Get parks (regional)", "regional_admin"),
        ("/api/v1/regional/articles", "GET", "Get articles (regional)", "regional_admin"),
        ("/api/v1/regional/fauna", "GET", "Get fauna (regional)", "regional_admin"),
        ("/api/v1/regional/flora", "GET", "Get flora (regional)", "regional_admin"),
        ("/api/v1/regional/galleries", "GET", "Get galleries (regional)", "regional_admin"),
    ]
    
    # Test each endpoint
    for endpoint, method, description, required_role in endpoints_to_test:
        try:
            headers = {}
            if required_role and required_role in tokens:
                headers["Authorization"] = f"Bearer {tokens[required_role]}"
            
            if method == "GET":
                response = client.get(endpoint, headers=headers)
            elif method == "POST":
                response = client.post(endpoint, headers=headers)
            else:
                response = client.request(method, endpoint, headers=headers)
            
            # Determine status
            if response.status_code == 200:
                status = "✅"
            elif response.status_code == 401:
                status = "🔒"
            elif response.status_code == 403:
                status = "🚫"
            elif response.status_code == 404:
                status = "❓"
            elif response.status_code == 405:
                status = "⚠️"
            else:
                status = "❌"
            
            print(f"{status} {description}: {response.status_code}")
            
            # Show response for successful requests
            if response.status_code == 200 and len(response.content) < 1000:
                try:
                    data = response.json()
                    if isinstance(data, list):
                        print(f"   📊 Found {len(data)} items")
                    elif isinstance(data, dict):
                        print(f"   📊 Response: {list(data.keys())}")
                except:
                    pass
                    
        except Exception as e:
            print(f"❌ {description}: Error - {e}")
    
    # Test CRUD operations
    print(f"\n🔧 Testing CRUD operations...")
    
    # Test creating a new article (if authenticated)
    if "super_admin" in tokens:
        print("📝 Testing article creation...")
        try:
            article_data = {
                "title": "Test Article from Railway DB",
                "content": "This is a test article created via API",
                "summary": "Test summary",
                "status": "draft"
            }
            
            headers = {"Authorization": f"Bearer {tokens['super_admin']}"}
            response = client.post("/api/v1/admin/articles", 
                                 json=article_data, 
                                 headers=headers)
            
            if response.status_code in [200, 201]:
                print("✅ Article creation successful")
                article_id = response.json().get("id")
                print(f"   Article ID: {article_id}")
            else:
                print(f"⚠️ Article creation: {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                
        except Exception as e:
            print(f"❌ Article creation error: {e}")
    
    print(f"\n🎉 Endpoint testing completed!")
    return True

if __name__ == "__main__":
    test_authentication_and_endpoints()
