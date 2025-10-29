#!/usr/bin/env python3
"""
Migration script to add gambar_utama column to parks table
Run this script to add image upload support for parks
"""

import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


async def run_migration():
    """Run the migration to add gambar_utama column"""
    
    # Get database URL from environment
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        # Try to construct from individual parts
        db_user = os.getenv('POSTGRES_USER', 'postgres')
        db_pass = os.getenv('POSTGRES_PASSWORD', 'postgres')
        db_host = os.getenv('POSTGRES_HOST', 'localhost')
        db_port = os.getenv('POSTGRES_PORT', '5432')
        db_name = os.getenv('POSTGRES_DB', 'tamankehati_db')
        database_url = f"postgresql+asyncpg://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"
    
    # Convert to async if needed
    if database_url.startswith('postgresql://'):
        database_url = database_url.replace('postgresql://', 'postgresql+asyncpg://', 1)
    
    print("🔄 Starting migration: Add gambar_utama column to parks table")
    print(f"📊 Database: {database_url.split('@')[-1]}")
    
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
            migration_sql = text("""
                ALTER TABLE parks ADD COLUMN gambar_utama VARCHAR(500);
            """)
            
            await conn.execute(migration_sql)
            
            # Add comment
            comment_sql = text("""
                COMMENT ON COLUMN parks.gambar_utama IS 'URL gambar utama taman';
            """)
            await conn.execute(comment_sql)
            
            print("✅ Migration completed successfully!")
            print("✅ Column 'gambar_utama' added to 'parks' table")
            
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        raise
    finally:
        await engine.dispose()


if __name__ == "__main__":
    print("=" * 60)
    print("🗃️  Database Migration: Add Park Image Support")
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
        print(f"❌ Migration failed: {str(e)}")
        print("=" * 60)
        import sys
        sys.exit(1)
