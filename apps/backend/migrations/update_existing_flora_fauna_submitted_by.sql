-- Update existing flora and fauna to assign submitted_by
-- For data without submitted_by, assign to super_admin

-- Update Flora with NULL submitted_by to super_admin
UPDATE flora
SET submitted_by = 2  -- admin@kehati.org (super_admin)
WHERE submitted_by IS NULL;

-- Update Fauna with NULL submitted_by to super_admin
UPDATE fauna
SET submitted_by = 2  -- admin@kehati.org (super_admin)
WHERE submitted_by IS NULL;

-- Verify the updates
SELECT 'Flora' as table_name, COUNT(*) as updated_count
FROM flora
WHERE submitted_by = 2
UNION ALL
SELECT 'Fauna' as table_name, COUNT(*) as updated_count
FROM fauna
WHERE submitted_by = 2;

