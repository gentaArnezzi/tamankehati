-- Migration: Add location fields to parks table
-- Created: 2024-10-24
-- Description: Add lokasi_provinsi, lokasi_kabupaten, lokasi_kecamatan, lokasi_desa columns to parks table

-- Add location fields to parks table
ALTER TABLE parks ADD COLUMN IF NOT EXISTS lokasi_provinsi VARCHAR(100);
ALTER TABLE parks ADD COLUMN IF NOT EXISTS lokasi_kabupaten VARCHAR(100);
ALTER TABLE parks ADD COLUMN IF NOT EXISTS lokasi_kecamatan VARCHAR(100);
ALTER TABLE parks ADD COLUMN IF NOT EXISTS lokasi_desa VARCHAR(100);

-- Add comments for documentation
COMMENT ON COLUMN parks.lokasi_provinsi IS 'Provinsi lokasi taman konservasi';
COMMENT ON COLUMN parks.lokasi_kabupaten IS 'Kabupaten/Kota lokasi taman konservasi';
COMMENT ON COLUMN parks.lokasi_kecamatan IS 'Kecamatan lokasi taman konservasi';
COMMENT ON COLUMN parks.lokasi_desa IS 'Desa/Kelurahan lokasi taman konservasi';

-- Create indexes for better query performance (optional)
CREATE INDEX IF NOT EXISTS idx_parks_lokasi_provinsi ON parks(lokasi_provinsi);
CREATE INDEX IF NOT EXISTS idx_parks_lokasi_kabupaten ON parks(lokasi_kabupaten);
CREATE INDEX IF NOT EXISTS idx_parks_lokasi_kecamatan ON parks(lokasi_kecamatan);
CREATE INDEX IF NOT EXISTS idx_parks_lokasi_desa ON parks(lokasi_desa);
