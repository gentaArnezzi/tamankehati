-- Migration: Rename created_by to submitted_by for consistency
-- Date: 2024-10-26
-- Purpose: Standardize all tables to use submitted_by instead of created_by

-- 1. Parks table - rename created_by to submitted_by
DO $$
BEGIN
    -- Check if created_by exists and submitted_by doesn't exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parks' AND column_name = 'created_by') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parks' AND column_name = 'submitted_by') THEN
        
        -- Rename the column
        ALTER TABLE parks RENAME COLUMN created_by TO submitted_by;
        
        -- Update comment
        COMMENT ON COLUMN parks.submitted_by IS 'User who created/submitted this park';
    END IF;
END $$;

-- 2. Activities table - rename created_by to submitted_by
DO $$
BEGIN
    -- Check if created_by exists and submitted_by doesn't exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'created_by') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'submitted_by') THEN
        
        -- Rename the column
        ALTER TABLE activities RENAME COLUMN created_by TO submitted_by;
        
        -- Update comment
        COMMENT ON COLUMN activities.submitted_by IS 'User who created/submitted this activity';
    END IF;
END $$;

-- 3. Update foreign key constraints if needed
DO $$
BEGIN
    -- Parks table
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE table_name = 'parks' AND constraint_name LIKE '%created_by%') THEN
        -- Drop old constraint
        ALTER TABLE parks DROP CONSTRAINT IF EXISTS fk_parks_created_by_users;
        -- Add new constraint
        ALTER TABLE parks ADD CONSTRAINT fk_parks_submitted_by_users 
        FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    
    -- Activities table
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE table_name = 'activities' AND constraint_name LIKE '%created_by%') THEN
        -- Drop old constraint
        ALTER TABLE activities DROP CONSTRAINT IF EXISTS fk_activities_created_by_users;
        -- Add new constraint
        ALTER TABLE activities ADD CONSTRAINT fk_activities_submitted_by_users 
        FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Update indexes
DO $$
BEGIN
    -- Parks table
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'parks' AND indexname LIKE '%created_by%') THEN
        DROP INDEX IF EXISTS idx_parks_created_by;
        CREATE INDEX IF NOT EXISTS idx_parks_submitted_by ON parks(submitted_by);
    END IF;
    
    -- Activities table
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'activities' AND indexname LIKE '%created_by%') THEN
        DROP INDEX IF EXISTS idx_activities_created_by;
        CREATE INDEX IF NOT EXISTS idx_activities_submitted_by ON activities(submitted_by);
    END IF;
END $$;

-- 5. Verify changes
SELECT
    'Parks table columns' as table_info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE
    table_name = 'parks'
    AND column_name IN ('created_by', 'submitted_by')
ORDER BY column_name;

SELECT
    'Activities table columns' as table_info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE
    table_name = 'activities'
    AND column_name IN ('created_by', 'submitted_by')
ORDER BY column_name;

SELECT 'Migration completed successfully!' as status;