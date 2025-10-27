-- Migration: Add park_id to user table
-- Purpose: Allow regional admins to be assigned to specific parks

-- Add park_id column to user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS park_id UUID REFERENCES parks(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_park_id ON "user"(park_id);

-- Add comment
COMMENT ON COLUMN "user".park_id IS 'Park assigned to this regional admin user';

-- Show result
SELECT id, email, role, region, regionid, park_id FROM "user" LIMIT 5;

