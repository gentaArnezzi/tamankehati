import sys
import asyncio
import httpx

async def test_dashboard():
    print("Testing dashboard endpoint...")
    
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
            print(f"   ✅ Got token: {token[:20]}...")
            
            print("\n2. Testing dashboard endpoint...")
            dashboard_response = await client.get(
                "http://localhost:8000/api/v1/dashboard/",
                headers={"Authorization": f"Bearer {token}"}
            )
            print(f"   Dashboard status: {dashboard_response.status_code}")
            
            if dashboard_response.status_code == 200:
                print(f"   ✅ Dashboard data: {dashboard_response.json()}")
            else:
                print(f"   ❌ Dashboard error: {dashboard_response.text}")
        else:
            print(f"   ❌ Login failed: {login_response.text}")

if __name__ == "__main__":
    asyncio.run(test_dashboard())

