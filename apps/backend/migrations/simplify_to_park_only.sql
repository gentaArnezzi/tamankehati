-- =============================================================================
-- Simplify Structure: Remove Zones, Flora/Fauna directly to Parks
-- Date: 2024-10-24
-- Purpose: Simplify database by removing park_zones and connecting flora/fauna directly to parks
-- =============================================================================

-- Step 1: Backup park_zones data
-- ================================

CREATE TABLE IF NOT EXISTS park_zones_backup_20251024 AS 
SELECT * FROM park_zones;

SELECT 
    'Backup created' as status,
    COUNT(*) as zones_backed_up 
FROM park_zones_backup_20251024;


-- Step 2: Add park_id to flora (if not exists)
-- =============================================

-- Check if park_id already exists in flora
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'flora' AND column_name = 'park_id'
    ) THEN
        ALTER TABLE flora ADD COLUMN park_id INTEGER;
        
        -- Add foreign key
        ALTER TABLE flora ADD CONSTRAINT flora_park_id_fkey 
        FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added park_id to flora table';
    ELSE
        RAISE NOTICE 'park_id already exists in flora table';
    END IF;
END $$;


-- Step 3: Add park_id to fauna (if not exists)
-- =============================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fauna' AND column_name = 'park_id'
    ) THEN
        ALTER TABLE fauna ADD COLUMN park_id INTEGER;
        
        -- Add foreign key
        ALTER TABLE fauna ADD CONSTRAINT fauna_park_id_fkey 
        FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added park_id to fauna table';
    ELSE
        RAISE NOTICE 'park_id already exists in fauna table';
    END IF;
END $$;


-- Step 4: Migrate data from zone_id to park_id
-- =============================================

-- Update flora: set park_id from zone.park_id
UPDATE flora f
SET park_id = z.park_id
FROM park_zones z
WHERE f.zone_id = z.id
  AND f.park_id IS NULL;

SELECT 
    'Flora migrated' as status,
    COUNT(*) as rows_updated
FROM flora
WHERE park_id IS NOT NULL;

-- Update fauna: set park_id from zone.park_id
UPDATE fauna f
SET park_id = z.park_id
FROM park_zones z
WHERE f.zone_id = z.id
  AND f.park_id IS NULL;

SELECT 
    'Fauna migrated' as status,
    COUNT(*) as rows_updated
FROM fauna
WHERE park_id IS NOT NULL;


-- Step 5: Drop zone_id from flora
-- ================================

ALTER TABLE flora DROP COLUMN IF EXISTS zone_id;

SELECT 'flora.zone_id removed' as status;


-- Step 6: Drop zone_id from fauna
-- ================================

ALTER TABLE fauna DROP COLUMN IF EXISTS zone_id;

SELECT 'fauna.zone_id removed' as status;


-- Step 7: Drop park_zones table
-- ==============================

-- Drop the entire table (cascade will handle foreign keys)
DROP TABLE IF EXISTS park_zones CASCADE;

SELECT 'park_zones table removed' as status;


-- Step 8: Verification
-- ====================

-- Check flora structure
SELECT 
    'Flora structure' as info,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'flora'
  AND column_name IN ('park_id', 'zone_id')
ORDER BY column_name;

-- Check fauna structure
SELECT 
    'Fauna structure' as info,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'fauna'
  AND column_name IN ('park_id', 'zone_id')
ORDER BY column_name;

-- Check if park_zones table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'park_zones')
        THEN 'ERROR: park_zones still exists'
        ELSE 'SUCCESS: park_zones removed'
    END as park_zones_status;

-- Summary
SELECT 
    'SIMPLIFICATION COMPLETE' as status,
    (SELECT COUNT(*) FROM flora WHERE park_id IS NOT NULL) as flora_with_park,
    (SELECT COUNT(*) FROM fauna WHERE park_id IS NOT NULL) as fauna_with_park,
    (SELECT COUNT(*) FROM park_zones_backup_20251024) as zones_backed_up;

