#!/usr/bin/env python3
"""
Debug database connection issues
"""

import asyncio
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent / "apps" / "backend"
sys.path.insert(0, str(backend_dir))

from core.database.engine import engine
from sqlalchemy import text

async def test_db_connection():
    """Test database connection and queries"""
    try:
        print("🔍 Testing database connection...")
        
        # Test basic connection
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1 as test"))
            test_value = result.scalar()
            print(f"✅ Database connection test: {test_value}")
            
            # Test regions table
            result = await conn.execute(text("SELECT COUNT(*) FROM regions"))
            regions_count = result.scalar()
            print(f"✅ Regions count: {regions_count}")
            
            # Test users table
            result = await conn.execute(text("SELECT COUNT(*) FROM users"))
            users_count = result.scalar()
            print(f"✅ Users count: {users_count}")
            
            # Test parks table
            result = await conn.execute(text("SELECT COUNT(*) FROM parks"))
            parks_count = result.scalar()
            print(f"✅ Parks count: {parks_count}")
            
            # Test fauna table
            result = await conn.execute(text("SELECT COUNT(*) FROM fauna"))
            fauna_count = result.scalar()
            print(f"✅ Fauna count: {fauna_count}")
            
            # Test flora table
            result = await conn.execute(text("SELECT COUNT(*) FROM flora"))
            flora_count = result.scalar()
            print(f"✅ Flora count: {flora_count}")
            
        print("🎉 Database connection successful!")
        return True
        
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Main function"""
    success = await test_db_connection()
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
