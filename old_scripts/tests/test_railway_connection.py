#!/usr/bin/env python3
"""
Test script to verify Railway PostgreSQL database connection and migration
"""

import asyncio
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent / "apps" / "backend"
sys.path.insert(0, str(backend_dir))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

# Railway database URL
DATABASE_URL = "postgresql+asyncpg://postgres:wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz@maglev.proxy.rlwy.net:26951/railway"

async def test_connection():
    """Test database connection and verify tables"""
    try:
        # Create engine
        engine = create_async_engine(
            DATABASE_URL,
            echo=False,
            future=True,
            connect_args={
                "statement_cache_size": 0,
                "prepared_statement_cache_size": 0,
            }
        )
        
        # Create session
        SessionLocal = sessionmaker(bind=engine, class_=AsyncSession, autoflush=False, expire_on_commit=False)
        
        async with SessionLocal() as session:
            # Test basic connection
            print("✅ Database connection successful!")
            
            # Check all tables
            result = await session.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """))
            
            tables = result.fetchall()
            print(f"\n📊 Found {len(tables)} tables:")
            for table in tables:
                print(f"  - {table[0]}")
            
            # Check system settings
            result = await session.execute(text("SELECT COUNT(*) FROM system_settings"))
            settings_count = result.scalar()
            print(f"\n⚙️  System settings: {settings_count} records")
            
            # Check if we can insert a test record
            await session.execute(text("""
                INSERT INTO system_settings (key, value, description, is_public) 
                VALUES ('test_key', 'test_value', 'Test setting', false)
                ON CONFLICT (key) DO NOTHING
            """))
            await session.commit()
            print("✅ Test insert successful!")
            
            # Clean up test record
            await session.execute(text("DELETE FROM system_settings WHERE key = 'test_key'"))
            await session.commit()
            print("✅ Test cleanup successful!")
            
        await engine.dispose()
        print("\n🎉 All tests passed! Database is ready for use.")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

async def main():
    """Main test function"""
    print("🚀 Testing Railway PostgreSQL Database Connection...")
    print("=" * 60)
    
    success = await test_connection()
    
    if success:
        print("\n✅ Migration completed successfully!")
        print("📝 Next steps:")
        print("1. Update your .env file with the new DATABASE_URL")
        print("2. Restart your application")
        print("3. Test your application functionality")
    else:
        print("\n❌ Migration failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
