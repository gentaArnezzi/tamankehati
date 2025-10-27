#!/usr/bin/env python3
"""
Test working endpoints with Railway database
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

def test_working_endpoints():
    """Test working endpoints with authentication"""
    client = TestClient(app)
    
    print("🚀 Testing working endpoints with Railway database...")
    print("=" * 70)
    
    # Test authentication
    print("🔐 Testing authentication...")
    try:
        response = client.post("/api/v1/auth/login", json={
            "email": "admin@kehati.org",
            "password": "password"
        })
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            print(f"✅ Super admin login successful")
            print(f"   Token: {token[:50]}...")
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        return False
    
    # Test endpoints with authentication
    headers = {"Authorization": f"Bearer {token}"}
    
    print(f"\n📡 Testing API endpoints with authentication...")
    
    # Define working endpoints to test
    endpoints_to_test = [
        # Public endpoints (no auth required)
        ("/", "GET", "Root endpoint", None),
        ("/health", "GET", "Health check", None),
        ("/docs", "GET", "API documentation", None),
        
        # Public data endpoints
        ("/api/public/parks", "GET", "Get parks (public)", None),
        ("/api/public/fauna", "GET", "Get fauna (public)", None),
        ("/api/public/flora", "GET", "Get flora (public)", None),
        ("/api/public/galeri", "GET", "Get galleries (public)", None),
        ("/api/public/artikel", "GET", "Get articles (public)", None),
        
        # Protected endpoints (auth required)
        ("/api/v1/users/me", "GET", "Get current user", headers),
        ("/api/v1/parks/", "GET", "Get parks (admin)", headers),
        ("/api/v1/fauna/", "GET", "Get fauna (admin)", headers),
        ("/api/v1/flora/", "GET", "Get flora (admin)", headers),
        ("/api/v1/galleries/", "GET", "Get galleries (admin)", headers),
        ("/api/v1/articles/", "GET", "Get articles (admin)", headers),
        ("/api/v1/regions/", "GET", "Get regions (admin)", headers),
        ("/api/v1/users/", "GET", "Get users (admin)", headers),
        ("/api/v1/announcements/", "GET", "Get announcements (admin)", headers),
        ("/api/v1/news/", "GET", "Get news (admin)", headers),
        ("/api/v1/system-settings", "GET", "Get system settings (admin)", headers),
        ("/api/v1/dashboard/", "GET", "Get dashboard (admin)", headers),
        ("/api/v1/analytics/", "GET", "Get analytics (admin)", headers),
    ]
    
    # Test each endpoint
    successful_endpoints = []
    failed_endpoints = []
    
    for endpoint, method, description, auth_headers in endpoints_to_test:
        try:
            if method == "GET":
                response = client.get(endpoint, headers=auth_headers)
            elif method == "POST":
                response = client.post(endpoint, headers=auth_headers)
            else:
                response = client.request(method, endpoint, headers=auth_headers)
            
            # Determine status
            if response.status_code == 200:
                status = "✅"
                successful_endpoints.append((endpoint, description))
                
                # Show response info for successful requests
                try:
                    data = response.json()
                    if isinstance(data, list):
                        print(f"{status} {description}: {response.status_code} - Found {len(data)} items")
                    elif isinstance(data, dict):
                        keys = list(data.keys())[:5]  # Show first 5 keys
                        print(f"{status} {description}: {response.status_code} - Keys: {keys}")
                    else:
                        print(f"{status} {description}: {response.status_code}")
                except:
                    print(f"{status} {description}: {response.status_code}")
                    
            elif response.status_code == 401:
                status = "🔒"
                print(f"{status} {description}: {response.status_code} - Authentication required")
            elif response.status_code == 403:
                status = "🚫"
                print(f"{status} {description}: {response.status_code} - Access forbidden")
            elif response.status_code == 404:
                status = "❓"
                print(f"{status} {description}: {response.status_code} - Not found")
            elif response.status_code == 405:
                status = "⚠️"
                print(f"{status} {description}: {response.status_code} - Method not allowed")
            else:
                status = "❌"
                failed_endpoints.append((endpoint, description, response.status_code))
                print(f"{status} {description}: {response.status_code}")
                
        except Exception as e:
            print(f"❌ {description}: Error - {e}")
            failed_endpoints.append((endpoint, description, str(e)))
    
    # Test CRUD operations
    print(f"\n🔧 Testing CRUD operations...")
    
    # Test creating a new article
    print("📝 Testing article creation...")
    try:
        article_data = {
            "title": "Test Article from Railway DB",
            "content": "This is a test article created via API",
            "summary": "Test summary",
            "status": "draft"
        }
        
        response = client.post("/api/v1/articles/", 
                             json=article_data, 
                             headers=headers)
        
        if response.status_code in [200, 201]:
            print("✅ Article creation successful")
            article_data = response.json()
            article_id = article_data.get("id")
            print(f"   Article ID: {article_id}")
            print(f"   Title: {article_data.get('title')}")
        else:
            print(f"⚠️ Article creation: {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
            
    except Exception as e:
        print(f"❌ Article creation error: {e}")
    
    # Test creating a new fauna
    print("\n🐾 Testing fauna creation...")
    try:
        fauna_data = {
            "common_name": "Test Fauna",
            "scientific_name": "Testus Faunus",
            "description": "Test fauna description",
            "status": "draft"
        }
        
        response = client.post("/api/v1/fauna/", 
                             json=fauna_data, 
                             headers=headers)
        
        if response.status_code in [200, 201]:
            print("✅ Fauna creation successful")
            fauna_data = response.json()
            fauna_id = fauna_data.get("id")
            print(f"   Fauna ID: {fauna_id}")
            print(f"   Name: {fauna_data.get('common_name')}")
        else:
            print(f"⚠️ Fauna creation: {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
            
    except Exception as e:
        print(f"❌ Fauna creation error: {e}")
    
    # Summary
    print(f"\n📊 Test Summary:")
    print(f"✅ Successful endpoints: {len(successful_endpoints)}")
    print(f"❌ Failed endpoints: {len(failed_endpoints)}")
    
    if successful_endpoints:
        print(f"\n✅ Working endpoints:")
        for endpoint, description in successful_endpoints:
            print(f"   - {description}: {endpoint}")
    
    if failed_endpoints:
        print(f"\n❌ Failed endpoints:")
        for endpoint, description, error in failed_endpoints:
            print(f"   - {description}: {endpoint} ({error})")
    
    print(f"\n🎉 Endpoint testing completed!")
    return len(successful_endpoints) > 0

if __name__ == "__main__":
    test_working_endpoints()
