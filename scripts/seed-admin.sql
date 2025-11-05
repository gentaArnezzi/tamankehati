-- Seed Super Admin User
-- Run this script to create super admin user directly in PostgreSQL

-- Generate bcrypt hash for password
-- Password: admin123 (default)
-- You can generate hash using Python: 
-- python3 -c "import bcrypt; print(bcrypt.hashpw(b'admin123', bcrypt.gensalt()).decode('utf-8'))"

-- Insert super admin user
-- Note: Replace the hashed_password with actual bcrypt hash
INSERT INTO users (
    email,
    hashed_password,
    role,
    display_name,
    full_name,
    is_active,
    created_at,
    updated_at
) VALUES (
    'admin@kehati.org',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5kZ8K8V5Q5K5O',  -- Replace with actual bcrypt hash for your password
    'super_admin',
    'Super Administrator',
    'System Administrator',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verify admin was created
SELECT id, email, role, display_name, is_active, created_at 
FROM users 
WHERE role = 'super_admin';

