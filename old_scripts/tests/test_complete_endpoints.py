import sys
import asyncio
import httpx

async def test_complete_endpoints():
    print("🔧 Testing ALL endpoints with Super Admin and Regional Admin")
    print("=" * 60)
    
    async with httpx.AsyncClient() as client:
        # Test credentials
        super_admin = {"email": "admin@kehati.org", "password": "password"}
        regional_admin = {"email": "kaltim.admin@kehati.org", "password": "password"}
        
        # Test endpoints
        endpoints = [
            # Public endpoints
            ("/health", "GET", None, "Health Check"),
            ("/api/public/parks", "GET", None, "Public Parks"),
            ("/api/public/fauna-simple/", "GET", None, "Public Fauna"),
            ("/api/public/flora-simple/", "GET", None, "Public Flora"),
            ("/api/public/galeri-simple/", "GET", None, "Public Galleries"),
            ("/api/public/artikel-simple/", "GET", None, "Public Articles"),
            ("/api/public/stats-simple/", "GET", None, "Public Stats"),
            
            # Auth endpoints
            ("/api/v1/auth/login", "POST", None, "Login"),
            
            # Admin endpoints (will test with both roles)
            ("/api/v1/users/me", "GET", "AUTH", "Current User"),
            ("/api/v1/dashboard/", "GET", "AUTH", "Dashboard"),
            ("/api/v1/users/", "GET", "AUTH", "Users List"),
            ("/api/v1/analytics/", "GET", "AUTH", "Analytics"),
        ]
        
        # Test with Super Admin
        print("\n🔑 Testing with SUPER ADMIN")
        print("-" * 40)
        
        # Login as super admin
        login_response = await client.post(
            "http://localhost:8000/api/v1/auth/login",
            json=super_admin
        )
        
        if login_response.status_code == 200:
            super_token = login_response.json()["access_token"]
            print(f"✅ Super Admin Login: SUCCESS")
            
            # Test all endpoints with super admin
            for path, method, auth_type, description in endpoints:
                if auth_type == "AUTH":
                    headers = {"Authorization": f"Bearer {super_token}"}
                else:
                    headers = {}
                
                if method == "GET":
                    response = await client.get(f"http://localhost:8000{path}", headers=headers)
                elif method == "POST":
                    response = await client.post(f"http://localhost:8000{path}", headers=headers, json=super_admin)
                
                status_icon = "✅" if response.status_code == 200 else "❌"
                print(f"{status_icon} {description}: {response.status_code}")
                
                if response.status_code != 200 and auth_type == "AUTH":
                    print(f"   Error: {response.text[:100]}")
        else:
            print(f"❌ Super Admin Login Failed: {login_response.status_code}")
        
        # Test with Regional Admin
        print("\n🔑 Testing with REGIONAL ADMIN")
        print("-" * 40)
        
        # Login as regional admin
        login_response = await client.post(
            "http://localhost:8000/api/v1/auth/login",
            json=regional_admin
        )
        
        if login_response.status_code == 200:
            regional_token = login_response.json()["access_token"]
            print(f"✅ Regional Admin Login: SUCCESS")
            
            # Test all endpoints with regional admin
            for path, method, auth_type, description in endpoints:
                if auth_type == "AUTH":
                    headers = {"Authorization": f"Bearer {regional_token}"}
                else:
                    headers = {}
                
                if method == "GET":
                    response = await client.get(f"http://localhost:8000{path}", headers=headers)
                elif method == "POST":
                    response = await client.post(f"http://localhost:8000{path}", headers=headers, json=regional_admin)
                
                status_icon = "✅" if response.status_code == 200 else "❌"
                print(f"{status_icon} {description}: {response.status_code}")
                
                if response.status_code != 200 and auth_type == "AUTH":
                    print(f"   Error: {response.text[:100]}")
        else:
            print(f"❌ Regional Admin Login Failed: {login_response.status_code}")
        
        print("\n" + "=" * 60)
        print("🎯 Test Summary:")
        print("- Public endpoints should work for everyone")
        print("- Auth endpoints should work for both admin types")
        print("- Dashboard should show different data based on role")
        print("- Users endpoint should work for both admin types")

if __name__ == "__main__":
    asyncio.run(test_complete_endpoints())
