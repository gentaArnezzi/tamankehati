"""
Script untuk membersihkan database Railway v2
Menghapus semua data kecuali 1 super_admin user
Version 2: Check tables first before deleting

PERINGATAN: Script ini akan menghapus SEMUA data!
Pastikan sudah backup database sebelum menjalankan!
"""

import asyncio
import sys
import os

# Add parent directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from sqlalchemy import text, select
from core.database.engine import SessionLocal
from core.config.env import load_env
from users.models import User

load_env()


async def check_table_exists(session, table_name):
    """Check if table exists in database"""
    try:
        result = await session.execute(
            text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = :table_name
                )
            """),
            {"table_name": table_name}
        )
        return result.scalar()
    except Exception:
        return False


async def cleanup_database():
    """Cleanup database - hapus semua data kecuali 1 super_admin"""
    
    print("=" * 70)
    print("DATABASE CLEANUP SCRIPT V2")
    print("=" * 70)
    print("\n⚠️  WARNING: Script ini akan menghapus SEMUA data!")
    print("Hanya menyisakan 1 super_admin user\n")
    
    # Konfirmasi
    confirm = input("Ketik 'HAPUS SEMUA' untuk melanjutkan: ")
    if confirm != "HAPUS SEMUA":
        print("\n❌ Cleanup dibatalkan.")
        return
    
    print("\n🔄 Memulai cleanup database...\n")
    
    async with SessionLocal() as session:
        try:
            # 1. Cari super_admin yang akan dipertahankan
            print("📋 Step 1: Mencari super_admin...")
            result = await session.execute(
                select(User).where(User.role == "super_admin").limit(1)
            )
            super_admin = result.scalar_one_or_none()
            
            if not super_admin:
                print("❌ Tidak ada super_admin ditemukan!")
                print("   Aborting cleanup...")
                return
            
            super_admin_id = super_admin.id
            print(f"✅ Super admin ditemukan: {super_admin.email} (ID: {super_admin_id})")
            
            # 2. Check dan hapus notifications
            print("\n📋 Step 2: Menghapus notifications...")
            if await check_table_exists(session, 'notifications'):
                await session.execute(text("DELETE FROM notifications"))
                await session.commit()  # Commit each step
                count = await session.execute(text("SELECT COUNT(*) FROM notifications"))
                print(f"✅ Notifications dihapus. Sisa: {count.scalar()}")
            else:
                print("⚠️  Tabel notifications tidak ada")
            
            # 3. Check dan hapus audit_log
            print("\n📋 Step 3: Menghapus audit_log...")
            if await check_table_exists(session, 'audit_log'):
                await session.execute(text("DELETE FROM audit_log"))
                await session.commit()
                print("✅ Audit log dihapus")
            else:
                print("⚠️  Tabel audit_log tidak ada")
            
            # 4. Check dan hapus activities
            print("\n📋 Step 4: Menghapus activities...")
            if await check_table_exists(session, 'activities'):
                await session.execute(text("DELETE FROM activities"))
                await session.commit()
                count = await session.execute(text("SELECT COUNT(*) FROM activities"))
                print(f"✅ Activities dihapus. Sisa: {count.scalar()}")
            else:
                print("⚠️  Tabel activities tidak ada")
            
            # 5. Check dan hapus galleries
            print("\n📋 Step 5: Menghapus galleries...")
            if await check_table_exists(session, 'galleries'):
                await session.execute(text("DELETE FROM galleries"))
                await session.commit()
                count = await session.execute(text("SELECT COUNT(*) FROM galleries"))
                print(f"✅ Galleries dihapus. Sisa: {count.scalar()}")
            else:
                print("⚠️  Tabel galleries tidak ada")
            
            # 6. Check dan hapus articles
            print("\n📋 Step 6: Menghapus articles...")
            if await check_table_exists(session, 'articles'):
                await session.execute(text("DELETE FROM articles"))
                await session.commit()
                count = await session.execute(text("SELECT COUNT(*) FROM articles"))
                print(f"✅ Articles dihapus. Sisa: {count.scalar()}")
            else:
                print("⚠️  Tabel articles tidak ada")
            
            # 7. Check dan hapus flora
            print("\n📋 Step 7: Menghapus flora...")
            if await check_table_exists(session, 'flora'):
                await session.execute(text("DELETE FROM flora"))
                await session.commit()
                count = await session.execute(text("SELECT COUNT(*) FROM flora"))
                print(f"✅ Flora dihapus. Sisa: {count.scalar()}")
            else:
                print("⚠️  Tabel flora tidak ada")
            
            # 8. Check dan hapus fauna
            print("\n📋 Step 8: Menghapus fauna...")
            if await check_table_exists(session, 'fauna'):
                await session.execute(text("DELETE FROM fauna"))
                await session.commit()
                count = await session.execute(text("SELECT COUNT(*) FROM fauna"))
                print(f"✅ Fauna dihapus. Sisa: {count.scalar()}")
            else:
                print("⚠️  Tabel fauna tidak ada")
            
            # 9. Check dan hapus announcements
            print("\n📋 Step 9: Menghapus announcements...")
            if await check_table_exists(session, 'announcements'):
                await session.execute(text("DELETE FROM announcements"))
                await session.commit()
                print("✅ Announcements dihapus")
            else:
                print("⚠️  Tabel announcements tidak ada")
            
            # 10. Check dan hapus news
            print("\n📋 Step 10: Menghapus news...")
            if await check_table_exists(session, 'news'):
                await session.execute(text("DELETE FROM news"))
                await session.commit()
                print("✅ News dihapus")
            else:
                print("⚠️  Tabel news tidak ada")
            
            # 11. Set park_id users ke NULL dulu (untuk avoid FK constraint)
            print("\n📋 Step 11: Set park_id users ke NULL...")
            if await check_table_exists(session, 'users'):
                await session.execute(text("UPDATE users SET park_id = NULL WHERE park_id IS NOT NULL"))
                await session.commit()
                print("✅ park_id users di-set ke NULL")
            
            # 12. Hapus parks
            print("\n📋 Step 12: Menghapus parks...")
            if await check_table_exists(session, 'parks'):
                await session.execute(text("DELETE FROM parks"))
                await session.commit()
                count = await session.execute(text("SELECT COUNT(*) FROM parks"))
                print(f"✅ Parks dihapus. Sisa: {count.scalar()}")
            else:
                print("⚠️  Tabel parks tidak ada")
            
            # 13. Hapus users kecuali super_admin
            print(f"\n📋 Step 13: Menghapus users kecuali super_admin (ID: {super_admin_id})...")
            if await check_table_exists(session, 'users'):
                await session.execute(
                    text("DELETE FROM users WHERE id != :admin_id"),
                    {"admin_id": super_admin_id}
                )
                await session.commit()
                count = await session.execute(text("SELECT COUNT(*) FROM users"))
                print(f"✅ Users dihapus. Sisa: {count.scalar()} (super_admin)")
            else:
                print("⚠️  Tabel users tidak ada")
            
            print("\n" + "=" * 70)
            print("✅ DATABASE CLEANUP SELESAI!")
            print("=" * 70)
            print(f"\nData yang tersisa:")
            print(f"  - Super Admin: {super_admin.email}")
            print(f"  - Semua data lain telah dihapus")
            print("\n⚠️  Jangan lupa run `alembic stamp head` jika belum!\n")
            
        except Exception as e:
            await session.rollback()
            print(f"\n❌ ERROR: {e}")
            print("\n🔄 Rollback dilakukan. Database mungkin sebagian berubah.")
            raise


async def verify_cleanup():
    """Verifikasi hasil cleanup"""
    print("\n" + "=" * 70)
    print("VERIFIKASI HASIL CLEANUP")
    print("=" * 70 + "\n")
    
    async with SessionLocal() as session:
        tables = [
            'users', 'parks', 'flora', 'fauna', 'activities',
            'articles', 'galleries', 'notifications'
        ]
        
        for table in tables:
            try:
                exists = await check_table_exists(session, table)
                if exists:
                    result = await session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = result.scalar()
                    status = "✅" if count == 0 or (table == 'users' and count == 1) else "⚠️"
                    print(f"{status} {table:20s}: {count:6d} rows")
                else:
                    print(f"⚠️  {table:20s}: Table tidak ada")
            except Exception as e:
                print(f"❌ {table:20s}: Error - {str(e)[:30]}")


if __name__ == "__main__":
    print("\n🚀 Starting database cleanup v2...\n")
    asyncio.run(cleanup_database())
    asyncio.run(verify_cleanup())
    print("\n✅ Done!\n")

