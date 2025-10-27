import sys
import asyncio
sys.path.insert(0, 'apps/backend')

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from core.database.session import get_session

async def test_dashboard():
    print("Testing dashboard queries...")
    
    async for db in get_session():
        try:
            # Test each query individually
            print("\n1. Testing parks count...")
            total_parks = (await db.execute(text("SELECT COUNT(*) FROM parks"))).scalar() or 0
            print(f"   ✅ Parks: {total_parks}")
            
            print("\n2. Testing regions count...")
            total_regions = (await db.execute(text("SELECT COUNT(*) FROM regions"))).scalar() or 0
            print(f"   ✅ Regions: {total_regions}")
            
            print("\n3. Testing users count...")
            total_users = (await db.execute(text("SELECT COUNT(*) FROM users"))).scalar() or 0
            print(f"   ✅ Users: {total_users}")
            
            print("\n4. Testing flora count...")
            total_flora = (await db.execute(text("SELECT COUNT(*) FROM flora"))).scalar() or 0
            print(f"   ✅ Flora: {total_flora}")
            
            print("\n5. Testing fauna count...")
            total_fauna = (await db.execute(text("SELECT COUNT(*) FROM fauna"))).scalar() or 0
            print(f"   ✅ Fauna: {total_fauna}")
            
            print("\n6. Testing articles count...")
            total_articles = (await db.execute(text("SELECT COUNT(*) FROM articles"))).scalar() or 0
            print(f"   ✅ Articles: {total_articles}")
            
            print("\n7. Testing galleries count...")
            total_galleries = (await db.execute(text("SELECT COUNT(*) FROM galleries"))).scalar() or 0
            print(f"   ✅ Galleries: {total_galleries}")
            
            print("\n✅ All queries successful!")
            
        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()
        finally:
            break

if __name__ == "__main__":
    asyncio.run(test_dashboard())

