import sys
import os
import bcrypt
from sqlalchemy import create_engine, text

# Add the parent directory to Python path to import modules properly
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from core.config.env import load_env

# Load environment variables
load_env()

# Use synchronous database URL for seeding
DB_URL = os.getenv("DATABASE_URL_SYNC", "postgresql://postgres.rtvztsbhgnqqbpwpxdek:tamankehati2025@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require")

DEFAULT_ADMIN_EMAIL = os.getenv("SEED_ADMIN_EMAIL", "admin@kehati.org")
DEFAULT_ADMIN_PASSWORD = os.getenv("SEED_ADMIN_PASSWORD", "password")

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')

def seed():
    print("🌱 Starting minimal database seeding...")

    # Create sync engine
    engine = create_engine(DB_URL)

    with engine.connect() as conn:
        # Start transaction
        trans = conn.begin()

        try:
            print("📋 Seeding users...")

            # Check if admin user exists
            result = conn.execute(text("SELECT id FROM users WHERE email = :email"), {"email": DEFAULT_ADMIN_EMAIL})
            admin_exists = result.fetchone()

            if not admin_exists:
                # Insert admin user
                password_hash = hash_password(DEFAULT_ADMIN_PASSWORD)
                conn.execute(text("""
                    INSERT INTO users (email, password_hash, role, is_active, created_at, updated_at)
                    VALUES (:email, :password_hash, :role, :is_active, NOW(), NOW())
                """), {
                    "email": DEFAULT_ADMIN_EMAIL,
                    "password_hash": password_hash,
                    "role": "super_admin",
                    "is_active": True
                })
                print(f"  ✅ Created admin user: {DEFAULT_ADMIN_EMAIL}")
            else:
                print(f"  ⏭️  Admin user already exists: {DEFAULT_ADMIN_EMAIL}")

            # Insert additional users
            users_data = [
                {"email": "kaltim.admin@kehati.org", "display_name": "Admin Kaltim", "role": "regional_admin", "region_code": "KALTIM"},
                {"email": "sumut.admin@kehati.org", "display_name": "Admin Sumut", "role": "regional_admin", "region_code": "SUMUT"},
            ]

            for user_data in users_data:
                result = conn.execute(text("SELECT id FROM users WHERE email = :email"), {"email": user_data["email"]})
                existing = result.fetchone()

                if not existing:
                    password_hash = hash_password("password")
                    conn.execute(text("""
                        INSERT INTO users (email, display_name, password_hash, role, region_code, is_active, created_at, updated_at)
                        VALUES (:email, :display_name, :password_hash, :role, :region_code, :is_active, NOW(), NOW())
                    """), {
                        "email": user_data["email"],
                        "display_name": user_data["display_name"],
                        "password_hash": password_hash,
                        "role": user_data["role"],
                        "region_code": user_data["region_code"],
                        "is_active": True
                    })
                    print(f"  ✅ Created user: {user_data['email']} ({user_data['role']})")
                else:
                    print(f"  ⏭️  User already exists: {user_data['email']}")

            # Commit transaction
            trans.commit()
            print("✅ Users seeded successfully")

            print("\n📋 User accounts created:")
            print(f"👑 Super Admin: {DEFAULT_ADMIN_EMAIL} / {DEFAULT_ADMIN_PASSWORD}")
            print(f"🏢 Admin KALTIM: kaltim.admin@kehati.org / password")
            print(f"🏢 Admin SUMUT: sumut.admin@kehati.org / password")
            print("\n⚠️  Please change the default passwords after first login!")

        except Exception as e:
            # Rollback on error
            trans.rollback()
            print(f"❌ Error during seeding: {e}")
            raise

if __name__ == "__main__":
    seed()