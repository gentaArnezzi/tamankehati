#!/usr/bin/env python3
"""
Test API endpoints for User-based Access Control
This script tests all API endpoints to ensure they work with user-based access control
"""

import asyncio
import httpx
import json
from typing import Dict, Any

# Test configuration
BASE_URL = "http://localhost:8000"
TEST_TOKENS = {
    "super_admin": "admin",
    "regional_admin": "user:2"
}

async def test_api_endpoint(method: str, endpoint: str, token: str = None, data: Dict[Any, Any] = None) -> Dict[str, Any]:
    """Test a single API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    headers = {}
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    async with httpx.AsyncClient() as client:
        try:
            if method.upper() == "GET":
                response = await client.get(url, headers=headers)
            elif method.upper() == "POST":
                response = await client.post(url, headers=headers, json=data)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return {
                "endpoint": endpoint,
                "method": method,
                "status_code": response.status_code,
                "success": response.status_code < 400,
                "response": response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text
            }
        except Exception as e:
            return {
                "endpoint": endpoint,
                "method": method,
                "status_code": 0,
                "success": False,
                "error": str(e)
            }

async def test_user_based_access_control_apis():
    """Test all API endpoints for user-based access control"""
    print("🧪 Testing API endpoints for User-based Access Control...")
    
    # Test endpoints
    test_cases = [
        # Parks API
        {"method": "GET", "endpoint": "/api/v1/parks/", "token": "admin", "description": "Super admin parks list"},
        {"method": "GET", "endpoint": "/api/v1/parks/", "token": "user:2", "description": "Regional admin parks list"},
        {"method": "GET", "endpoint": "/api/v1/parks/?submitted_by=me", "token": "user:2", "description": "Regional admin own parks"},
        
        # Flora API
        {"method": "GET", "endpoint": "/api/v1/flora/", "token": "admin", "description": "Super admin flora list"},
        {"method": "GET", "endpoint": "/api/v1/flora/", "token": "user:2", "description": "Regional admin flora list"},
        {"method": "GET", "endpoint": "/api/v1/flora/?submitted_by=me", "token": "user:2", "description": "Regional admin own flora"},
        
        # Fauna API
        {"method": "GET", "endpoint": "/api/v1/fauna/", "token": "admin", "description": "Super admin fauna list"},
        {"method": "GET", "endpoint": "/api/v1/fauna/", "token": "user:2", "description": "Regional admin fauna list"},
        {"method": "GET", "endpoint": "/api/v1/fauna/?submitted_by=me", "token": "user:2", "description": "Regional admin own fauna"},
        
        # Activities API
        {"method": "GET", "endpoint": "/api/v1/activities/", "token": "admin", "description": "Super admin activities list"},
        {"method": "GET", "endpoint": "/api/v1/activities/", "token": "user:2", "description": "Regional admin activities list"},
        {"method": "GET", "endpoint": "/api/v1/activities/?submitted_by=me", "token": "user:2", "description": "Regional admin own activities"},
        
        # Analytics API (updated for user-based)
        {"method": "GET", "endpoint": "/api/v1/analytics/users/1/endemic", "token": "admin", "description": "Super admin user analytics"},
        {"method": "GET", "endpoint": "/api/v1/analytics/users/2/endemic", "token": "user:2", "description": "Regional admin own analytics"},
        
        # Dashboard API
        {"method": "GET", "endpoint": "/api/v1/dashboard/", "token": "admin", "description": "Super admin dashboard"},
        {"method": "GET", "endpoint": "/api/v1/dashboard/", "token": "user:2", "description": "Regional admin dashboard"},
    ]
    
    results = []
    
    for test_case in test_cases:
        print(f"\n🔍 Testing: {test_case['description']}")
        result = await test_api_endpoint(
            method=test_case["method"],
            endpoint=test_case["endpoint"],
            token=test_case["token"],
            data=test_case.get("data")
        )
        
        results.append({
            **test_case,
            **result
        })
        
        if result["success"]:
            print(f"✅ PASS: {test_case['description']} - Status: {result['status_code']}")
        else:
            print(f"❌ FAIL: {test_case['description']} - Status: {result['status_code']}")
            if "error" in result:
                print(f"   Error: {result['error']}")
    
    # Summary
    print("\n📊 Test Summary:")
    passed = sum(1 for r in results if r["success"])
    total = len(results)
    
    print(f"✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")
    
    if passed == total:
        print("\n🎉 ALL API TESTS PASSED!")
        return True
    else:
        print("\n❌ SOME API TESTS FAILED!")
        return False

async def main():
    try:
        success = await test_user_based_access_control_apis()
        if success:
            print("\n✅ API testing completed successfully!")
        else:
            print("\n❌ API testing failed!")
    except Exception as e:
        print(f"❌ Test execution failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
