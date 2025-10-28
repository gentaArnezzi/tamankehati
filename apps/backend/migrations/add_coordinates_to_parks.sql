-- Migration: Add coordinates to parks table
-- Created: 2024-12-19
-- Description: Add latitude and longitude columns to parks table for interactive map functionality

-- Add coordinate fields to parks table
ALTER TABLE parks ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);

ALTER TABLE parks ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add comments for documentation
COMMENT ON COLUMN parks.latitude IS 'Latitude coordinate for park location (decimal degrees)';

COMMENT ON COLUMN parks.longitude IS 'Longitude coordinate for park location (decimal degrees)';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_parks_latitude ON parks (latitude);

CREATE INDEX IF NOT EXISTS idx_parks_longitude ON parks (longitude);

CREATE INDEX IF NOT EXISTS idx_parks_coordinates ON parks (latitude, longitude);

-- Add constraints to ensure valid coordinate ranges
ALTER TABLE parks
ADD CONSTRAINT IF NOT EXISTS chk_latitude_range CHECK (
    latitude IS NULL
    OR (
        latitude >= -90
        AND latitude <= 90
    )
);

ALTER TABLE parks
ADD CONSTRAINT IF NOT EXISTS chk_longitude_range CHECK (
    longitude IS NULL
    OR (
        longitude >= -180
        AND longitude <= 180
    )
);

-- Verification query
SELECT
    'Parks with coordinates' as info,
    COUNT(*) as total_parks,
    COUNT(latitude) as parks_with_latitude,
    COUNT(longitude) as parks_with_longitude,
    COUNT(
        CASE
            WHEN latitude IS NOT NULL
            AND longitude IS NOT NULL THEN 1
        END
    ) as parks_with_both_coordinates
FROM parks;

SELECT 'Migration complete!' as status;