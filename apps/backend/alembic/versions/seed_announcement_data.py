"""Seed Announcement Data

Revision ID: seed_announcement_data
Revises: enhanced_announcement_system
Create Date: 2024-10-25 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text

# revision identifiers
revision = 'seed_announcement_data'
down_revision = 'enhanced_announcement_system'
branch_labels = None
depends_on = None


def upgrade():
    """Seed initial announcement data"""
    
    # Insert sample announcements
    op.execute("""
        INSERT INTO announcements (
            title, content, summary, type, priority, status, target_audience,
            requires_acknowledgment, is_featured, is_pinned, author_id,
            featured_image, tags, created_at, updated_at
        ) VALUES 
        (
            'Selamat Datang di Sistem Pengumuman Enhanced',
            'Sistem pengumuman baru telah diluncurkan dengan fitur-fitur canggih untuk meningkatkan komunikasi antara Super Admin dan Regional Admin. Fitur-fitur baru termasuk tracking read, acknowledgment, comments, dan reactions.',
            'Pengumuman peluncuran sistem pengumuman enhanced dengan fitur tracking dan interaksi.',
            'announcement',
            'high',
            'published',
            'all_regional_admins',
            true,
            true,
            true,
            1,
            'https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Enhanced+Announcement+System',
            'sistem, pengumuman, enhanced, tracking, interaksi',
            NOW(),
            NOW()
        ),
        (
            'Panduan Penggunaan Sistem Pengumuman',
            'Berikut adalah panduan lengkap untuk menggunakan sistem pengumuman enhanced:\n\n1. **Membaca Pengumuman**: Klik pada judul pengumuman untuk membaca detail lengkap\n2. **Acknowledgment**: Jika pengumuman memerlukan acknowledgment, klik tombol "Acknowledge" setelah membaca\n3. **Comments**: Anda dapat memberikan komentar pada pengumuman yang sudah dibaca\n4. **Reactions**: Gunakan tombol reaction untuk memberikan feedback cepat\n5. **Tracking**: Sistem akan otomatis mencatat kapan Anda membaca pengumuman',
            'Panduan lengkap penggunaan sistem pengumuman enhanced untuk Regional Admin.',
            'announcement',
            'normal',
            'published',
            'all_regional_admins',
            false,
            false,
            false,
            1,
            'https://via.placeholder.com/800x400/10B981/FFFFFF?text=User+Guide',
            'panduan, tutorial, sistem, pengumuman',
            NOW(),
            NOW()
        ),
        (
            'Maintenance Jadwal Sistem',
            'Akan dilakukan maintenance sistem pada:\n\n**Tanggal**: 30 Oktober 2024\n**Waktu**: 02:00 - 04:00 WIB\n**Durasi**: 2 jam\n\nSelama maintenance, sistem akan tidak dapat diakses. Mohon untuk menyelesaikan semua pekerjaan sebelum jadwal maintenance.',
            'Pemberitahuan maintenance sistem pada 30 Oktober 2024.',
            'maintenance',
            'urgent',
            'published',
            'all_regional_admins',
            true,
            false,
            true,
            1,
            'https://via.placeholder.com/800x400/EF4444/FFFFFF?text=Maintenance+Notice',
            'maintenance, sistem, jadwal, downtime',
            NOW(),
            NOW()
        ),
        (
            'Event Pelatihan Regional Admin',
            'Kami akan mengadakan event pelatihan untuk Regional Admin dengan topik:\n\n**Topik**: "Optimalisasi Penggunaan Sistem Enhanced"\n**Tanggal**: 5 November 2024\n**Waktu**: 09:00 - 17:00 WIB\n**Lokasi**: Online via Zoom\n\nPendaftaran dibuka hingga 1 November 2024. Silakan konfirmasi kehadiran melalui sistem.',
            'Event pelatihan Regional Admin untuk optimalisasi sistem enhanced.',
            'event',
            'normal',
            'published',
            'all_regional_admins',
            false,
            false,
            false,
            1,
            'https://via.placeholder.com/800x400/8B5CF6/FFFFFF?text=Training+Event',
            'event, pelatihan, regional admin, sistem',
            NOW(),
            NOW()
        ),
        (
            'Update Kebijakan Sistem',
            'Berikut adalah update kebijakan sistem yang perlu diketahui:\n\n1. **Password Policy**: Password harus minimal 8 karakter dengan kombinasi huruf, angka, dan simbol\n2. **Session Timeout**: Session akan otomatis logout setelah 2 jam tidak aktif\n3. **Data Retention**: Data pengumuman akan disimpan selama 2 tahun\n4. **Backup Policy**: Backup otomatis dilakukan setiap hari pada pukul 02:00 WIB\n\nKebijakan ini berlaku efektif mulai 1 November 2024.',
            'Update kebijakan sistem yang berlaku mulai 1 November 2024.',
            'announcement',
            'high',
            'published',
            'all_regional_admins',
            true,
            false,
            false,
            1,
            'https://via.placeholder.com/800x400/F59E0B/FFFFFF?text=Policy+Update',
            'kebijakan, sistem, update, policy',
            NOW(),
            NOW()
        );
    """)
    
    # Insert sample read records (simulating some users have read the announcements)
    op.execute("""
        INSERT INTO announcement_reads (announcement_id, user_id, read_at, acknowledged)
        SELECT 
            a.id,
            u.id,
            NOW() - INTERVAL '1 day' * (RANDOM() * 3 + 1),
            CASE WHEN a.requires_acknowledgment THEN RANDOM() > 0.3 ELSE false END
        FROM announcements a
        CROSS JOIN users u
        WHERE a.status = 'published'
        AND u.role = 'regional_admin'
        AND RANDOM() > 0.4;  -- 60% chance of reading
    """)
    
    # Insert sample comments
    op.execute("""
        INSERT INTO announcement_comments (announcement_id, user_id, content, created_at)
        SELECT 
            a.id,
            u.id,
            CASE 
                WHEN a.title LIKE '%Selamat Datang%' THEN 'Terima kasih atas informasi yang sangat membantu!'
                WHEN a.title LIKE '%Panduan%' THEN 'Panduan yang sangat jelas dan mudah dipahami.'
                WHEN a.title LIKE '%Maintenance%' THEN 'Baik, akan menyelesaikan semua pekerjaan sebelum jadwal maintenance.'
                WHEN a.title LIKE '%Event%' THEN 'Sangat tertarik untuk mengikuti pelatihan ini.'
                WHEN a.title LIKE '%Kebijakan%' THEN 'Kebijakan yang sangat baik untuk keamanan sistem.'
                ELSE 'Komentar sample untuk pengumuman ini.'
            END,
            NOW() - INTERVAL '1 hour' * (RANDOM() * 24 + 1)
        FROM announcements a
        CROSS JOIN users u
        WHERE a.status = 'published'
        AND u.role = 'regional_admin'
        AND RANDOM() > 0.7;  -- 30% chance of commenting
    """)
    
    # Insert sample reactions
    op.execute("""
        INSERT INTO announcement_reactions (announcement_id, user_id, reaction_type, created_at)
        SELECT 
            a.id,
            u.id,
            CASE 
                WHEN RANDOM() > 0.8 THEN 'love'
                WHEN RANDOM() > 0.6 THEN 'like'
                WHEN RANDOM() > 0.4 THEN 'wow'
                WHEN RANDOM() > 0.2 THEN 'heart'
                ELSE 'like'
            END,
            NOW() - INTERVAL '30 minutes' * (RANDOM() * 48 + 1)
        FROM announcements a
        CROSS JOIN users u
        WHERE a.status = 'published'
        AND u.role = 'regional_admin'
        AND RANDOM() > 0.6;  -- 40% chance of reacting
    """)
    
    # Update view counts based on read records
    op.execute("""
        UPDATE announcements 
        SET view_count = (
            SELECT COUNT(*) 
            FROM announcement_reads 
            WHERE announcement_reads.announcement_id = announcements.id
        )
        WHERE status = 'published';
    """)


def downgrade():
    """Remove seeded data"""
    
    # Remove sample data
    op.execute("DELETE FROM announcement_reactions WHERE announcement_id IN (SELECT id FROM announcements WHERE title LIKE '%Selamat Datang%' OR title LIKE '%Panduan%' OR title LIKE '%Maintenance%' OR title LIKE '%Event%' OR title LIKE '%Kebijakan%');")
    op.execute("DELETE FROM announcement_comments WHERE announcement_id IN (SELECT id FROM announcements WHERE title LIKE '%Selamat Datang%' OR title LIKE '%Panduan%' OR title LIKE '%Maintenance%' OR title LIKE '%Event%' OR title LIKE '%Kebijakan%');")
    op.execute("DELETE FROM announcement_reads WHERE announcement_id IN (SELECT id FROM announcements WHERE title LIKE '%Selamat Datang%' OR title LIKE '%Panduan%' OR title LIKE '%Maintenance%' OR title LIKE '%Event%' OR title LIKE '%Kebijakan%');")
    op.execute("DELETE FROM announcements WHERE title LIKE '%Selamat Datang%' OR title LIKE '%Panduan%' OR title LIKE '%Maintenance%' OR title LIKE '%Event%' OR title LIKE '%Kebijakan%';")
