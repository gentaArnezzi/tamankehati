import asyncio
import sys
import os

# Add the current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import bcrypt

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:password@localhost:5432/kehati5")

async def test_auth_components():
    """Test individual auth components to identify the issue"""

    print("Testing Auth Components...\n")

    # Test 1: Database Connection
    print("1. Testing Database Connection...")
    try:
        engine = create_async_engine(DATABASE_URL)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

        async with async_session() as session:
            result = await session.execute(text("SELECT 1"))
            row = result.fetchone()
            if row:
                print("✅ Database connection successful")
            else:
                print("❌ Database connection failed")
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return

    # Test 2: User Table Query
    print("\n2. Testing User Table Query...")
    try:
        async with async_session() as session:
            query = """
                SELECT id, email, password_hash, role, display_name, is_active
                FROM users
                WHERE LOWER(email) = LOWER(:email)
                LIMIT 1
            """
            result = await session.execute(text(query), {"email": "admin@kehati.org"})
            row = result.fetchone()

            if row:
                user_id, email, password_hash, role, display_name, is_active = row
                print(f"✅ User found: {email}")
                print(f"   - ID: {user_id}")
                print(f"   - Role: {role}")
                print(f"   - Active: {is_active}")
                print(f"   - Password hash exists: {bool(password_hash)}")

                # Test 3: Password Verification
                print("\n3. Testing Password Verification...")
                try:
                    test_password = "password"
                    is_valid = bcrypt.checkpw(test_password.encode('utf-8'), password_hash.encode('utf-8'))
                    print(f"✅ Password verification: {'Success' if is_valid else 'Failed'}")
                except Exception as e:
                    print(f"❌ Password verification error: {e}")

            else:
                print("❌ User not found")

                # Check if users table exists and has data
                count_result = await session.execute(text("SELECT COUNT(*) FROM users"))
                user_count = count_result.fetchone()[0]
                print(f"   - Total users in database: {user_count}")

                if user_count == 0:
                    print("   - Database might not be seeded with users")

    except Exception as e:
        print(f"❌ User query error: {e}")
        return

    # Test 4: JWT Token Creation
    print("\n4. Testing JWT Token Creation...")
    try:
        from core.auth.jwt import create_access_token
        from core.auth.config import ACCESS_TOKEN_EXPIRE_MINUTES

        token_data = {
            "sub": "1",
            "email": "admin@kehati.org",
            "role": "admin",
            "name": "Admin"
        }

        token = create_access_token(data=token_data)
        print(f"✅ JWT token creation successful")
        print(f"   - Token length: {len(token)}")

    except Exception as e:
        print(f"❌ JWT token creation error: {e}")

    await engine.dispose()
    print("\n🎉 Auth component testing completed!")

if __name__ == "__main__":
    asyncio.run(test_auth_components())