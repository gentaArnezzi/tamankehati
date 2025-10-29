#!/usr/bin/env python3
"""
Migration script to add gambar_utama column to parks table
For Railway database
"""

import asyncio
import os
from pathlib import Path
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


def load_env():
    """Load .env file manually"""
    env_path = Path(__file__).parent.parent / '.env'
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()
        print(f"✅ Loaded environment from {env_path}")
    else:
        print(f"⚠️  .env file not found at {env_path}")


async def run_migration():
    """Run the migration to add gambar_utama column"""
    
    # Load .env file
    load_env()
    
    # Get database URL from environment (.env file or Railway)
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print("❌ DATABASE_URL not found in environment variables")
        print("💡 Please set DATABASE_URL in your .env file or environment")
        print("   Example: postgresql://user:pass@host:port/database")
        return
    
    # Convert to async if needed
    if database_url.startswith('postgresql://'):
        database_url = database_url.replace('postgresql://', 'postgresql+asyncpg://', 1)
    elif not database_url.startswith('postgresql+asyncpg://'):
        # Already has asyncpg, use as-is
        pass
    
    # Hide password in output
    safe_url = database_url.split('@')[-1] if '@' in database_url else database_url
    
    print("🔄 Starting migration: Add gambar_utama column to parks table")
    print(f"📊 Database: {safe_url}")
    
    engine = create_async_engine(database_url, echo=False)
    
    try:
        async with engine.begin() as conn:
            # Check if column already exists
            check_sql = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'parks' AND column_name = 'gambar_utama'
            """)
            result = await conn.execute(check_sql)
            exists = result.fetchone()
            
            if exists:
                print("✅ Column gambar_utama already exists. Skipping migration.")
                return
            
            # Add the column
            print("📝 Adding column gambar_utama...")
            migration_sql = text("""
                ALTER TABLE parks ADD COLUMN gambar_utama VARCHAR(500);
            """)
            
            await conn.execute(migration_sql)
            
            # Add comment
            print("📝 Adding column comment...")
            comment_sql = text("""
                COMMENT ON COLUMN parks.gambar_utama IS 'URL gambar utama taman';
            """)
            await conn.execute(comment_sql)
            
            print("✅ Migration completed successfully!")
            print("✅ Column 'gambar_utama' added to 'parks' table")
            
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        import traceback
        print("\nFull error:")
        print(traceback.format_exc())
        raise
    finally:
        await engine.dispose()


if __name__ == "__main__":
    print("=" * 60)
    print("🗃️  Database Migration: Add Park Image Support")
    print("🚂 Railway Database")
    print("=" * 60)
    print()
    
    try:
        asyncio.run(run_migration())
        print()
        print("=" * 60)
        print("✅ All migrations completed successfully!")
        print("=" * 60)
    except Exception as e:
        print()
        print("=" * 60)
        print(f"❌ Migration failed")
        print("=" * 60)
        import sys
        sys.exit(1)
