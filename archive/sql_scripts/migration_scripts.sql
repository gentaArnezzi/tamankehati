-- Migration Scripts for Railway PostgreSQL Database
-- This script creates missing tables and updates existing ones

-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- ==============================================
-- PHASE 1: CREATE MISSING TABLES
-- ==============================================

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    summary VARCHAR(500),
    type VARCHAR(50) NOT NULL DEFAULT 'announcement',
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    target_audience VARCHAR(50) NOT NULL DEFAULT 'regional_admin',
    priority INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP
    WITH
        TIME ZONE,
        expires_at TIMESTAMP
    WITH
        TIME ZONE,
        author_id INTEGER REFERENCES users (id),
        submitted_by INTEGER REFERENCES users (id),
        submitted_at TIMESTAMP
    WITH
        TIME ZONE,
        approved_by INTEGER REFERENCES users (id),
        approved_at TIMESTAMP
    WITH
        TIME ZONE,
        rejected_by INTEGER REFERENCES users (id),
        rejected_at TIMESTAMP
    WITH
        TIME ZONE,
        rejection_reason VARCHAR(500),
        featured_image VARCHAR(500),
        attachments TEXT,
        tags VARCHAR(500),
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP
    WITH
        TIME ZONE
);

-- Create news table
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    summary VARCHAR(500),
    slug VARCHAR(255) UNIQUE,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    priority INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP
    WITH
        TIME ZONE,
        expires_at TIMESTAMP
    WITH
        TIME ZONE,
        author_id INTEGER REFERENCES users (id),
        submitted_by INTEGER REFERENCES users (id),
        submitted_at TIMESTAMP
    WITH
        TIME ZONE,
        approved_by INTEGER REFERENCES users (id),
        approved_at TIMESTAMP
    WITH
        TIME ZONE,
        rejected_by INTEGER REFERENCES users (id),
        rejected_at TIMESTAMP
    WITH
        TIME ZONE,
        rejection_reason VARCHAR(500),
        featured_image VARCHAR(500),
        attachments TEXT,
        tags VARCHAR(500),
        view_count INTEGER DEFAULT 0,
        reading_time INTEGER DEFAULT 0,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP
    WITH
        TIME ZONE
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description VARCHAR(500),
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    actor_id INTEGER NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    actor_region_code VARCHAR(10),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id INTEGER,
    old_values JSON,
    new_values JSON,
    metadata JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    to_user_id INTEGER NOT NULL,
    from_user_id INTEGER,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    resource VARCHAR(100),
    resource_id INTEGER,
    region_code VARCHAR(10),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- PHASE 2: CREATE INDEXES FOR NEW TABLES
-- ==============================================

-- Indexes for announcements
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements (status);

CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);

CREATE INDEX IF NOT EXISTS idx_announcements_author_id ON announcements (author_id);

CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements (created_at);

-- Indexes for news
CREATE INDEX IF NOT EXISTS idx_news_status ON news (status);

CREATE INDEX IF NOT EXISTS idx_news_category ON news (category);

CREATE INDEX IF NOT EXISTS idx_news_author_id ON news (author_id);

CREATE INDEX IF NOT EXISTS idx_news_slug ON news (slug);

CREATE INDEX IF NOT EXISTS idx_news_created_at ON news (created_at);

-- Indexes for system_settings
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings (key);

CREATE INDEX IF NOT EXISTS idx_system_settings_is_public ON system_settings (is_public);

-- Indexes for audit_log
CREATE INDEX IF NOT EXISTS idx_audit_log_actor_id ON audit_log (actor_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_resource_type ON audit_log (resource_type);

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log (created_at);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_to_user_id ON notifications (to_user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications (is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications (created_at);

-- ==============================================
-- PHASE 3: UPDATE EXISTING TABLES
-- ==============================================

-- Update users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);

ALTER TABLE users ADD COLUMN IF NOT EXISTS region_code VARCHAR(10);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Update parks table with missing columns
ALTER TABLE parks ADD COLUMN IF NOT EXISTS code VARCHAR(50);

ALTER TABLE parks
ADD COLUMN IF NOT EXISTS location GEOMETRY (POINT, 4326);

ALTER TABLE parks
ADD COLUMN IF NOT EXISTS boundary GEOMETRY (MULTIPOLYGON, 4326);

ALTER TABLE parks
ADD COLUMN IF NOT EXISTS total_area_ha NUMERIC(12, 2) DEFAULT 0.00;

ALTER TABLE parks
ADD COLUMN IF NOT EXISTS geom GEOMETRY (MULTIPOLYGON, 4326);

ALTER TABLE parks
ADD COLUMN IF NOT EXISTS tipe_ekoregion VARCHAR(100);

ALTER TABLE parks ADD COLUMN IF NOT EXISTS kondisi_fisik TEXT;

ALTER TABLE parks ADD COLUMN IF NOT EXISTS nilai_penting TEXT;

ALTER TABLE parks ADD COLUMN IF NOT EXISTS sejarah TEXT;

ALTER TABLE parks ADD COLUMN IF NOT EXISTS visi TEXT;

ALTER TABLE parks ADD COLUMN IF NOT EXISTS misi TEXT;

ALTER TABLE parks ADD COLUMN IF NOT EXISTS nilai_dasar TEXT;

-- Add workflow columns to parks
ALTER TABLE parks ADD COLUMN IF NOT EXISTS submitted_by INTEGER;

ALTER TABLE parks
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP
WITH
    TIME ZONE;

ALTER TABLE parks ADD COLUMN IF NOT EXISTS approved_by INTEGER;

ALTER TABLE parks
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP
WITH
    TIME ZONE;

ALTER TABLE parks ADD COLUMN IF NOT EXISTS rejected_by INTEGER;

ALTER TABLE parks
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP
WITH
    TIME ZONE;

ALTER TABLE parks
ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(500);

ALTER TABLE parks
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP
WITH
    TIME ZONE;

-- Update articles table with workflow columns
ALTER TABLE articles ADD COLUMN IF NOT EXISTS submitted_by INTEGER;

ALTER TABLE articles
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP
WITH
    TIME ZONE;

ALTER TABLE articles ADD COLUMN IF NOT EXISTS approved_by INTEGER;

ALTER TABLE articles
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP
WITH
    TIME ZONE;

ALTER TABLE articles ADD COLUMN IF NOT EXISTS rejected_by INTEGER;

ALTER TABLE articles
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP
WITH
    TIME ZONE;

ALTER TABLE articles
ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(500);

ALTER TABLE articles
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP
WITH
    TIME ZONE;

-- Update fauna table with workflow columns
ALTER TABLE fauna ADD COLUMN IF NOT EXISTS submitted_by INTEGER;

ALTER TABLE fauna
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP
WITH
    TIME ZONE;

ALTER TABLE fauna ADD COLUMN IF NOT EXISTS approved_by INTEGER;

ALTER TABLE fauna
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP
WITH
    TIME ZONE;

ALTER TABLE fauna ADD COLUMN IF NOT EXISTS rejected_by INTEGER;

ALTER TABLE fauna
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP
WITH
    TIME ZONE;

ALTER TABLE fauna
ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(500);

ALTER TABLE fauna
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP
WITH
    TIME ZONE;

-- Update flora table with workflow columns
ALTER TABLE flora ADD COLUMN IF NOT EXISTS submitted_by INTEGER;

ALTER TABLE flora
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP
WITH
    TIME ZONE;

ALTER TABLE flora ADD COLUMN IF NOT EXISTS approved_by INTEGER;

ALTER TABLE flora
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP
WITH
    TIME ZONE;

ALTER TABLE flora ADD COLUMN IF NOT EXISTS rejected_by INTEGER;

ALTER TABLE flora
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP
WITH
    TIME ZONE;

ALTER TABLE flora
ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(500);

ALTER TABLE flora
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP
WITH
    TIME ZONE;

-- Update galleries table with workflow columns
ALTER TABLE galleries ADD COLUMN IF NOT EXISTS submitted_by INTEGER;

ALTER TABLE galleries
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP
WITH
    TIME ZONE;

ALTER TABLE galleries ADD COLUMN IF NOT EXISTS approved_by INTEGER;

ALTER TABLE galleries
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP
WITH
    TIME ZONE;

ALTER TABLE galleries ADD COLUMN IF NOT EXISTS rejected_by INTEGER;

ALTER TABLE galleries
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP
WITH
    TIME ZONE;

ALTER TABLE galleries
ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(500);

ALTER TABLE galleries
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP
WITH
    TIME ZONE;

-- ==============================================
-- PHASE 4: CREATE ADDITIONAL INDEXES
-- ==============================================

-- Indexes for parks table
CREATE INDEX IF NOT EXISTS idx_parks_location ON parks USING GIST (location);

CREATE INDEX IF NOT EXISTS idx_parks_boundary ON parks USING GIST (boundary);

CREATE INDEX IF NOT EXISTS idx_parks_geom ON parks USING GIST (geom);

CREATE INDEX IF NOT EXISTS idx_parks_region_id ON parks (region_id);

CREATE INDEX IF NOT EXISTS idx_parks_status ON parks (status);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_region_code ON users (region_code);

CREATE INDEX IF NOT EXISTS idx_users_is_active ON users (is_active);

-- Indexes for articles table
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles (author_id);

CREATE INDEX IF NOT EXISTS idx_articles_status ON articles (status);

-- Indexes for fauna table
CREATE INDEX IF NOT EXISTS idx_fauna_park_id ON fauna (park_id);

CREATE INDEX IF NOT EXISTS idx_fauna_status ON fauna (status);

-- Indexes for flora table
CREATE INDEX IF NOT EXISTS idx_flora_park_id ON flora (park_id);

CREATE INDEX IF NOT EXISTS idx_flora_status ON flora (status);

-- Indexes for galleries table
CREATE INDEX IF NOT EXISTS idx_galleries_park_id ON galleries (park_id);

CREATE INDEX IF NOT EXISTS idx_galleries_uploaded_by ON galleries (uploaded_by);

-- ==============================================
-- PHASE 5: ADD CONSTRAINTS
-- ==============================================

-- Add unique constraint for parks code
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_parks_code') THEN
        ALTER TABLE parks ADD CONSTRAINT uk_parks_code UNIQUE (code);

END IF;

END $$;

-- Add foreign key constraints for workflow fields
DO $$ 
BEGIN
    -- Parks table constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_parks_submitted_by') THEN
        ALTER TABLE parks ADD CONSTRAINT fk_parks_submitted_by FOREIGN KEY (submitted_by) REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_parks_approved_by') THEN
        ALTER TABLE parks ADD CONSTRAINT fk_parks_approved_by FOREIGN KEY (approved_by) REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_parks_rejected_by') THEN
        ALTER TABLE parks ADD CONSTRAINT fk_parks_rejected_by FOREIGN KEY (rejected_by) REFERENCES users(id);
    END IF;
    
    -- Articles table constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_articles_submitted_by') THEN
        ALTER TABLE articles ADD CONSTRAINT fk_articles_submitted_by FOREIGN KEY (submitted_by) REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_articles_approved_by') THEN
        ALTER TABLE articles ADD CONSTRAINT fk_articles_approved_by FOREIGN KEY (approved_by) REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_articles_rejected_by') THEN
        ALTER TABLE articles ADD CONSTRAINT fk_articles_rejected_by FOREIGN KEY (rejected_by) REFERENCES users(id);
    END IF;
    
    -- Fauna table constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_fauna_submitted_by') THEN
        ALTER TABLE fauna ADD CONSTRAINT fk_fauna_submitted_by FOREIGN KEY (submitted_by) REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_fauna_approved_by') THEN
        ALTER TABLE fauna ADD CONSTRAINT fk_fauna_approved_by FOREIGN KEY (approved_by) REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_fauna_rejected_by') THEN
        ALTER TABLE fauna ADD CONSTRAINT fk_fauna_rejected_by FOREIGN KEY (rejected_by) REFERENCES users(id);
    END IF;
    
    -- Flora table constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_flora_submitted_by') THEN
        ALTER TABLE flora ADD CONSTRAINT fk_flora_submitted_by FOREIGN KEY (submitted_by) REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_flora_approved_by') THEN
        ALTER TABLE flora ADD CONSTRAINT fk_flora_approved_by FOREIGN KEY (approved_by) REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_flora_rejected_by') THEN
        ALTER TABLE flora ADD CONSTRAINT fk_flora_rejected_by FOREIGN KEY (rejected_by) REFERENCES users(id);
    END IF;
    
    -- Galleries table constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_galleries_submitted_by') THEN
        ALTER TABLE galleries ADD CONSTRAINT fk_galleries_submitted_by FOREIGN KEY (submitted_by) REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_galleries_approved_by') THEN
        ALTER TABLE galleries ADD CONSTRAINT fk_galleries_approved_by FOREIGN KEY (approved_by) REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_galleries_rejected_by') THEN
        ALTER TABLE galleries ADD CONSTRAINT fk_galleries_rejected_by FOREIGN KEY (rejected_by) REFERENCES users(id);
    END IF;
END $$;

-- ==============================================
-- PHASE 6: INSERT DEFAULT SYSTEM SETTINGS
-- ==============================================

-- Insert default system settings
INSERT INTO
    system_settings (
        key,
        value,
        description,
        is_public
    )
VALUES (
        'site_name',
        'Tamankehati',
        'Nama situs web',
        true
    ),
    (
        'site_description',
        'Sistem Informasi Taman Kehati',
        'Deskripsi situs web',
        true
    ),
    (
        'maintenance_mode',
        'false',
        'Mode maintenance',
        false
    ),
    (
        'max_file_size',
        '10485760',
        'Ukuran maksimal file upload (bytes)',
        false
    ),
    (
        'allowed_file_types',
        'jpg,jpeg,png,gif,pdf,doc,docx',
        'Tipe file yang diizinkan',
        false
    ),
    (
        'email_notifications',
        'true',
        'Aktifkan notifikasi email',
        false
    ),
    (
        'audit_log_retention_days',
        '365',
        'Hari retensi log audit',
        false
    ) ON CONFLICT (key) DO NOTHING;

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE
    table_schema = 'public'
ORDER BY table_name;

-- Check table structures
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE
    table_schema = 'public'
ORDER BY table_name, ordinal_position;