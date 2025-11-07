#!/usr/bin/env python3
"""
Auto-create super admin user on first deployment
Run this before starting uvicorn

Script ini akan membuat user admin default jika belum ada.
Konfigurasi admin bisa diatur melalui environment variables:
- ADMIN_EMAIL: Email untuk admin (default: admin@kehati.org)
- ADMIN_PASSWORD: Password untuk admin (default: admin123)
"""
import asyncio
import os
import sys
from pathlib import Path

# Add current directory to path untuk import
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text
from core.database.engine import SessionLocal
from core.config.env import load_env

# Load environment variables
load_env()

async def init_admin():
    """Create super admin if not exists"""
    try:
        # Get database info for logging
        db_url = os.getenv("DATABASE_URL") or os.getenv("DATABASE_URL_SYNC") or "default"
        # Mask password in URL for security
        if "@" in db_url:
            parts = db_url.split("@")
            if len(parts) == 2:
                user_pass = parts[0].split("://")[-1] if "://" in parts[0] else parts[0]
                if ":" in user_pass:
                    user = user_pass.split(":")[0]
                    db_url_masked = db_url.replace(user_pass, f"{user}:***")
                else:
                    db_url_masked = db_url
            else:
                db_url_masked = db_url
        else:
            db_url_masked = db_url
        
        print("=" * 60)
        print("🔍 Database Connection Info:")
        print("=" * 60)
        print(f"Database URL: {db_url_masked}")
        print("=" * 60)
        print()
        
        async with SessionLocal() as db:
            # Get database name and connection info
            try:
                db_info = await db.execute(text("""
                    SELECT current_database() as db_name, 
                           current_user as db_user,
                           inet_server_addr() as server_host,
                           inet_server_port() as server_port
                """))
                db_details = db_info.first()
                if db_details:
                    print("=" * 60)
                    print("📊 Database Details:")
                    print("=" * 60)
                    print(f"Database Name: {db_details.db_name}")
                    print(f"Database User: {db_details.db_user}")
                    if db_details.server_host:
                        print(f"Server Host: {db_details.server_host}")
                    if db_details.server_port:
                        print(f"Server Port: {db_details.server_port}")
                    print("=" * 60)
                    print()
            except Exception as e:
                print(f"⚠️  Could not get database details: {e}")
                print()
            
            # Check if any super admin exists using raw SQL (avoid User model FK validation)
            check_admin = await db.execute(text("""
                SELECT id, email, role, is_active 
                FROM users 
                WHERE role = 'super_admin' 
                LIMIT 1
            """))
            existing_admin = check_admin.first()
            
            if existing_admin:
                print("=" * 60)
                print("✅ Super admin already exists")
                print("=" * 60)
                print(f"Email:    {existing_admin.email}")
                print(f"Role:     {existing_admin.role}")
                print(f"Active:   {existing_admin.is_active}")
                print("=" * 60)
                return
            
            # Create default super admin
            admin_email = os.getenv("ADMIN_EMAIL", "admin@kehati.org")
            admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
            
            # Validasi email
            if not admin_email or "@" not in admin_email:
                print("⚠️  WARNING: Invalid ADMIN_EMAIL, using default")
                admin_email = "admin@kehati.org"
            
            # Validasi password
            if not admin_password or len(admin_password) < 6:
                print("⚠️  WARNING: Password terlalu pendek, menggunakan default")
                admin_password = "admin123"
            
            # Check if email already exists using raw SQL
            email_check = await db.execute(text("""
                SELECT email, role 
                FROM users 
                WHERE email = :email 
                LIMIT 1
            """), {"email": admin_email})
            existing_user = email_check.first()
            
            if existing_user:
                print("=" * 60)
                print("⚠️  User dengan email tersebut sudah ada")
                print("=" * 60)
                print(f"Email:    {existing_user.email}")
                print(f"Role:     {existing_user.role}")
                print("=" * 60)
                return
            
            # Always use raw SQL to insert admin to avoid foreign key validation issues
            # SQLAlchemy validates foreign keys even when creating the object, not just on commit
            # Using raw SQL bypasses this validation completely
            print("📝 Creating admin user using raw SQL...")
            import bcrypt
            from datetime import datetime, timezone
            
            # Hash password
            password_bytes = admin_password.encode('utf-8')
            if len(password_bytes) > 72:
                password_bytes = password_bytes[:72]
            hashed_password = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')
            
            # Insert using raw SQL (bypasses SQLAlchemy foreign key validation)
            await db.execute(text("""
                INSERT INTO users (
                    email, hashed_password, role, display_name, full_name, 
                    is_active, park_id, created_at, updated_at
                ) VALUES (
                    :email, :hashed_password, :role, :display_name, :full_name,
                    :is_active, NULL, :created_at, :updated_at
                )
            """), {
                "email": admin_email,
                "hashed_password": hashed_password,
                "role": "super_admin",
                "display_name": "Super Administrator",
                "full_name": "System Administrator",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            })
            await db.commit()
            
            # Get the created admin using raw SQL (avoid User model FK validation)
            result = await db.execute(text("""
                SELECT id, email, role 
                FROM users 
                WHERE email = :email 
                LIMIT 1
            """), {"email": admin_email})
            admin = result.first()
            
            print("=" * 60)
            print("✅ Super Admin Created Successfully!")
            print("=" * 60)
            print(f"Email:    {admin_email}")
            print(f"Password: {admin_password}")
            print("Role:     super_admin")
            if admin:
                print(f"ID:       {admin.id}")
            print("=" * 60)
            print("⚠️  PENTING: Ganti password setelah login pertama kali!")
            print("=" * 60)
            
    except Exception as e:
        import traceback
        print("=" * 60)
        print("❌ Error creating admin:")
        print("=" * 60)
        print(f"Error: {str(e)}")
        print("=" * 60)
        print("Traceback:")
        traceback.print_exc()
        print("=" * 60)
        print("⚠️  Server akan tetap berjalan, tapi admin tidak dibuat.")
        print("   Anda bisa membuat admin manual melalui:")
        print("   - API: POST /api/v1/setup/create-admin")
        print("   - Script: python3 init_admin.py")
        print("=" * 60)

if __name__ == "__main__":
    asyncio.run(init_admin())

