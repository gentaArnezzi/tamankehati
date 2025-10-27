-- =============================================================================
-- Remove Unused PostGIS Fields
-- Date: 2024-10-24
-- Purpose: Clean up geometry fields that are not being used yet
-- =============================================================================

-- OPTION B: Keep park_zones.geom (for shapefile upload), remove others
-- ======================================================================

-- Step 1: Backup tables with geometry data
-- =========================================

CREATE TABLE IF NOT EXISTS parks_geom_backup AS 
SELECT id, name, geom FROM parks WHERE geom IS NOT NULL;

CREATE TABLE IF NOT EXISTS regions_geom_backup AS 
SELECT id, code, name, geom FROM regions WHERE geom IS NOT NULL;

SELECT 
    'Backup created' as status,
    (SELECT COUNT(*) FROM parks_geom_backup) as parks_with_geom,
    (SELECT COUNT(*) FROM regions_geom_backup) as regions_with_geom;


-- Step 2: Drop geometry columns from parks
-- =========================================

-- Drop indexes first
DROP INDEX IF EXISTS idx_parks_geom;
DROP INDEX IF EXISTS ix_parks_geom;

-- Drop the geometry column
ALTER TABLE parks DROP COLUMN IF EXISTS geom;

SELECT 'parks.geom removed' as status;


-- Step 3: Drop geometry column from regions
-- ==========================================

-- Drop indexes first
DROP INDEX IF EXISTS idx_regions_geom;

-- Drop the geometry column
ALTER TABLE regions DROP COLUMN IF EXISTS geom;

SELECT 'regions.geom removed' as status;


-- Step 4: Drop centroid from park_zones (optional, not critical)
-- ===============================================================

-- Drop the centroid column (can be calculated on-the-fly if needed)
ALTER TABLE park_zones DROP COLUMN IF EXISTS centroid;

SELECT 'park_zones.centroid removed' as status;


-- Step 5: Keep park_zones.geom (IMPORTANT for shapefile upload!)
-- ===============================================================

-- We keep park_zones.geom and its indexes
-- This is essential for zone functionality

SELECT 
    'park_zones.geom KEPT (required for shapefile upload)' as status,
    COUNT(*) as zones_with_geom
FROM park_zones 
WHERE geom IS NOT NULL;


-- Step 6: Verification
-- ====================

-- List remaining geometry columns
SELECT 
    'Remaining geometry columns' as info,
    table_name, 
    column_name
FROM information_schema.columns 
WHERE udt_name = 'geometry' 
  AND table_schema = 'public'
ORDER BY table_name;

-- Summary
SELECT 
    'CLEANUP COMPLETE' as status,
    'Removed: parks.geom, regions.geom, park_zones.centroid' as removed,
    'Kept: park_zones.geom (required for zones)' as kept;

