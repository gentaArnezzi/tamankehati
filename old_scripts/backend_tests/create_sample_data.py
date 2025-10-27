#!/usr/bin/env python3
"""
Script to create sample data for News and Announcements
"""

import asyncio
import sys
import os
from datetime import datetime, timezone, timedelta

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.database.session import get_session
from domains.news.models import News, NewsStatus, NewsCategory
from domains.announcements.models import Announcement, AnnouncementStatus, AnnouncementType
from users.models import User, UserRole
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

async def create_sample_data():
    """Create sample data for testing"""
    
    async for db in get_session():
        try:
            # Check if we have any users
            user_result = await db.execute(select(User).limit(1))
            user = user_result.scalars().first()
            
            if not user:
                print("❌ No users found. Please create a user first.")
                return
            
            print(f"✅ Using user: {user.email} (ID: {user.id})")
            
            # Create sample News
            sample_news = [
                {
                    "title": "Penemuan Spesies Baru di Taman Nasional Gunung Leuser",
                    "content": "Tim peneliti dari LIPI berhasil mengidentifikasi spesies baru katak pohon yang belum pernah ditemukan sebelumnya. Spesies ini memiliki karakteristik unik dengan pola warna yang mencolok dan suara khas yang berbeda dari spesies katak lainnya di kawasan tersebut.",
                    "summary": "Peneliti LIPI menemukan spesies katak pohon baru di Taman Nasional Gunung Leuser dengan karakteristik unik.",
                    "slug": "penemuan-spesies-baru-gunung-leuser",
                    "category": NewsCategory.biodiversity,
                    "status": NewsStatus.published,
                    "priority": 1,
                    "is_featured": True,
                    "is_pinned": False,
                    "featured_image": "https://example.com/images/katak-baru.jpg",
                    "tags": "biodiversity,penelitian,spesies-baru,gunung-leuser",
                    "reading_time": 5,
                    "author_id": user.id,
                    "published_at": datetime.now(timezone.utc),
                    "view_count": 0
                },
                {
                    "title": "Program Konservasi Harimau Sumatera Berhasil Tingkatkan Populasi",
                    "content": "Program konservasi harimau sumatera yang dimulai sejak 2015 menunjukkan hasil yang menggembirakan. Populasi harimau sumatera di Taman Nasional Kerinci Seblat meningkat 15% dalam 3 tahun terakhir. Program ini melibatkan masyarakat lokal dalam monitoring dan perlindungan habitat.",
                    "summary": "Program konservasi harimau sumatera berhasil meningkatkan populasi 15% di Taman Nasional Kerinci Seblat.",
                    "slug": "konservasi-harimau-sumatera-berhasil",
                    "category": NewsCategory.conservation,
                    "status": NewsStatus.published,
                    "priority": 2,
                    "is_featured": True,
                    "is_pinned": True,
                    "featured_image": "https://example.com/images/harimau-sumatera.jpg",
                    "tags": "konservasi,harimau-sumatera,populasi,kerinci-seblat",
                    "reading_time": 7,
                    "author_id": user.id,
                    "published_at": datetime.now(timezone.utc) - timedelta(days=2),
                    "view_count": 0
                },
                {
                    "title": "Workshop Identifikasi Flora Endemik untuk Ranger Taman Nasional",
                    "content": "Sebanyak 50 ranger dari berbagai taman nasional di Indonesia mengikuti workshop identifikasi flora endemik yang diselenggarakan oleh Kementerian Lingkungan Hidup dan Kehutanan. Workshop ini bertujuan meningkatkan kemampuan ranger dalam mengidentifikasi dan melindungi flora endemik yang terancam punah.",
                    "summary": "50 ranger taman nasional mengikuti workshop identifikasi flora endemik untuk meningkatkan kemampuan konservasi.",
                    "slug": "workshop-identifikasi-flora-endemik",
                    "category": NewsCategory.education,
                    "status": NewsStatus.draft,
                    "priority": 0,
                    "is_featured": False,
                    "is_pinned": False,
                    "featured_image": "https://example.com/images/workshop-flora.jpg",
                    "tags": "workshop,flora-endemik,ranger,pendidikan",
                    "reading_time": 4,
                    "author_id": user.id,
                    "view_count": 0
                }
            ]
            
            # Create sample Announcements
            sample_announcements = [
                {
                    "title": "Pemeliharaan Sistem Taman Kehati - 25 Oktober 2025",
                    "content": "Kami akan melakukan pemeliharaan rutin sistem Taman Kehati pada tanggal 25 Oktober 2025 pukul 02:00-06:00 WIB. Selama pemeliharaan, akses ke sistem akan terbatas. Kami memohon maaf atas ketidaknyamanan ini.",
                    "summary": "Pemeliharaan sistem akan dilakukan pada 25 Oktober 2025 pukul 02:00-06:00 WIB.",
                    "type": "maintenance",
                    "status": AnnouncementStatus.published,
                    "priority": 2,
                    "is_featured": True,
                    "is_pinned": True,
                    "featured_image": "https://example.com/images/maintenance.jpg",
                    "tags": "pemeliharaan,sistem,downtime",
                    "author_id": user.id,
                    "published_at": datetime.now(timezone.utc),
                    "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
                    "view_count": 0
                },
                {
                    "title": "Pembaruan Kebijakan Keamanan Data",
                    "content": "Mulai 1 November 2025, kami akan menerapkan kebijakan keamanan data yang lebih ketat untuk melindungi informasi pribadi pengguna. Semua pengguna diharapkan untuk memperbarui password mereka dan mengaktifkan autentikasi dua faktor.",
                    "summary": "Kebijakan keamanan data baru akan diterapkan mulai 1 November 2025.",
                    "type": "announcement",
                    "status": AnnouncementStatus.published,
                    "priority": 1,
                    "is_featured": False,
                    "is_pinned": False,
                    "featured_image": "https://example.com/images/security.jpg",
                    "tags": "keamanan,data,password,autentikasi",
                    "author_id": user.id,
                    "published_at": datetime.now(timezone.utc) - timedelta(days=1),
                    "expires_at": datetime.now(timezone.utc) + timedelta(days=30),
                    "view_count": 0
                },
                {
                    "title": "Acara Peluncuran Fitur Baru Taman Kehati",
                    "content": "Kami dengan bangga mengumumkan peluncuran fitur baru Taman Kehati yang akan memudahkan pengguna dalam menjelajahi keanekaragaman hayati Indonesia. Acara peluncuran akan diselenggarakan secara virtual pada tanggal 30 Oktober 2025 pukul 14:00 WIB.",
                    "summary": "Peluncuran fitur baru Taman Kehati akan dilakukan secara virtual pada 30 Oktober 2025.",
                    "type": "announcement",
                    "status": AnnouncementStatus.draft,
                    "priority": 0,
                    "is_featured": False,
                    "is_pinned": False,
                    "featured_image": "https://example.com/images/launch-event.jpg",
                    "tags": "peluncuran,fitur-baru,acara,virtual",
                    "author_id": user.id,
                    "view_count": 0
                }
            ]
            
            # Insert News
            print("📰 Creating sample News...")
            for news_data in sample_news:
                news = News(**news_data)
                db.add(news)
            await db.commit()
            print(f"✅ Created {len(sample_news)} sample news")
            
            # Insert Announcements
            print("📢 Creating sample Announcements...")
            for announcement_data in sample_announcements:
                announcement = Announcement(**announcement_data)
                db.add(announcement)
            await db.commit()
            print(f"✅ Created {len(sample_announcements)} sample announcements")
            
            print("\n🎉 Sample data created successfully!")
            print("\n📋 Summary:")
            print(f"   • News: {len(sample_news)} items")
            print(f"   • Announcements: {len(sample_announcements)} items")
            print(f"   • Published News: {len([n for n in sample_news if n['status'] == NewsStatus.published])}")
            print(f"   • Draft News: {len([n for n in sample_news if n['status'] == NewsStatus.draft])}")
            print(f"   • Published Announcements: {len([a for a in sample_announcements if a['status'] == AnnouncementStatus.published])}")
            print(f"   • Draft Announcements: {len([a for a in sample_announcements if a['status'] == AnnouncementStatus.draft])}")
            
        except Exception as e:
            print(f"❌ Error creating sample data: {e}")
            await db.rollback()
        finally:
            await db.close()
        break

if __name__ == "__main__":
    asyncio.run(create_sample_data())
