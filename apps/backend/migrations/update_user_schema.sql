-- Migration: Update user schema to use park_id instead of region_code and wilayah
-- Date: 2024-01-XX
-- Description: Remove region_code and wilayah columns, add park_id column with foreign key

-- Step 1: Add park_id column (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'park_id') THEN
        ALTER TABLE users ADD COLUMN park_id INTEGER;
    END IF;
END $$;

-- Step 2: Create index for park_id (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'users' AND indexname = 'idx_users_park_id') THEN
        CREATE INDEX idx_users_park_id ON users(park_id);
    END IF;
END $$;

-- Step 3: Add foreign key constraint (if parks table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parks') THEN
        -- Drop existing constraint if exists
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_users_park_id') THEN
            ALTER TABLE users DROP CONSTRAINT fk_users_park_id;
        END IF;
        
        -- Add foreign key constraint
        ALTER TABLE users ADD CONSTRAINT fk_users_park_id FOREIGN KEY (park_id) REFERENCES parks(id);
    END IF;
END $$;

-- Step 4: Remove old columns (if they exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'region_code') THEN
        ALTER TABLE users DROP COLUMN region_code;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'wilayah') THEN
        ALTER TABLE users DROP COLUMN wilayah;
    END IF;
END $$;

-- Step 5: Update any existing data if needed
-- You might want to migrate existing region_code/wilayah data to park_id
-- This depends on your specific data migration requirements
-- Example migration script (uncomment and modify as needed):
/*
UPDATE users 
SET park_id = (
SELECT id FROM parks 
WHERE parks.name ILIKE '%' || users.region_code || '%' 
LIMIT 1
)
WHERE region_code IS NOT NULL AND park_id IS NULL;
*/