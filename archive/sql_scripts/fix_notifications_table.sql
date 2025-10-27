-- Fix notifications table schema
-- Add missing columns if they don't exist

-- Check current schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add from_user_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'from_user_id') THEN
        ALTER TABLE notifications ADD COLUMN from_user_id INTEGER NULL;
        CREATE INDEX IF NOT EXISTS ix_notifications_from_user_id ON notifications(from_user_id);
    END IF;

    -- Add resource if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'resource') THEN
        ALTER TABLE notifications ADD COLUMN resource VARCHAR(100) NULL;
    END IF;

    -- Add resource_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'resource_id') THEN
        ALTER TABLE notifications ADD COLUMN resource_id INTEGER NULL;
    END IF;

    -- Add region_code if missing (THIS IS THE CRITICAL ONE)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'region_code') THEN
        ALTER TABLE notifications ADD COLUMN region_code VARCHAR(10) NULL;
        CREATE INDEX IF NOT EXISTS ix_notifications_region_code ON notifications(region_code);
    END IF;

    -- Ensure indexes exist
    CREATE INDEX IF NOT EXISTS ix_notifications_to_user_id ON notifications(to_user_id);
    CREATE INDEX IF NOT EXISTS ix_notifications_is_read ON notifications(is_read);
    CREATE INDEX IF NOT EXISTS ix_notifications_created_at ON notifications(created_at);
END $$;

-- Verify final schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;


