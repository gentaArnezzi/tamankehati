-- Initial database setup for Taman Kehati
-- This script runs when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist (though docker-compose should handle this)
-- The database is already created via POSTGRES_DB environment variable

-- Set timezone to Asia/Jakarta for Indonesian context
SET timezone = 'Asia/Jakarta';

-- Create any additional databases if needed
-- CREATE DATABASE kehati_test;

-- You can add additional setup here like creating users, setting permissions, etc.
-- For example:
-- CREATE USER readonly_user WITH PASSWORD 'readonly_pass';
-- GRANT CONNECT ON DATABASE kehati TO readonly_user;
-- GRANT USAGE ON SCHEMA public TO readonly_user;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
