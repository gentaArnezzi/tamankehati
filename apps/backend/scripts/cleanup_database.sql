-- ============================================================================
-- DATABASE CLEANUP SCRIPT (SQL VERSION)
-- Menghapus semua data kecuali 1 super_admin
-- ============================================================================
-- PERINGATAN: Script ini akan menghapus SEMUA data!
-- Pastikan sudah backup database sebelum menjalankan!
-- ============================================================================

-- Mulai transaction untuk safety
BEGIN;

-- Step 1: Simpan ID super_admin yang akan dipertahankan
-- (Ganti 'admin@tamankehati.id' dengan email super_admin Anda)
DO $$
DECLARE
    admin_id INTEGER;
BEGIN
    -- Cari super_admin pertama
    SELECT id INTO admin_id 
    FROM users 
    WHERE role = 'super_admin' 
    LIMIT 1;
    
    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'Tidak ada super_admin ditemukan!';
    END IF;
    
    RAISE NOTICE 'Super admin ID: %', admin_id;
    
    -- Simpan ke temporary table
    CREATE TEMP TABLE IF NOT EXISTS temp_admin_id (id INTEGER);
    TRUNCATE temp_admin_id;
    INSERT INTO temp_admin_id VALUES (admin_id);
END $$;

-- Step 2: Hapus notifications (tidak ada FK constraint critical)
DELETE FROM notifications;
SELECT 'Notifications dihapus: ' || COUNT(*) || ' rows tersisa' FROM notifications;

-- Step 3: Hapus audit_log (jika ada)
DELETE FROM audit_log WHERE TRUE;
SELECT 'Audit log dihapus';

-- Step 4: Hapus activities (FK ke parks dan users)
DELETE FROM activities;
SELECT 'Activities dihapus: ' || COUNT(*) || ' rows tersisa' FROM activities;

-- Step 5: Hapus galleries (FK ke users)
DELETE FROM galleries;
SELECT 'Galleries dihapus: ' || COUNT(*) || ' rows tersisa' FROM galleries;

-- Step 6: Hapus articles (FK ke users dan parks)
DELETE FROM articles;
SELECT 'Articles dihapus: ' || COUNT(*) || ' rows tersisa' FROM articles;

-- Step 7: Hapus flora (FK ke parks)
DELETE FROM flora;
SELECT 'Flora dihapus: ' || COUNT(*) || ' rows tersisa' FROM flora;

-- Step 8: Hapus fauna (FK ke parks)
DELETE FROM fauna;
SELECT 'Fauna dihapus: ' || COUNT(*) || ' rows tersisa' FROM fauna;

-- Step 9: Hapus announcements (jika ada)
DO $$
BEGIN
    DELETE FROM announcements;
    RAISE NOTICE 'Announcements dihapus';
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'Table announcements tidak ada';
END $$;

-- Step 10: Hapus news (jika ada)
DO $$
BEGIN
    DELETE FROM news;
    RAISE NOTICE 'News dihapus';
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'Table news tidak ada';
END $$;

-- Step 11: Hapus parks (setelah semua FK dependencies dihapus)
DELETE FROM parks;
SELECT 'Parks dihapus: ' || COUNT(*) || ' rows tersisa' FROM parks;

-- Step 12: Hapus users kecuali super_admin
DELETE FROM users 
WHERE id NOT IN (SELECT id FROM temp_admin_id);
SELECT 'Users dihapus. Sisa: ' || COUNT(*) || ' user (super_admin)' FROM users;

-- Step 13: Reset sequences (auto-increment)
SELECT setval(pg_get_serial_sequence('parks', 'id'), COALESCE(MAX(id), 1)) FROM parks;
SELECT setval(pg_get_serial_sequence('flora', 'id'), COALESCE(MAX(id), 1)) FROM flora;
SELECT setval(pg_get_serial_sequence('fauna', 'id'), COALESCE(MAX(id), 1)) FROM fauna;
SELECT setval(pg_get_serial_sequence('activities', 'id'), COALESCE(MAX(id), 1)) FROM activities;
SELECT setval(pg_get_serial_sequence('articles', 'id'), COALESCE(MAX(id), 1)) FROM articles;
SELECT setval(pg_get_serial_sequence('galleries', 'id'), COALESCE(MAX(id), 1)) FROM galleries;
SELECT setval(pg_get_serial_sequence('notifications', 'id'), COALESCE(MAX(id), 1)) FROM notifications;

-- Cleanup temporary table
DROP TABLE IF EXISTS temp_admin_id;

-- PENTING: Uncomment baris di bawah untuk benar-benar menghapus data
-- COMMIT;

-- Jika masih testing, gunakan ROLLBACK untuk membatalkan
ROLLBACK;

-- ============================================================================
-- VERIFIKASI HASIL
-- ============================================================================
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'parks', COUNT(*) FROM parks
UNION ALL
SELECT 'flora', COUNT(*) FROM flora
UNION ALL
SELECT 'fauna', COUNT(*) FROM fauna
UNION ALL
SELECT 'activities', COUNT(*) FROM activities
UNION ALL
SELECT 'articles', COUNT(*) FROM articles
UNION ALL
SELECT 'galleries', COUNT(*) FROM galleries
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
ORDER BY table_name;

-- ============================================================================
-- CARA MENGGUNAKAN:
-- ============================================================================
-- 1. Backup database dulu!
-- 2. Review script ini
-- 3. Ganti ROLLBACK dengan COMMIT di atas (baris 90)
-- 4. Jalankan script ini
-- ============================================================================

