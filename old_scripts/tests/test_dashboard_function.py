import sys
import asyncio
sys.path.insert(0, 'apps/backend')

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from core.database.session import get_session
from users.models import User, UserRole
from api.v1.routes.dashboard_clean import get_dashboard
from fastapi import Request

class MockRequest:
    def __init__(self):
        self.cookies = {}

class MockUser:
    def __init__(self):
        self.id = 1
        self.email = "admin@kehati.org"
        self.role = UserRole.super_admin
        self.region_code = None
        self.display_name = "Super Admin"

async def test_dashboard_function():
    print("Testing dashboard function directly...")
    
    async for db in get_session():
        try:
            mock_request = MockRequest()
            mock_user = MockUser()
            
            print("\nCalling get_dashboard function...")
            result = await get_dashboard(mock_request, db, mock_user)
            print(f"✅ Dashboard result: {result}")
            
        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()
        finally:
            break

if __name__ == "__main__":
    asyncio.run(test_dashboard_function())

