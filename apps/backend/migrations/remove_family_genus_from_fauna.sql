-- Migration: Remove family and genus columns from fauna table
-- Created: 2024-10-24
-- Description: Remove family and genus columns from fauna table as they are not needed

-- Remove family and genus columns
ALTER TABLE fauna DROP COLUMN IF EXISTS family;
ALTER TABLE fauna DROP COLUMN IF EXISTS genus;

-- Add comment for documentation
COMMENT ON TABLE fauna IS 'Fauna table - removed family and genus columns';
