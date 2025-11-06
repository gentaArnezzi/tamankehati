#!/usr/bin/env python3
"""
Seed Super Admin User for Railway PostgreSQL
Run this script to create super admin user in Railway database
"""
import asyncio
import os
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "apps" / "backend"
sys.path.insert(0, str(backend_path))

# Change to backend directory to load .env
os.chdir(backend_path)

# Load environment variables
from core.config.env import load_env
load_env()

from sqlalchemy import select
from core.database.engine import SessionLocal
from users.models import User

async def seed_admin():
    """Create super admin if not exists"""
    try:
        async with SessionLocal() as db:
            # Check if any super admin exists
            result = await db.execute(
                select(User).where(User.role == "super_admin")
            )
            existing_admin = result.scalar_one_or_none()
            
            if existing_admin:
                print("=" * 60)
                print("⚠️  Super admin already exists!")
                print("=" * 60)
                print(f"Email:    {existing_admin.email}")
                print(f"Role:     {existing_admin.role}")
                print(f"Active:   {existing_admin.is_active}")
                print("=" * 60)
                
                response = input("\nDo you want to create another admin? (y/N): ")
                if response.lower() != 'y':
                    print("Exiting...")
                    return
            
            # Get admin credentials
            print("\n" + "=" * 60)
            print("🔐 Create Super Admin User")
            print("=" * 60)
            
            admin_email = os.getenv("ADMIN_EMAIL")
            admin_password = os.getenv("ADMIN_PASSWORD")
            
            if not admin_email:
                admin_email = input("Enter admin email (default: admin@kehati.org): ").strip()
                if not admin_email:
                    admin_email = "admin@kehati.org"
            
            if not admin_password:
                import getpass
                admin_password = getpass.getpass("Enter admin password (default: admin123): ").strip()
                if not admin_password:
                    admin_password = "admin123"
                    print("Using default password: admin123")
            
            # Create admin user
            admin = User(
                email=admin_email,
                role="super_admin",
                display_name="Super Administrator",
                full_name="System Administrator",
                is_active=True
            )
            admin.set_password(admin_password)
            
            db.add(admin)
            await db.commit()
            await db.refresh(admin)
            
            print("\n" + "=" * 60)
            print("✅ Super Admin Created Successfully!")
            print("=" * 60)
            print(f"ID:       {admin.id}")
            print(f"Email:    {admin.email}")
            print(f"Password: {admin_password}")
            print(f"Role:     {admin.role}")
            print("=" * 60)
            print("⚠️  PLEASE CHANGE PASSWORD AFTER FIRST LOGIN!")
            print("=" * 60)
            
    except Exception as e:
        print(f"\n❌ Error creating admin: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(seed_admin())

