-- =============================================================================
-- Add created_by field to parks table
-- Date: 2024-10-25
-- Purpose: Track which user created each park for regional admin filtering
-- =============================================================================

-- Step 1: Add created_by column
-- ==============================

ALTER TABLE parks 
ADD COLUMN IF NOT EXISTS created_by INTEGER;

-- Step 2: Add foreign key constraint
-- ===================================

ALTER TABLE parks 
ADD CONSTRAINT IF NOT EXISTS fk_parks_created_by_users 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Step 3: Add comment
-- ===================

COMMENT ON COLUMN parks.created_by IS 'User who created this park';

-- Step 4: Update existing parks with a default user (admin)
-- ==========================================================

-- Set created_by to admin user (id=1) for existing parks
UPDATE parks 
SET created_by = 1 
WHERE created_by IS NULL;

-- Verification
-- ============

SELECT 
    'Parks with created_by' as info,
    COUNT(*) as total_parks,
    COUNT(created_by) as parks_with_creator
FROM parks;

SELECT 
    'Parks by creator' as info,
    u.email as creator_email,
    u.role as creator_role,
    COUNT(p.id) as park_count
FROM parks p
LEFT JOIN users u ON p.created_by = u.id
GROUP BY u.email, u.role
ORDER BY park_count DESC;

SELECT 'Migration complete!' as status;

