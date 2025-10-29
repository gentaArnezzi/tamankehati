-- Migration: Add gambar_utama column to parks table
-- Date: 2025-01-29
-- Description: Add image field for park photos

-- Add gambar_utama column to parks table
ALTER TABLE parks ADD COLUMN IF NOT EXISTS gambar_utama VARCHAR(500);

-- Add comment for documentation
COMMENT ON COLUMN parks.gambar_utama IS 'URL gambar utama taman';

