import asyncio
import sys
import os
from sqlalchemy import select, text
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the parent directory to Python path to import modules properly
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from core.config.env import load_env
from core.database.base import Base
from users.models import User
from domains.articles.models import UserRole

# Load environment variables
load_env()

# Use synchronous database URL for seeding
DB_URL = os.getenv("DATABASE_URL_SYNC", "postgresql://postgres.rtvztsbhgnqqbpwpxdek:tamankehati2025@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require")

DEFAULT_ADMIN_EMAIL = os.getenv("SEED_ADMIN_EMAIL", "admin@kehati.org")
DEFAULT_ADMIN_PASSWORD = os.getenv("SEED_ADMIN_PASSWORD", "password")
DEFAULT_ADMIN_REGION = os.getenv("SEED_ADMIN_REGION", None)

def seed():
    print("🌱 Starting database seeding...")

    # Create sync engine
    engine = create_engine(DB_URL)
    SessionLocal = sessionmaker(bind=engine)

    # Create all tables
    Base.metadata.create_all(engine)
    print("✅ Tables created/verified")

    with SessionLocal() as session:
        print("📋 Seeding users...")

        # Check admin user
        admin = session.execute(select(User).where(User.email == DEFAULT_ADMIN_EMAIL)).scalar_one_or_none()
        if not admin:
            admin = User(
                email=DEFAULT_ADMIN_EMAIL,
                role=UserRole.super_admin,
                region_code=DEFAULT_ADMIN_REGION,
                is_active=True,
            )
            admin.set_password(DEFAULT_ADMIN_PASSWORD)
            session.add(admin)
            session.commit()
            print(f"  ✅ Created admin user: {DEFAULT_ADMIN_EMAIL}")
        else:
            print(f"  ⏭️  Admin user already exists: {DEFAULT_ADMIN_EMAIL}")

        # Create additional users
        users_data = [
            {"email": "kaltim.admin@kehati.org", "display_name": "Admin Kaltim", "role": UserRole.regional_admin, "region_code": "KALTIM", "password": "password"},
            {"email": "sumut.admin@kehati.org", "display_name": "Admin Sumut", "role": UserRole.regional_admin, "region_code": "SUMUT", "password": "password"},
        ]

        for user_data in users_data:
            existing = session.execute(select(User).where(User.email == user_data["email"])).scalar_one_or_none()
            if not existing:
                user = User(
                    email=user_data["email"],
                    display_name=user_data["display_name"],
                    role=user_data["role"],
                    region_code=user_data["region_code"],
                    is_active=True,
                )
                user.set_password(user_data["password"])
                session.add(user)
                print(f"  ✅ Created user: {user_data['email']} ({user_data['role'].value})")
            else:
                print(f"  ⏭️  User already exists: {user_data['email']}")

        session.commit()
        print("✅ Users seeded successfully")

        print("\n📋 User accounts created:")
        print(f"👑 Super Admin: {DEFAULT_ADMIN_EMAIL} / {DEFAULT_ADMIN_PASSWORD}")
        print(f"🏢 Admin KALTIM: kaltim.admin@kehati.org / password")
        print(f"🏢 Admin SUMUT: sumut.admin@kehati.org / password")
        print("\n⚠️  Please change the default passwords after first login!")

if __name__ == "__main__":
    seed()