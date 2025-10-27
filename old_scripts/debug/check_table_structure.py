import sys
import asyncio
sys.path.insert(0, 'apps/backend')

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from core.database.session import get_session

async def check_tables():
    print("🔍 Checking table structures...")
    
    async for db in get_session():
        try:
            # Check articles table structure
            print("\n📋 Articles table structure:")
            result = await db.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'articles' ORDER BY ordinal_position"))
            articles_columns = result.fetchall()
            for col in articles_columns:
                print(f"  - {col.column_name}: {col.data_type}")
            
            # Check galleries table structure
            print("\n📋 Galleries table structure:")
            result = await db.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'galleries' ORDER BY ordinal_position"))
            galleries_columns = result.fetchall()
            for col in galleries_columns:
                print(f"  - {col.column_name}: {col.data_type}")
            
            # Check users table structure
            print("\n📋 Users table structure:")
            result = await db.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position"))
            users_columns = result.fetchall()
            for col in users_columns:
                print(f"  - {col.column_name}: {col.data_type}")
            
            # Check parks table structure
            print("\n📋 Parks table structure:")
            result = await db.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'parks' ORDER BY ordinal_position"))
            parks_columns = result.fetchall()
            for col in parks_columns:
                print(f"  - {col.column_name}: {col.data_type}")
            
        except Exception as e:
            print(f"❌ Error: {e}")
        finally:
            break

if __name__ == "__main__":
    asyncio.run(check_tables())
