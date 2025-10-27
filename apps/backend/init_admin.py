#!/usr/bin/env python3
"""
Auto-create super admin user on first deployment
Run this before starting uvicorn
"""
import asyncio
import os
from sqlalchemy import select
from core.database.engine import SessionLocal
from users.models import User

async def init_admin():
    """Create super admin if not exists"""
    try:
        async with SessionLocal() as db:
            # Check if any super admin exists
            result = await db.execute(
                select(User).where(User.role == "super_admin")
            )
            existing_admin = result.scalar_one_or_none()
            
            if existing_admin:
                print("✅ Super admin already exists")
                return
            
            # Create default super admin
            admin_email = os.getenv("ADMIN_EMAIL", "admin@kehati.org")
            admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
            
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
            
            print("=" * 60)
            print("✅ Super Admin Created Successfully!")
            print("=" * 60)
            print(f"Email:    {admin_email}")
            print(f"Password: {admin_password}")
            print("=" * 60)
            print("⚠️  PLEASE CHANGE PASSWORD AFTER FIRST LOGIN!")
            print("=" * 60)
            
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        # Don't fail - continue to start server
        pass

if __name__ == "__main__":
    asyncio.run(init_admin())

