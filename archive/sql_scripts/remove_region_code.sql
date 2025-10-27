-- Remove region_code column from database tables
-- This will fix the dashboard and other endpoint issues

-- Remove region_code from notifications table
ALTER TABLE notifications DROP COLUMN IF EXISTS region_code;

-- Remove region_code from users table
ALTER TABLE users DROP COLUMN IF EXISTS region_code;

-- Verify the columns are removed
SELECT 'region_code columns removed successfully' as status;