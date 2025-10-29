-- Extend rejection_reason column to TEXT to store backup data
-- This allows storing full backup JSON when editing approved parks

ALTER TABLE parks ALTER COLUMN rejection_reason TYPE TEXT;

COMMENT ON COLUMN parks.rejection_reason IS 'Rejection reason or backup data for approved park edits';

