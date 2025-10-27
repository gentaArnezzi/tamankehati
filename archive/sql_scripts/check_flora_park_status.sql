-- Check user park assignment and park status
SELECT 
    u.id as user_id,
    u.email,
    u.park_id as user_park_id,
    p.id as park_id,
    p.name as park_name,
    p.status as park_status,
    p.submitted_by,
    p.approved_at
FROM users u
LEFT JOIN parks p ON u.park_id = p.id
WHERE u.email = 'genta@kehati.org';

-- Check flora created by this user
SELECT 
    f.id as flora_id,
    f.local_name,
    f.park_id,
    f.status as flora_status,
    f.submitted_by,
    p.name as park_name,
    p.status as park_status,
    p.submitted_by as park_submitted_by
FROM flora f
LEFT JOIN parks p ON f.park_id = p.id
LEFT JOIN users u ON f.submitted_by = u.id
WHERE u.email = 'genta@kehati.org'
ORDER BY f.id;
