import asyncio
import sys
import os
from sqlalchemy import select

# Add the parent directory to Python path to import modules properly
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from core.database.engine import engine, SessionLocal
from core.database.base import Base
from users.models import User
from domains.articles.models import UserRole

DEFAULT_ADMIN_EMAIL = os.getenv("SEED_ADMIN_EMAIL", "admin@kehati.org")
DEFAULT_ADMIN_PASSWORD = os.getenv("SEED_ADMIN_PASSWORD", "password")
DEFAULT_ADMIN_REGION = os.getenv("SEED_ADMIN_REGION", None)

async def seed():
    async with engine.begin() as conn:
        # Ensure schema exists (no-op if already created by Alembic)
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as session:
        # Check admin user
        admin = (await session.execute(select(User).where(User.email == DEFAULT_ADMIN_EMAIL))).scalars().first()
        if not admin:
            admin = User(
                email=DEFAULT_ADMIN_EMAIL,
                role=UserRole.super_admin,
                region_code=DEFAULT_ADMIN_REGION,
                is_active=True,
            )
            admin.set_password(DEFAULT_ADMIN_PASSWORD)
            session.add(admin)
            await session.commit()
            print(f"✅ Created admin user: {DEFAULT_ADMIN_EMAIL}")
        else:
            print(f"⏭️  Admin user already exists: {DEFAULT_ADMIN_EMAIL}")

        print(f"📧 Admin login: {DEFAULT_ADMIN_EMAIL}")
        print(f"🔑 Admin password: {DEFAULT_ADMIN_PASSWORD} (change this ASAP!)")

if __name__ == "__main__":
    asyncio.run(seed())