#!/usr/bin/env python3
"""
Migration script to replace Render URLs with relative paths in database.

This script updates existing records that have Render URLs stored in image fields
to use relative paths instead. The backend will then build correct URLs using
BASE_URL environment variable.

Usage:
    python scripts/migrate-render-urls.py

Environment variables required:
    DATABASE_URL - PostgreSQL connection string
"""

import os
import sys
from sqlalchemy import create_engine, text
from urllib.parse import urlparse

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def get_database_url():
    """Get database URL from environment"""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL environment variable not set")
        print("Set it with: export DATABASE_URL=postgresql://user:pass@host:port/db")
        sys.exit(1)
    
    # Convert asyncpg to sync if needed
    if "postgresql+asyncpg://" in database_url:
        database_url = database_url.replace("postgresql+asyncpg://", "postgresql://", 1)
    
    return database_url

def extract_path_from_url(url: str) -> str:
    """Extract path from full URL (e.g., /uploads/image.jpg)"""
    if not url or not url.startswith('http'):
        return url  # Already a path
    
    try:
        parsed = urlparse(url)
        return parsed.path
    except:
        return url

def replace_render_url(url: str, render_base: str) -> str:
    """Replace Render URL with relative path"""
    if not url:
        return url
    
    if render_base in url:
        # Extract path from URL
        path = extract_path_from_url(url)
        return path
    
    return url

def migrate_table(engine, table_name: str, field_name: str, render_base: str):
    """Migrate a single field in a table"""
    print(f"\n📋 Migrating {table_name}.{field_name}...")
    
    with engine.connect() as conn:
        # Count records with Render URLs
        count_stmt = text(f"""
            SELECT COUNT(*) 
            FROM {table_name} 
            WHERE {field_name} LIKE '%render.com%'
        """)
        count_result = conn.execute(count_stmt)
        count = count_result.scalar()
        
        if count == 0:
            print(f"   ✅ No records to migrate")
            return
        
        print(f"   Found {count} record(s) with Render URLs")
        
        # Get all records with Render URLs
        select_stmt = text(f"""
            SELECT id, {field_name}
            FROM {table_name}
            WHERE {field_name} LIKE '%render.com%'
        """)
        result = conn.execute(select_stmt)
        rows = result.fetchall()
        
        updated = 0
        for row in rows:
            record_id, old_url = row
            new_url = replace_render_url(old_url, render_base)
            
            if new_url != old_url:
                update_stmt = text(f"""
                    UPDATE {table_name}
                    SET {field_name} = :new_url
                    WHERE id = :record_id
                """)
                conn.execute(update_stmt, {
                    "new_url": new_url,
                    "record_id": record_id
                })
                updated += 1
                print(f"   ✅ Updated record {record_id}: {old_url[:60]}... → {new_url}")
        
        conn.commit()
        print(f"   ✅ Migrated {updated} record(s)")

def main():
    """Main migration function"""
    print("=" * 60)
    print("🔄 Render URL Migration Script")
    print("=" * 60)
    
    # Get database URL
    database_url = get_database_url()
    print(f"\n📦 Database: {database_url.split('@')[-1] if '@' in database_url else 'N/A'}")
    
    # Render base URLs to replace (common patterns)
    render_bases = [
        "https://tamankehati-backend-pxnu.onrender.com",
        "https://tamankehati-backend.onrender.com",
        "https://tamankehati-backend-zxb9.onrender.com",
        "https://tamankehati-21.onrender.com",
        "http://tamankehati-backend-pxnu.onrender.com",
        "http://tamankehati-backend.onrender.com",
    ]
    
    # Create engine
    try:
        engine = create_engine(database_url)
        print("✅ Database connection established")
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        sys.exit(1)
    
    # Migrate parks
    migrate_table(engine, "parks", "gambar_utama", render_bases[0])
    
    # Migrate flora
    for field in ["gambar_utama", "leaf_image_url", "stem_image_url", "flower_image_url", "fruit_image_url"]:
        migrate_table(engine, "flora", field, render_bases[0])
    
    # Migrate fauna
    migrate_table(engine, "fauna", "gambar_utama", render_bases[0])
    
    # Migrate galleries
    migrate_table(engine, "galleries", "image_url", render_bases[0])
    
    print("\n" + "=" * 60)
    print("✅ Migration completed!")
    print("=" * 60)
    print("\n📝 Next steps:")
    print("   1. Verify records in database")
    print("   2. Restart backend to apply changes")
    print("   3. Test image loading in frontend")

if __name__ == "__main__":
    main()

