-- =============================================================================
-- Update Regions with Complete Indonesia Provinces
-- Date: 2024-10-24
-- Purpose: Clean up test data and add complete list of Indonesian provinces
-- =============================================================================

-- Step 1: Backup existing regions
-- ================================

CREATE TABLE IF NOT EXISTS regions_backup_before_update AS 
SELECT * FROM regions;

SELECT 'Backup created' as status, COUNT(*) as regions_backed_up 
FROM regions_backup_before_update;


-- Step 2: Delete test/invalid regions
-- ====================================

DELETE FROM regions WHERE code IN ('TEST', 'TEST2', 'TESTPOST', 'GENTA', 'BDG');

SELECT 'Test regions deleted' as status;


-- Step 3: Update existing valid regions
-- ======================================

-- Update Kalimantan Timur
UPDATE regions 
SET name = 'Kalimantan Timur',
    code = 'KALTIM',
    timezone = 'Asia/Makassar',
    is_active = true
WHERE code = 'KALTIM';

-- Update Sumatera Utara
UPDATE regions 
SET name = 'Sumatera Utara',
    code = 'SUMUT',
    timezone = 'Asia/Jakarta',
    is_active = true
WHERE code = 'SUMUT';

-- Update Jawa Barat
UPDATE regions 
SET name = 'Jawa Barat',
    code = 'JABAR',
    timezone = 'Asia/Jakarta',
    is_active = true
WHERE code = 'JAWA BARAT';

-- Update DKI Jakarta
UPDATE regions 
SET name = 'DKI Jakarta',
    code = 'DKI',
    timezone = 'Asia/Jakarta',
    is_active = true
WHERE code = 'JKT';

SELECT 'Existing regions updated' as status;


-- Step 4: Insert missing provinces
-- =================================

-- Sumatera
INSERT INTO regions (code, name, timezone, is_active) VALUES
('ACEH', 'Aceh', 'Asia/Jakarta', true),
('SUMBAR', 'Sumatera Barat', 'Asia/Jakarta', true),
('SUMSEL', 'Sumatera Selatan', 'Asia/Jakarta', true),
('RIAU', 'Riau', 'Asia/Jakarta', true),
('KEPRI', 'Kepulauan Riau', 'Asia/Jakarta', true),
('JAMBI', 'Jambi', 'Asia/Jakarta', true),
('BENGKULU', 'Bengkulu', 'Asia/Jakarta', true),
('LAMPUNG', 'Lampung', 'Asia/Jakarta', true),
('BABEL', 'Bangka Belitung', 'Asia/Jakarta', true)
ON CONFLICT (code) DO NOTHING;

-- Jawa
INSERT INTO regions (code, name, timezone, is_active) VALUES
('BANTEN', 'Banten', 'Asia/Jakarta', true),
('JATENG', 'Jawa Tengah', 'Asia/Jakarta', true),
('JATIM', 'Jawa Timur', 'Asia/Jakarta', true),
('YOGYA', 'DI Yogyakarta', 'Asia/Jakarta', true)
ON CONFLICT (code) DO NOTHING;

-- Kalimantan
INSERT INTO regions (code, name, timezone, is_active) VALUES
('KALBAR', 'Kalimantan Barat', 'Asia/Pontianak', true),
('KALTENG', 'Kalimantan Tengah', 'Asia/Pontianak', true),
('KALSEL', 'Kalimantan Selatan', 'Asia/Makassar', true),
('KALTARA', 'Kalimantan Utara', 'Asia/Makassar', true)
ON CONFLICT (code) DO NOTHING;

-- Sulawesi
INSERT INTO regions (code, name, timezone, is_active) VALUES
('SULUT', 'Sulawesi Utara', 'Asia/Makassar', true),
('SULTENG', 'Sulawesi Tengah', 'Asia/Makassar', true),
('SULSEL', 'Sulawesi Selatan', 'Asia/Makassar', true),
('SULTRA', 'Sulawesi Tenggara', 'Asia/Makassar', true),
('GORONTALO', 'Gorontalo', 'Asia/Makassar', true),
('SULBAR', 'Sulawesi Barat', 'Asia/Makassar', true)
ON CONFLICT (code) DO NOTHING;

-- Bali & Nusa Tenggara
INSERT INTO regions (code, name, timezone, is_active) VALUES
('BALI', 'Bali', 'Asia/Makassar', true),
('NTB', 'Nusa Tenggara Barat', 'Asia/Makassar', true),
('NTT', 'Nusa Tenggara Timur', 'Asia/Makassar', true)
ON CONFLICT (code) DO NOTHING;

-- Maluku
INSERT INTO regions (code, name, timezone, is_active) VALUES
('MALUKU', 'Maluku', 'Asia/Jayapura', true),
('MALUT', 'Maluku Utara', 'Asia/Jayapura', true)
ON CONFLICT (code) DO NOTHING;

-- Papua
INSERT INTO regions (code, name, timezone, is_active) VALUES
('PAPUA', 'Papua', 'Asia/Jayapura', true),
('PAPBAR', 'Papua Barat', 'Asia/Jayapura', true),
('PAPTENG', 'Papua Tengah', 'Asia/Jayapura', true),
('PAPSEL', 'Papua Selatan', 'Asia/Jayapura', true),
('PAPPEG', 'Papua Pegunungan', 'Asia/Jayapura', true),
('PAPBARDAYA', 'Papua Barat Daya', 'Asia/Jayapura', true)
ON CONFLICT (code) DO NOTHING;

SELECT 'New provinces inserted' as status;


-- Step 5: Verification
-- ====================

-- Count by island group
SELECT 
    'Regions by Island Group' as info,
    CASE 
        WHEN code IN ('ACEH', 'SUMUT', 'SUMBAR', 'SUMSEL', 'RIAU', 'KEPRI', 'JAMBI', 'BENGKULU', 'LAMPUNG', 'BABEL') THEN 'Sumatera'
        WHEN code IN ('DKI', 'JABAR', 'BANTEN', 'JATENG', 'JATIM', 'YOGYA') THEN 'Jawa'
        WHEN code IN ('KALBAR', 'KALTENG', 'KALSEL', 'KALTIM', 'KALTARA') THEN 'Kalimantan'
        WHEN code IN ('SULUT', 'SULTENG', 'SULSEL', 'SULTRA', 'GORONTALO', 'SULBAR') THEN 'Sulawesi'
        WHEN code IN ('BALI', 'NTB', 'NTT') THEN 'Bali & Nusa Tenggara'
        WHEN code IN ('MALUKU', 'MALUT') THEN 'Maluku'
        WHEN code IN ('PAPUA', 'PAPBAR', 'PAPTENG', 'PAPSEL', 'PAPPEG', 'PAPBARDAYA') THEN 'Papua'
        ELSE 'Other'
    END as island_group,
    COUNT(*) as count
FROM regions
WHERE is_active = true
GROUP BY island_group
ORDER BY island_group;

-- List all regions
SELECT 
    'All Active Regions' as info,
    id, 
    code, 
    name, 
    timezone,
    is_active
FROM regions
WHERE is_active = true
ORDER BY 
    CASE 
        WHEN code IN ('ACEH', 'SUMUT', 'SUMBAR', 'SUMSEL', 'RIAU', 'KEPRI', 'JAMBI', 'BENGKULU', 'LAMPUNG', 'BABEL') THEN 1
        WHEN code IN ('DKI', 'JABAR', 'BANTEN', 'JATENG', 'JATIM', 'YOGYA') THEN 2
        WHEN code IN ('KALBAR', 'KALTENG', 'KALSEL', 'KALTIM', 'KALTARA') THEN 3
        WHEN code IN ('SULUT', 'SULTENG', 'SULSEL', 'SULTRA', 'GORONTALO', 'SULBAR') THEN 4
        WHEN code IN ('BALI', 'NTB', 'NTT') THEN 5
        WHEN code IN ('MALUKU', 'MALUT') THEN 6
        WHEN code IN ('PAPUA', 'PAPBAR', 'PAPTENG', 'PAPSEL', 'PAPPEG', 'PAPBARDAYA') THEN 7
        ELSE 8
    END,
    name;

-- Summary
SELECT 
    'UPDATE COMPLETE' as status,
    COUNT(*) as total_active_regions,
    COUNT(DISTINCT timezone) as unique_timezones
FROM regions
WHERE is_active = true;

