-- Fix enum type mismatch after git pull
-- Run this script with: psql kehati5 < fix_enum.sql

-- Convert flora.status from enum to varchar
ALTER TABLE flora ALTER COLUMN status TYPE varchar(50);

-- Convert fauna.status from enum to varchar
ALTER TABLE fauna ALTER COLUMN status TYPE varchar(50);

-- Done! Now restart the backend server

