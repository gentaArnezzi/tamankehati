import sys
import asyncio
import httpx

async def test_all():
    print("Testing all endpoints...")
    
    # First login
    async with httpx.AsyncClient() as client:
        print("\n1. Logging in...")
        login_response = await client.post(
            "http://localhost:8000/api/v1/auth/login",
            json={"email": "admin@kehati.org", "password": "password"}
        )
        print(f"   Login status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            token = login_response.json()["access_token"]
            print(f"   ✅ Got token")
            
            # Test endpoints
            endpoints = [
                ("/health", "GET", None),
                ("/api/v1/users/me", "GET", token),
                ("/api/v1/dashboard/", "GET", token),
                ("/api/v1/users/", "GET", token),
                ("/api/v1/analytics/", "GET", token),
            ]
            
            for path, method, auth_token in endpoints:
                print(f"\nTesting {method} {path}...")
                headers = {"Authorization": f"Bearer {auth_token}"} if auth_token else {}
                
                if method == "GET":
                    response = await client.get(f"http://localhost:8000{path}", headers=headers)
                
                print(f"   Status: {response.status_code}")
                if response.status_code == 200:
                    print(f"   ✅ Success")
                else:
                    print(f"   ❌ Error: {response.text[:200]}")

if __name__ == "__main__":
    asyncio.run(test_all())

