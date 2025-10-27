#!/usr/bin/env python3
"""
Test simple endpoints that should work
"""

import requests
import json

def test_simple_endpoints():
    """Test simple endpoints without complex database operations"""
    base_url = "http://localhost:8000"
    
    print("🚀 Testing simple endpoints...")
    print("=" * 50)
    
    # Test basic endpoints
    endpoints = [
        ("/", "Root endpoint"),
        ("/health", "Health check"),
        ("/docs", "API documentation"),
    ]
    
    for endpoint, description in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}")
            status = "✅" if response.status_code == 200 else "❌"
            print(f"{status} {description}: {response.status_code}")
        except Exception as e:
            print(f"❌ {description}: Error - {e}")
    
    # Test authentication
    print("\n🔐 Testing authentication...")
    try:
        response = requests.post(f"{base_url}/api/v1/auth/login", json={
            "email": "admin@kehati.org",
            "password": "password"
        })
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            print(f"✅ Login successful")
            print(f"   Token: {token[:50]}...")
            
            # Test authenticated endpoint
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{base_url}/api/v1/users/me", headers=headers)
            if response.status_code == 200:
                user_data = response.json()
                print(f"✅ Get current user: {user_data.get('email')} ({user_data.get('role')})")
            else:
                print(f"❌ Get current user: {response.status_code}")
                
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Authentication error: {e}")
    
    # Test public endpoints that should work
    print("\n📡 Testing public endpoints...")
    public_endpoints = [
        ("/api/public/parks", "Get parks (public)"),
        ("/api/public/fauna", "Get fauna (public)"),
        ("/api/public/flora", "Get flora (public)"),
        ("/api/public/galeri", "Get galleries (public)"),
        ("/api/public/artikel", "Get articles (public)"),
    ]
    
    for endpoint, description in public_endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    print(f"✅ {description}: {response.status_code} - Found {len(data)} items")
                else:
                    print(f"✅ {description}: {response.status_code}")
            elif response.status_code == 405:
                print(f"⚠️ {description}: {response.status_code} - Method not allowed")
            else:
                print(f"❌ {description}: {response.status_code}")
        except Exception as e:
            print(f"❌ {description}: Error - {e}")
    
    print("\n🎉 Simple endpoint testing completed!")

if __name__ == "__main__":
    test_simple_endpoints()
