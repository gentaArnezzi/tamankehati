#!/usr/bin/env python3
"""
Run migration to extend rejection_reason column to TEXT
"""
import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

database_url = os.getenv("DATABASE_URL")

if not database_url:
    print("❌ DATABASE_URL not found in .env file")
    exit(1)

# Convert asyncpg URL to psycopg2 format
if database_url.startswith("postgresql+asyncpg://"):
    database_url = database_url.replace("postgresql+asyncpg://", "postgresql://")

print(f"📡 Connecting to database...")

try:
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()

    print("📝 Extending rejection_reason column to TEXT...")
    cur.execute("ALTER TABLE parks ALTER COLUMN rejection_reason TYPE TEXT;")
    
    print("📝 Adding column comment...")
    cur.execute("COMMENT ON COLUMN parks.rejection_reason IS 'Rejection reason or backup data for approved park edits';")
    
    conn.commit()
    cur.close()
    conn.close()
    
    print("✅ Migration completed successfully!")
    print("✅ Column 'rejection_reason' extended to TEXT type")
    print("✅ Now can store backup data for approved park edits")

except Exception as e:
    print(f"❌ Migration failed: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

