# Migration Plan: Current Database to Railway PostgreSQL

## Overview

Migrating from current database to Railway PostgreSQL database, excluding `park_zones` table as requested.

## Database Connection

- **New Database:** `postgresql://postgres:wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz@maglev.proxy.rlwy.net:26951/railway`

## Tables Analysis

### ✅ Tables Already Exist in New Database

1. **activities** - New table, not in current system
2. **articles** - Exists but different structure
3. **fauna** - Exists, similar structure
4. **flora** - Exists, similar structure
5. **galleries** - Exists, similar structure
6. **parks** - Exists but different structure
7. **regions** - Exists, similar structure
8. **users** - Exists but different structure

### ❌ Tables Missing in New Database (Need to Create)

1. **announcements** - Complete workflow system
2. **news** - Complete workflow system
3. **system_settings** - Configuration management
4. **audit_log** - Audit trail system
5. **notifications** - User notification system

### 🚫 Tables to Exclude (As Requested)

1. **park_zones** - Will not be migrated

## Migration Strategy

### Phase 1: Create Missing Tables

```sql
-- Create announcements table
CREATE TABLE announcements (
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
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    author_id INTEGER REFERENCES users(id),
    submitted_by INTEGER REFERENCES users(id),
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_by INTEGER REFERENCES users(id),
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason VARCHAR(500),
    featured_image VARCHAR(500),
    attachments TEXT,
    tags VARCHAR(500),
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create news table
CREATE TABLE news (
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
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    author_id INTEGER REFERENCES users(id),
    submitted_by INTEGER REFERENCES users(id),
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_by INTEGER REFERENCES users(id),
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason VARCHAR(500),
    featured_image VARCHAR(500),
    attachments TEXT,
    tags VARCHAR(500),
    view_count INTEGER DEFAULT 0,
    reading_time INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create system_settings table
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description VARCHAR(500),
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_log table
CREATE TABLE audit_log (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_announcements_status ON announcements(status);
CREATE INDEX idx_announcements_type ON announcements(type);
CREATE INDEX idx_announcements_author_id ON announcements(author_id);
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_author_id ON news(author_id);
CREATE INDEX idx_audit_log_actor_id ON audit_log(actor_id);
CREATE INDEX idx_audit_log_resource_type ON audit_log(resource_type);
CREATE INDEX idx_notifications_to_user_id ON notifications(to_user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

### Phase 2: Update Existing Tables Structure

#### Users Table Updates

```sql
-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS region_code VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Rename columns if needed
-- Note: hashed_password vs password_hash - check which one to keep
-- Note: full_name vs display_name - check which one to keep
```

#### Parks Table Updates

```sql
-- Add missing columns to parks table
ALTER TABLE parks ADD COLUMN IF NOT EXISTS code VARCHAR(50) UNIQUE;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS location GEOMETRY(POINT, 4326);
ALTER TABLE parks ADD COLUMN IF NOT EXISTS boundary GEOMETRY(MULTIPOLYGON, 4326);
ALTER TABLE parks ADD COLUMN IF NOT EXISTS total_area_ha NUMERIC(12,2) DEFAULT 0.00;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS geom GEOMETRY(MULTIPOLYGON, 4326);
ALTER TABLE parks ADD COLUMN IF NOT EXISTS tipe_ekoregion VARCHAR(100);
ALTER TABLE parks ADD COLUMN IF NOT EXISTS kondisi_fisik TEXT;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS nilai_penting TEXT;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS sejarah TEXT;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS visi TEXT;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS misi TEXT;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS nilai_dasar TEXT;

-- Add workflow columns
ALTER TABLE parks ADD COLUMN IF NOT EXISTS submitted_by INTEGER;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS approved_by INTEGER;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS rejected_by INTEGER;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(500);
ALTER TABLE parks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_parks_location ON parks USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_parks_region_id ON parks(region_id);
```

#### Articles Table Updates

```sql
-- Add missing workflow columns to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS submitted_by INTEGER;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS approved_by INTEGER;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS rejected_by INTEGER;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(500);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
```

### Phase 3: Data Migration

1. **Export data from current database**
2. **Transform data to match new schema**
3. **Import data to new database**
4. **Verify data integrity**

### Phase 4: Update Application Configuration

1. **Update database connection string**
2. **Update environment variables**
3. **Test application functionality**
4. **Update any hardcoded references**

## Notes

- **park_zones table is excluded** as requested
- **PostGIS extension** may be needed for geometry fields
- **Data transformation** will be needed for some fields
- **Backup current database** before migration
- **Test thoroughly** after migration

## Next Steps

1. Create missing tables
2. Update existing table structures
3. Migrate data
4. Update application configuration
5. Test and verify
