-- Migration: Remove regions table and region dependencies
-- Date: 2024-10-26
-- Purpose: Remove regions table and all region-related dependencies for user-based access control

-- 1. Remove foreign key constraints first
DO $$
BEGIN
    -- Remove region_id foreign key from parks table
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_parks_region_id' AND table_name = 'parks') THEN
        ALTER TABLE parks DROP CONSTRAINT fk_parks_region_id;
    END IF;
    
    -- Remove region_id foreign key from users table if exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_users_region_id' AND table_name = 'users') THEN
        ALTER TABLE users DROP CONSTRAINT fk_users_region_id;
    END IF;
END $$;

-- 2. Remove region_id columns
DO $$
BEGIN
    -- Remove region_id from parks table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parks' AND column_name = 'region_id') THEN
        ALTER TABLE parks DROP COLUMN region_id;
    END IF;
    
    -- Remove region_code from users table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'region_code') THEN
        ALTER TABLE users DROP COLUMN region_code;
    END IF;
    
    -- Remove wilayah from users table (alias for region_code)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'wilayah') THEN
        ALTER TABLE users DROP COLUMN wilayah;
    END IF;
END $$;

-- 3. Drop regions table
DROP TABLE IF EXISTS regions CASCADE;

-- 4. Remove any remaining region-related indexes
DO $$
BEGIN
    -- Remove region-related indexes
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_parks_region_id') THEN
        DROP INDEX ix_parks_region_id;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_users_region_code') THEN
        DROP INDEX ix_users_region_code;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_users_wilayah') THEN
        DROP INDEX ix_users_wilayah;
    END IF;
END $$;

-- 5. Update any remaining region_code references in other tables
DO $$
BEGIN
    -- Remove region_code from flora table if exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'flora' AND column_name = 'region_code') THEN
        ALTER TABLE flora DROP COLUMN region_code;
    END IF;
    
    -- Remove region_code from fauna table if exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fauna' AND column_name = 'region_code') THEN
        ALTER TABLE fauna DROP COLUMN region_code;
    END IF;
    
    -- Remove region_code from activities table if exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'region_code') THEN
        ALTER TABLE activities DROP COLUMN region_code;
    END IF;
END $$;

SELECT 'Migration remove_regions_table completed successfully' as status;