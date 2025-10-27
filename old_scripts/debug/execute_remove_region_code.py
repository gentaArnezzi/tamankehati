import sys
import asyncio
sys.path.insert(0, 'apps/backend')

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from core.database.session import get_session

async def remove_region_code():
    print("🗑️ Removing region_code columns from database...")
    
    async for db in get_session():
        try:
            # Remove region_code from notifications table
            print("Removing region_code from notifications table...")
            await db.execute(text("ALTER TABLE notifications DROP COLUMN IF EXISTS region_code"))
            
            # Remove region_code from users table
            print("Removing region_code from users table...")
            await db.execute(text("ALTER TABLE users DROP COLUMN IF EXISTS region_code"))
            
            # Commit changes
            await db.commit()
            print("✅ Successfully removed region_code columns")
            
            # Verify removal
            result = await db.execute(text("""
                SELECT table_name, column_name 
                FROM information_schema.columns 
                WHERE column_name = 'region_code'
            """))
            remaining = result.fetchall()
            
            if remaining:
                print(f"⚠️ Warning: {len(remaining)} region_code columns still exist:")
                for col in remaining:
                    print(f"  - {col.table_name}.{col.column_name}")
            else:
                print("✅ Confirmed: No region_code columns remaining")
                
        except Exception as e:
            print(f"❌ Error: {e}")
            await db.rollback()
        finally:
            break

if __name__ == "__main__":
    asyncio.run(remove_region_code())
