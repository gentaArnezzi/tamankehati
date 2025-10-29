"""
Script untuk membersihkan database Railway
Menghapus semua data kecuali 1 super_admin user

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


async def cleanup_database():
    """Cleanup database - hapus semua data kecuali 1 super_admin"""
    
    print("=" * 70)
    print("DATABASE CLEANUP SCRIPT")
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
            
            # 2. Delete notifications (tidak ada FK, aman dulu)
            print("\n📋 Step 2: Menghapus notifications...")
            await session.execute(text("DELETE FROM notifications"))
            count = await session.execute(text("SELECT COUNT(*) FROM notifications"))
            print(f"✅ Notifications dihapus. Sisa: {count.scalar()}")
            
            # 3. Delete audit_log (jika ada)
            print("\n📋 Step 3: Menghapus audit_log...")
            try:
                await session.execute(text("DELETE FROM audit_log WHERE TRUE"))
                print("✅ Audit log dihapus")
            except Exception as e:
                print(f"⚠️  Audit log tidak ada atau error: {str(e)[:50]}")
            
            # 4. Delete activities (FK ke parks dan users)
            print("\n📋 Step 4: Menghapus activities...")
            await session.execute(text("DELETE FROM activities"))
            count = await session.execute(text("SELECT COUNT(*) FROM activities"))
            print(f"✅ Activities dihapus. Sisa: {count.scalar()}")
            
            # 5. Delete galleries (FK ke users)
            print("\n📋 Step 5: Menghapus galleries...")
            await session.execute(text("DELETE FROM galleries"))
            count = await session.execute(text("SELECT COUNT(*) FROM galleries"))
            print(f"✅ Galleries dihapus. Sisa: {count.scalar()}")
            
            # 6. Delete articles (FK ke users dan parks)
            print("\n📋 Step 6: Menghapus articles...")
            await session.execute(text("DELETE FROM articles"))
            count = await session.execute(text("SELECT COUNT(*) FROM articles"))
            print(f"✅ Articles dihapus. Sisa: {count.scalar()}")
            
            # 7. Delete flora (FK ke parks)
            print("\n📋 Step 7: Menghapus flora...")
            await session.execute(text("DELETE FROM flora"))
            count = await session.execute(text("SELECT COUNT(*) FROM flora"))
            print(f"✅ Flora dihapus. Sisa: {count.scalar()}")
            
            # 8. Delete fauna (FK ke parks)
            print("\n📋 Step 8: Menghapus fauna...")
            await session.execute(text("DELETE FROM fauna"))
            count = await session.execute(text("SELECT COUNT(*) FROM fauna"))
            print(f"✅ Fauna dihapus. Sisa: {count.scalar()}")
            
            # 9. Delete announcements (jika ada)
            print("\n📋 Step 9: Menghapus announcements...")
            try:
                await session.execute(text("DELETE FROM announcements"))
                print("✅ Announcements dihapus")
            except Exception as e:
                print(f"⚠️  Announcements tidak ada atau error: {e}")
            
            # 10. Delete news (jika ada)
            print("\n📋 Step 10: Menghapus news...")
            try:
                await session.execute(text("DELETE FROM news"))
                print("✅ News dihapus")
            except Exception as e:
                print(f"⚠️  News tidak ada atau error: {e}")
            
            # 11. Delete users (kecuali super_admin)
            print(f"\n📋 Step 11: Menghapus users kecuali super_admin (ID: {super_admin_id})...")
            await session.execute(
                text(f"DELETE FROM users WHERE id != :admin_id"),
                {"admin_id": super_admin_id}
            )
            count = await session.execute(text("SELECT COUNT(*) FROM users"))
            print(f"✅ Users dihapus. Sisa: {count.scalar()} (super_admin)")
            
            # 12. Delete parks (akan auto-cascade ke FK relationships jika ada)
            print("\n📋 Step 12: Menghapus parks...")
            await session.execute(text("DELETE FROM parks"))
            count = await session.execute(text("SELECT COUNT(*) FROM parks"))
            print(f"✅ Parks dihapus. Sisa: {count.scalar()}")
            
            # 13. Reset sequences (auto-increment) - opsional
            print("\n📋 Step 13: Reset sequences...")
            tables = [
                'parks', 'users', 'flora', 'fauna', 'activities', 
                'articles', 'galleries', 'notifications'
            ]
            for table in tables:
                try:
                    await session.execute(
                        text(f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), COALESCE(MAX(id), 1)) FROM {table}")
                    )
                    print(f"   ✅ Sequence reset: {table}")
                except Exception as e:
                    print(f"   ⚠️  Sequence {table}: {e}")
            
            # Commit all changes
            await session.commit()
            
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
            print("\n🔄 Rollback dilakukan. Database tidak berubah.")
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
                result = await session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.scalar()
                status = "✅" if count == 0 or (table == 'users' and count == 1) else "⚠️"
                print(f"{status} {table:20s}: {count:6d} rows")
            except Exception as e:
                print(f"❌ {table:20s}: Error - {e}")


if __name__ == "__main__":
    print("\n🚀 Starting database cleanup...\n")
    asyncio.run(cleanup_database())
    asyncio.run(verify_cleanup())
    print("\n✅ Done!\n")

