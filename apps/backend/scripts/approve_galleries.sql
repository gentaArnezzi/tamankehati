-- Approve all draft galleries
-- Run this SQL to approve existing gallery images

-- Check current status
SELECT 
    id,
    entity_type,
    entity_id,
    title,
    status,
    created_at
FROM galleries
WHERE status = 'draft'
ORDER BY created_at DESC;

-- Approve all draft galleries
UPDATE galleries 
SET status = 'approved'
WHERE status = 'draft';

-- Verify update
SELECT 
    status,
    COUNT(*) as count
FROM galleries
GROUP BY status
ORDER BY status;

-- Show recently approved galleries
SELECT 
    id,
    entity_type,
    entity_id,
    title,
    status
FROM galleries
WHERE status = 'approved'
ORDER BY created_at DESC
LIMIT 10;

