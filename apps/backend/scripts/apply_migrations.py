#!/usr/bin/env python3
"""
Migration script for Taman Kehati database
Applies database migrations to ensure schema consistency
"""

import os
import sys
import subprocess
from pathlib import Path

def run_sql_file(db_name: str, sql_file: str):
    """Run SQL file against database"""
    try:
        cmd = f"psql {db_name} -f {sql_file}"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ Successfully applied {sql_file}")
            return True
        else:
            print(f"❌ Error applying {sql_file}: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Exception running {sql_file}: {e}")
        return False

def main():
    """Apply all pending migrations"""
    print("🚀 Starting database migrations...")
    
    # Get database name from environment or use default
    db_name = os.getenv('DATABASE_NAME', 'kehati5')
    
    # Get migrations directory
    migrations_dir = Path(__file__).parent.parent / 'migrations'
    
    # List of migrations to apply (in order)
    migrations = [
        'add_location_fields_to_parks.sql'
    ]
    
    success_count = 0
    total_count = len(migrations)
    
    for migration in migrations:
        sql_file = migrations_dir / migration
        if sql_file.exists():
            print(f"📝 Applying migration: {migration}")
            if run_sql_file(db_name, str(sql_file)):
                success_count += 1
        else:
            print(f"⚠️  Migration file not found: {sql_file}")
    
    print(f"\n📊 Migration Summary:")
    print(f"   Successfully applied: {success_count}/{total_count}")
    
    if success_count == total_count:
        print("🎉 All migrations completed successfully!")
        return 0
    else:
        print("❌ Some migrations failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())
