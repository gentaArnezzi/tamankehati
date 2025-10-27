#!/usr/bin/env python3
"""
Seed sample announcements for testing
"""
import asyncio
import sys
import os
from datetime import datetime, timedelta, timezone

# Add backend directory to path
backend_dir = os.path.dirname(__file__)
sys.path.insert(0, backend_dir)

from sqlalchemy import select
from core.database.engine import SessionLocal
from domains.announcements.models import Announcement, AnnouncementStatus, AnnouncementType
from users.models import User

async def seed_announcements():
    """Seed sample announcements"""
    print("🌱 Seeding announcements...")
    
    async with SessionLocal() as db:
        # Check if announcements already exist
        result = await db.execute(select(Announcement))
        existing = result.scalars().first()
        
        if existing:
            print("⚠️  Announcements already exist, skipping seed")
            return
        
        # Get admin user
        result = await db.execute(
            select(User).where(User.email == "admin@kehati.org")
        )
        admin_user = result.scalars().first()
        
        if not admin_user:
            print("❌ Admin user not found, please seed users first")
            return
        
        # Create sample announcements
        announcements = [
            Announcement(
                title="Selamat Datang di Sistem Taman Kehati",
                content="""
                <h2>Selamat Datang!</h2>
                <p>Sistem Manajemen Taman Kehati telah diluncurkan. Sistem ini dirancang untuk membantu pengelolaan data keanekaragaman hayati Indonesia.</p>
                
                <h3>Fitur Utama:</h3>
                <ul>
                    <li>Manajemen data Flora dan Fauna</li>
                    <li>Sistem approval workflow</li>
                    <li>Dashboard analytics</li>
                    <li>Pengumuman dan berita</li>
                    <li>Galeri foto biodiversitas</li>
                </ul>
                
                <p>Untuk informasi lebih lanjut, silakan hubungi administrator.</p>
                """,
                summary="Sistem Manajemen Taman Kehati telah diluncurkan dengan berbagai fitur lengkap untuk pengelolaan biodiversitas",
                type=AnnouncementType.announcement,
                status=AnnouncementStatus.published,
                target_audience="regional_admin",
                priority=1,
                is_featured=True,
                is_pinned=True,
                author_id=admin_user.id,
                published_at=datetime.now(timezone.utc),
                tags="welcome,system,launch",
                view_count=0,
            ),
            Announcement(
                title="Panduan Penggunaan Sistem",
                content="""
                <h2>Panduan Penggunaan</h2>
                
                <h3>Untuk Regional Admin:</h3>
                <ol>
                    <li><strong>Login</strong>: Gunakan email dan password yang telah diberikan</li>
                    <li><strong>Dashboard</strong>: Lihat statistik region Anda</li>
                    <li><strong>Data Entry</strong>: Tambah data flora/fauna melalui menu yang tersedia</li>
                    <li><strong>Review</strong>: Submit data untuk review oleh Super Admin</li>
                    <li><strong>Approval</strong>: Cek status approval di menu Approvals</li>
                </ol>
                
                <h3>Tips:</h3>
                <ul>
                    <li>Pastikan data yang diinput lengkap dan akurat</li>
                    <li>Upload foto dengan kualitas baik</li>
                    <li>Gunakan nama ilmiah yang benar</li>
                </ul>
                """,
                summary="Panduan lengkap penggunaan sistem untuk Regional Admin dan pengguna lainnya",
                type=AnnouncementType.announcement,
                status=AnnouncementStatus.published,
                target_audience="regional_admin",
                priority=0,
                is_featured=True,
                is_pinned=False,
                author_id=admin_user.id,
                published_at=datetime.now(timezone.utc) - timedelta(days=1),
                tags="guide,tutorial,help",
                view_count=0,
            ),
            Announcement(
                title="Workshop Pelatihan Sistem - 15 November 2024",
                content="""
                <h2>Workshop Pelatihan Sistem Taman Kehati</h2>
                
                <p><strong>Tanggal:</strong> 15 November 2024<br>
                <strong>Waktu:</strong> 09:00 - 15:00 WIB<br>
                <strong>Tempat:</strong> Zoom Meeting (link akan dikirim via email)</p>
                
                <h3>Agenda:</h3>
                <ul>
                    <li>09:00 - 10:00: Pengenalan Sistem</li>
                    <li>10:00 - 11:30: Data Entry dan Upload</li>
                    <li>11:30 - 13:00: Istirahat</li>
                    <li>13:00 - 14:00: Workflow Approval</li>
                    <li>14:00 - 15:00: Q&A dan Troubleshooting</li>
                </ul>
                
                <p>Mohon konfirmasi kehadiran ke admin@kehati.org</p>
                """,
                summary="Workshop pelatihan sistem akan diadakan pada 15 November 2024, pukul 09:00-15:00 WIB via Zoom",
                type=AnnouncementType.event,
                status=AnnouncementStatus.published,
                target_audience="regional_admin",
                priority=1,
                is_featured=False,
                is_pinned=False,
                author_id=admin_user.id,
                published_at=datetime.now(timezone.utc) - timedelta(hours=2),
                expires_at=datetime.now(timezone.utc) + timedelta(days=30),
                tags="workshop,training,event",
                view_count=0,
            ),
            Announcement(
                title="Pemeliharaan Sistem - Minggu Depan",
                content="""
                <h2>Pemberitahuan Pemeliharaan Sistem</h2>
                
                <p><strong>⚠️ PERHATIAN</strong></p>
                
                <p>Sistem akan menjalani pemeliharaan rutin pada:</p>
                <ul>
                    <li><strong>Tanggal:</strong> Minggu, 10 November 2024</li>
                    <li><strong>Waktu:</strong> 02:00 - 06:00 WIB</li>
                    <li><strong>Durasi:</strong> Sekitar 4 jam</li>
                </ul>
                
                <p>Selama pemeliharaan, sistem <strong>tidak dapat diakses</strong>.</p>
                
                <h3>Yang Akan Dilakukan:</h3>
                <ul>
                    <li>Update keamanan sistem</li>
                    <li>Optimasi database</li>
                    <li>Backup data</li>
                    <li>Upgrade server</li>
                </ul>
                
                <p>Mohon maaf atas ketidaknyamanannya. Terima kasih atas pengertiannya.</p>
                """,
                summary="Pemeliharaan sistem terjadwal pada Minggu, 10 November 2024, pukul 02:00-06:00 WIB",
                type=AnnouncementType.maintenance,
                status=AnnouncementStatus.published,
                target_audience="regional_admin",
                priority=2,
                is_featured=True,
                is_pinned=True,
                author_id=admin_user.id,
                published_at=datetime.now(timezone.utc),
                expires_at=datetime.now(timezone.utc) + timedelta(days=7),
                tags="maintenance,downtime,system",
                view_count=0,
            ),
            Announcement(
                title="Update: Fitur AI Assistant Tersedia",
                content="""
                <h2>Fitur Baru: AI Assistant</h2>
                
                <p>Kami dengan senang hati mengumumkan peluncuran fitur <strong>AI Assistant</strong> untuk membantu identifikasi flora dan fauna!</p>
                
                <h3>Apa yang Bisa Dilakukan:</h3>
                <ul>
                    <li>Identifikasi spesies dari deskripsi</li>
                    <li>Saran klasifikasi taksonomi</li>
                    <li>Rekomendasi habitat dan karakteristik</li>
                    <li>Draft otomatis entry data</li>
                </ul>
                
                <h3>Cara Menggunakan:</h3>
                <ol>
                    <li>Buka menu Flora atau Fauna</li>
                    <li>Klik tombol "AI Assistant"</li>
                    <li>Masukkan deskripsi atau nama spesies</li>
                    <li>Review dan edit hasil AI</li>
                    <li>Submit untuk approval</li>
                </ol>
                
                <p><em>Catatan: Hasil AI tetap harus diverifikasi oleh ahli sebelum dipublikasi.</em></p>
                """,
                summary="Fitur AI Assistant telah tersedia untuk membantu identifikasi dan entry data flora fauna",
                type=AnnouncementType.news,
                status=AnnouncementStatus.published,
                target_audience="regional_admin",
                priority=1,
                is_featured=True,
                is_pinned=False,
                author_id=admin_user.id,
                published_at=datetime.now(timezone.utc) - timedelta(hours=12),
                tags="ai,feature,update",
                view_count=0,
            ),
        ]
        
        # Add all announcements
        for announcement in announcements:
            db.add(announcement)
        
        await db.commit()
        
        print(f"✅ Successfully seeded {len(announcements)} announcements")
        
        # Print summary
        print("\nSeeded announcements:")
        for i, ann in enumerate(announcements, 1):
            print(f"{i}. {ann.title} ({ann.type.value}, {ann.status.value})")

async def main():
    try:
        await seed_announcements()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())

