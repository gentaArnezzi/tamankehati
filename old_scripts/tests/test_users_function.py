import sys
import asyncio
sys.path.insert(0, 'apps/backend')

from sqlalchemy.ext.asyncio import AsyncSession
from core.database.session import get_session
from users.models import User, UserRole
from api.v1.routes.users import list_users

class MockUser:
    def __init__(self):
        self.id = 1
        self.email = "admin@kehati.org"
        self.role = UserRole.super_admin
        self.region_code = None
        self.display_name = "Super Admin"

async def test_users_function():
    print("Testing users function directly...")
    
    async for db in get_session():
        try:
            mock_user = MockUser()
            
            print("\nCalling list_users function...")
            result = await list_users(
                limit=10,
                offset=0,
                q=None,
                actor=mock_user,
                db=db
            )
            print(f"✅ Users result: {result}")
            
        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()
        finally:
            break

if __name__ == "__main__":
    asyncio.run(test_users_function())

