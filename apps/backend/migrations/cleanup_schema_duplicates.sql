-- =============================================================================
-- DATABASE SCHEMA CLEANUP - Remove Duplicates and Redundancies
-- Date: 2024-10-24
-- Purpose: Clean up duplicate constraints, redundant foreign keys, and standardize naming
-- =============================================================================

-- Step 1: Remove Duplicate Constraints
-- =====================================

-- Remove duplicate unique constraint on parks.slug
ALTER TABLE parks DROP CONSTRAINT IF EXISTS uq_parks_slug;
-- Keep: parks_slug_key

-- Remove duplicate unique constraint on regions.code  
ALTER TABLE regions DROP CONSTRAINT IF EXISTS uq_regions_code;
-- Keep: regions_code_key

-- Remove conflicting foreign key on parks.region_id (keep the one with CASCADE)
ALTER TABLE parks DROP CONSTRAINT IF EXISTS fk_parks_region_id;
-- Keep: parks_region_id_fkey with CASCADE behavior


-- Step 2: Fix Flora Table - Remove Redundancy
-- ============================================

-- Drop the redundant park_id column from flora
-- (park_id can be obtained via zone.park_id)
ALTER TABLE flora DROP COLUMN IF EXISTS park_id;

-- Rename park_zone_id to zone_id for consistency with fauna
ALTER TABLE flora RENAME COLUMN park_zone_id TO zone_id;

-- Update index name to reflect the new column name
DROP INDEX IF EXISTS idx_flora_park_zone_id;
CREATE INDEX IF NOT EXISTS idx_flora_zone_id ON flora(zone_id);


-- Step 3: Fix Fauna Table - Remove Redundancy  
-- ============================================

-- Drop the redundant park_id column from fauna
-- (park_id can be obtained via zone.park_id)
ALTER TABLE fauna DROP COLUMN IF EXISTS park_id;

-- zone_id already has the correct name, no rename needed
-- idx_fauna_zone_id already exists


-- Step 4: Verification Queries
-- =============================

-- Verify flora structure
SELECT 
    'Flora columns after cleanup' as info,
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'flora' 
    AND column_name IN ('zone_id', 'park_id', 'park_zone_id')
ORDER BY column_name;

-- Verify fauna structure
SELECT 
    'Fauna columns after cleanup' as info,
    column_name,
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'fauna' 
    AND column_name IN ('zone_id', 'park_id')
ORDER BY column_name;

-- Verify parks constraints
SELECT 
    'Parks constraints after cleanup' as info,
    conname as constraint_name
FROM pg_constraint 
WHERE conrelid = 'parks'::regclass 
    AND conname LIKE '%slug%'
ORDER BY conname;

-- Verify regions constraints
SELECT 
    'Regions constraints after cleanup' as info,
    conname as constraint_name
FROM pg_constraint 
WHERE conrelid = 'regions'::regclass 
    AND conname LIKE '%code%'
ORDER BY conname;

-- Test query: Get flora with park info via zone
SELECT 
    'Test: Flora with park info via join' as info,
    f.id as flora_id,
    f.local_name,
    z.id as zone_id,
    z.name as zone_name,
    p.id as park_id,
    p.name as park_name
FROM flora f
LEFT JOIN park_zones z ON f.zone_id = z.id
LEFT JOIN parks p ON z.park_id = p.id
LIMIT 5;

-- Test query: Get fauna with park info via zone
SELECT 
    'Test: Fauna with park info via join' as info,
    f.id as fauna_id,
    f.local_name,
    z.id as zone_id,
    z.name as zone_name,
    p.id as park_id,
    p.name as park_name
FROM fauna f
LEFT JOIN park_zones z ON f.zone_id = z.id
LEFT JOIN parks p ON z.park_id = p.id
LIMIT 5;

-- Summary
SELECT 
    'CLEANUP COMPLETE' as status,
    'Removed duplicate constraints and redundant foreign keys' as description;

