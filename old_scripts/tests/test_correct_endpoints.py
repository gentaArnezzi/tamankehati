#!/usr/bin/env python3
"""
Test correct endpoints with proper URLs
"""

import requests
import json

def test_correct_endpoints():
    """Test endpoints with correct URLs"""
    base_url = "http://localhost:8000"
    
    print("🚀 Testing correct endpoints...")
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
            
    except Exception as e:
        print(f"❌ Authentication error: {e}")
    
    # Test public endpoints with CORRECT URLs
    print("\n📡 Testing public endpoints with correct URLs...")
    public_endpoints = [
        ("/api/public/parks", "Get parks"),
        ("/api/public/fauna-simple/", "Get fauna (simple)"),
        ("/api/public/flora-simple/", "Get flora (simple)"),
        ("/api/public/galeri-simple/", "Get galleries (simple)"),
        ("/api/public/artikel-simple/", "Get articles (simple)"),
        ("/api/public/stats-simple/", "Get statistics (simple)"),
    ]
    
    for endpoint, description in public_endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    print(f"✅ {description}: {response.status_code} - Found {len(data)} items")
                    # Show first item as example
                    if len(data) > 0:
                        first_item = data[0]
                        if isinstance(first_item, dict):
                            keys = list(first_item.keys())[:3]
                            print(f"   Sample keys: {keys}")
                else:
                    print(f"✅ {description}: {response.status_code}")
            else:
                print(f"❌ {description}: {response.status_code}")
        except Exception as e:
            print(f"❌ {description}: Error - {e}")
    
    # Test protected endpoints with authentication
    print("\n🔒 Testing protected endpoints...")
    if 'token' in locals():
        protected_endpoints = [
            ("/api/v1/analytics/", "Get analytics"),
            ("/api/v1/dashboard/", "Get dashboard"),
            ("/api/v1/users/", "Get users"),
        ]
        
        headers = {"Authorization": f"Bearer {token}"}
        
        for endpoint, description in protected_endpoints:
            try:
                response = requests.get(f"{base_url}{endpoint}", headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        print(f"✅ {description}: {response.status_code} - Found {len(data)} items")
                    elif isinstance(data, dict):
                        keys = list(data.keys())[:3]
                        print(f"✅ {description}: {response.status_code} - Keys: {keys}")
                    else:
                        print(f"✅ {description}: {response.status_code}")
                else:
                    print(f"❌ {description}: {response.status_code}")
            except Exception as e:
                print(f"❌ {description}: Error - {e}")
    
    print("\n🎉 Correct endpoint testing completed!")

if __name__ == "__main__":
    test_correct_endpoints()
