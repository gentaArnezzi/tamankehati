-- ════════════════════════════════════════════════════════════════════════════
-- 🧹 CLEANUP SCRIPT: Remove Multiple Parks Per User
-- ════════════════════════════════════════════════════════════════════════════
-- 
-- BUSINESS RULE: 1 user = 1 park only!
-- 
-- This script identifies and handles users with multiple parks.
-- 
-- ════════════════════════════════════════════════════════════════════════════

-- Step 1: IDENTIFY users with multiple parks
-- ════════════════════════════════════════════════════════════════════════════

SELECT 
    u.id as user_id,
    u.email,
    u.park_id as assigned_park_id,
    COUNT(p.id) as total_parks_submitted,
    STRING_AGG(p.name || ' (' || p.status || ')', ', ' ORDER BY p.id) as parks_list
FROM users u
LEFT JOIN parks p ON p.submitted_by = u.id
WHERE u.role = 'regional_admin'
GROUP BY u.id, u.email, u.park_id
HAVING COUNT(p.id) > 1
ORDER BY total_parks_submitted DESC;

-- ════════════════════════════════════════════════════════════════════════════

-- Step 2: ANALYZE park status distribution
-- ════════════════════════════════════════════════════════════════════════════

SELECT 
    u.id as user_id,
    u.email,
    u.park_id as assigned_park_id,
    p.id as park_id,
    p.name as park_name,
    p.status as park_status,
    p.created_at,
    CASE 
        WHEN p.status = 'approved' THEN 1
        WHEN p.status = 'in_review' THEN 2
        WHEN p.status = 'draft' THEN 3
        WHEN p.status = 'rejected' THEN 4
        ELSE 5
    END as priority
FROM users u
INNER JOIN parks p ON p.submitted_by = u.id
WHERE u.role = 'regional_admin'
    AND u.id IN (
        SELECT u2.id 
        FROM users u2
        LEFT JOIN parks p2 ON p2.submitted_by = u2.id
        WHERE u2.role = 'regional_admin'
        GROUP BY u2.id
        HAVING COUNT(p2.id) > 1
    )
ORDER BY u.id, priority, p.created_at DESC;

-- ════════════════════════════════════════════════════════════════════════════

-- Step 3: STRATEGY for cleanup
-- ════════════════════════════════════════════════════════════════════════════
-- 
-- For each user with multiple parks:
-- 
-- KEEP ONE:
--   Priority 1: Keep the "approved" park (if any)
--   Priority 2: Keep the "in_review" park (if no approved)
--   Priority 3: Keep the newest "draft" park (if no approved/in_review)
--   Priority 4: Keep the newest "rejected" park (last resort)
-- 
-- DELETE/CLEANUP:
--   - Set other parks to status = "archived" (don't hard delete for audit)
--   - Clear park_id from user if assigned to deleted park
--   - Keep only the highest priority park
-- 
-- ════════════════════════════════════════════════════════════════════════════

-- Step 4: DRY RUN - Preview what will be kept vs archived
-- ════════════════════════════════════════════════════════════════════════════

WITH user_parks AS (
    SELECT 
        u.id as user_id,
        u.email,
        u.park_id as user_assigned_park_id,
        p.id as park_id,
        p.name as park_name,
        p.status,
        p.created_at,
        ROW_NUMBER() OVER (
            PARTITION BY u.id 
            ORDER BY 
                CASE 
                    WHEN p.status = 'approved' THEN 1
                    WHEN p.status = 'in_review' THEN 2
                    WHEN p.status = 'draft' THEN 3
                    WHEN p.status = 'rejected' THEN 4
                    ELSE 5
                END,
                p.created_at DESC
        ) as park_priority
    FROM users u
    INNER JOIN parks p ON p.submitted_by = u.id
    WHERE u.role = 'regional_admin'
)
SELECT 
    user_id,
    email,
    park_id,
    park_name,
    status,
    CASE WHEN park_priority = 1 THEN '✅ KEEP' ELSE '🗑️  ARCHIVE' END as action,
    CASE 
        WHEN park_priority = 1 AND user_assigned_park_id != park_id THEN '⚠️  UPDATE user.park_id'
        WHEN park_priority = 1 AND user_assigned_park_id IS NULL THEN '⚠️  ASSIGN user.park_id'
        ELSE 'No user update needed'
    END as user_update
FROM user_parks
WHERE user_id IN (
    SELECT user_id 
    FROM user_parks 
    GROUP BY user_id 
    HAVING COUNT(*) > 1
)
ORDER BY user_id, park_priority;

-- ════════════════════════════════════════════════════════════════════════════

-- Step 5: EXECUTE CLEANUP (UNCOMMENT TO RUN)
-- ════════════════════════════════════════════════════════════════════════════
-- 
-- ⚠️  WARNING: This will modify data! Review Step 4 output first!
-- 
-- -- Archive parks that are NOT the highest priority for each user
-- UPDATE parks
-- SET 
--     status = 'archived',
--     updated_at = NOW()
-- WHERE id IN (
--     WITH user_parks AS (
--         SELECT 
--             u.id as user_id,
--             p.id as park_id,
--             ROW_NUMBER() OVER (
--                 PARTITION BY u.id 
--                 ORDER BY 
--                     CASE 
--                         WHEN p.status = 'approved' THEN 1
--                         WHEN p.status = 'in_review' THEN 2
--                         WHEN p.status = 'draft' THEN 3
--                         WHEN p.status = 'rejected' THEN 4
--                         ELSE 5
--                     END,
--                     p.created_at DESC
--             ) as park_priority
--         FROM users u
--         INNER JOIN parks p ON p.submitted_by = u.id
--         WHERE u.role = 'regional_admin'
--     )
--     SELECT park_id 
--     FROM user_parks 
--     WHERE park_priority > 1  -- Keep priority 1, archive the rest
--     AND user_id IN (
--         SELECT user_id 
--         FROM user_parks 
--         GROUP BY user_id 
--         HAVING COUNT(*) > 1
--     )
-- );
-- 
-- -- Update user.park_id to the kept park
-- UPDATE users
-- SET park_id = (
--     SELECT p.id
--     FROM parks p
--     WHERE p.submitted_by = users.id
--         AND p.status != 'archived'
--     ORDER BY 
--         CASE 
--             WHEN p.status = 'approved' THEN 1
--             WHEN p.status = 'in_review' THEN 2
--             WHEN p.status = 'draft' THEN 3
--             WHEN p.status = 'rejected' THEN 4
--             ELSE 5
--         END,
--         p.created_at DESC
--     LIMIT 1
-- )
-- WHERE role = 'regional_admin'
--     AND id IN (
--         SELECT u2.id 
--         FROM users u2
--         LEFT JOIN parks p2 ON p2.submitted_by = u2.id
--         WHERE u2.role = 'regional_admin'
--         GROUP BY u2.id
--         HAVING COUNT(p2.id) > 1
--     );

-- ════════════════════════════════════════════════════════════════════════════

-- Step 6: VERIFY cleanup
-- ════════════════════════════════════════════════════════════════════════════

-- Check if any users still have multiple non-archived parks
SELECT 
    u.id as user_id,
    u.email,
    u.park_id,
    COUNT(p.id) as active_parks_count
FROM users u
LEFT JOIN parks p ON p.submitted_by = u.id AND p.status != 'archived'
WHERE u.role = 'regional_admin'
GROUP BY u.id, u.email, u.park_id
HAVING COUNT(p.id) > 1;

-- Should return 0 rows if cleanup successful!

-- ════════════════════════════════════════════════════════════════════════════
