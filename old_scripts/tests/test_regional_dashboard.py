import sys
import asyncio
import httpx

async def test_regional_dashboard():
    print("🔍 Testing Regional Admin Dashboard specifically...")
    
    async with httpx.AsyncClient() as client:
        # Login as regional admin
        login_response = await client.post(
            "http://localhost:8000/api/v1/auth/login",
            json={"email": "kaltim.admin@kehati.org", "password": "password"}
        )
        
        if login_response.status_code == 200:
            token = login_response.json()["access_token"]
            print(f"✅ Regional Admin Login: SUCCESS")
            
            # Test dashboard
            dashboard_response = await client.get(
                "http://localhost:8000/api/v1/dashboard/",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            print(f"Dashboard Status: {dashboard_response.status_code}")
            if dashboard_response.status_code == 200:
                print(f"✅ Dashboard Data: {dashboard_response.json()}")
            else:
                print(f"❌ Dashboard Error: {dashboard_response.text}")
        else:
            print(f"❌ Login Failed: {login_response.status_code}")

if __name__ == "__main__":
    asyncio.run(test_regional_dashboard())
