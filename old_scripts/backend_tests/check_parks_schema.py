import asyncio
import sys
from sqlalchemy import inspect, text
from app.db.session import async_session, engine

async def check_parks_table():
    try:
        async with engine.connect() as conn:
            # Get all tables in the database
            result = await conn.execute(
                text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                """)
            )
            tables = [row[0] for row in result]
            print("\nTables in database:", ", ".join(tables))
            
            if 'parks' in tables:
                # Get columns in parks table
                result = await conn.execute(
                    text("""
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns
                    WHERE table_name = 'parks'
                    ORDER BY ordinal_position
                    """)
                )
                
                print("\nColumns in parks table:")
                for row in result:
                    print(f"- {row[0]} ({row[1]}){' NOT NULL' if row[2] == 'NO' else ''} "
                          f"DEFAULT {row[3] if row[3] else 'None'}")
                
                # Check if status column exists and its type
                result = await conn.execute(
                    text("""
                    SELECT column_name, udt_name, is_nullable, column_default
                    FROM information_schema.columns
                    WHERE table_name = 'parks' AND column_name = 'status'
                    """)
                )
                
                status_col = result.fetchone()
                if status_col:
                    print("\nStatus column details:")
                    print(f"- Name: {status_col[0]}")
                    print(f"- Type: {status_col[1]}")
                    print(f"- Nullable: {'Yes' if status_col[2] == 'YES' else 'No'}")
                    print(f"- Default: {status_col[3]}")
                else:
                    print("\nStatus column does not exist in parks table")
                
                # Check for enum types
                result = await conn.execute(
                    text("""
                    SELECT t.typname, e.enumlabel
                    FROM pg_type t
                    JOIN pg_enum e ON t.oid = e.enumtypid
                    WHERE t.typname = 'parkstatus'
                    ORDER BY e.enumsortorder
                    """)
                )
                
                enum_values = [row[1] for row in result]
                if enum_values:
                    print(f"\nparkstatus enum values: {', '.join(enum_values)}")
                else:
                    print("\nNo parkstatus enum type found")
            
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        raise

if __name__ == "__main__":
    asyncio.run(check_parks_table())
