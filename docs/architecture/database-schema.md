# 🗄️ Database Schema Design

Comprehensive documentation of the PostgreSQL database schema and design principles.

## Overview

The Taman Kehati database is built on PostgreSQL 15 with PostGIS extension for geospatial capabilities. It follows normalized design principles with clear relationships and constraints.

## Database Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│                 (FastAPI + SQLAlchemy)                      │
├─────────────────────────────────────────────────────────────┤
│                    ORM Layer                                │
│                 (SQLAlchemy Models)                         │
├─────────────────────────────────────────────────────────────┤
│                    Database Layer                            │
│                 (PostgreSQL + PostGIS)                      │
└─────────────────────────────────────────────────────────────┘
```

## Core Tables

### 1. Users & Authentication

#### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
```

#### User Roles Table

```sql
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, role)
);

-- Indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
```

### 2. Parks Management

#### Parks Table

```sql
CREATE TABLE parks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    area_hectares DECIMAL(10,2),
    coordinates GEOMETRY(POINT, 4326), -- PostGIS geometry
    established_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_parks_name ON parks(name);
CREATE INDEX idx_parks_status ON parks(status);
CREATE INDEX idx_parks_coordinates ON parks USING GIST(coordinates);
CREATE INDEX idx_parks_created_by ON parks(created_by);
```

#### Park Zones Table

```sql
CREATE TABLE park_zones (
    id SERIAL PRIMARY KEY,
    park_id INTEGER NOT NULL REFERENCES parks(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    zone_type VARCHAR(100), -- e.g., 'conservation', 'recreation', 'research'
    area_hectares DECIMAL(10,2),
    coordinates GEOMETRY(POLYGON, 4326), -- PostGIS polygon
    access_level VARCHAR(50) DEFAULT 'public',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_park_zones_park_id ON park_zones(park_id);
CREATE INDEX idx_park_zones_type ON park_zones(zone_type);
CREATE INDEX idx_park_zones_coordinates ON park_zones USING GIST(coordinates);
```

### 3. Biodiversity Data

#### Flora Table

```sql
CREATE TABLE flora (
    id SERIAL PRIMARY KEY,
    park_id INTEGER NOT NULL REFERENCES parks(id) ON DELETE CASCADE,
    common_name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    family VARCHAR(255),
    genus VARCHAR(255),
    species VARCHAR(255),
    description TEXT,
    habitat TEXT,
    conservation_status VARCHAR(100), -- e.g., 'endangered', 'vulnerable'
    flowering_season VARCHAR(100),
    coordinates GEOMETRY(POINT, 4326),
    discovered_date DATE,
    discovered_by INTEGER REFERENCES users(id),
    verified BOOLEAN DEFAULT FALSE,
    verified_by INTEGER REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_flora_park_id ON flora(park_id);
CREATE INDEX idx_flora_scientific_name ON flora(scientific_name);
CREATE INDEX idx_flora_family ON flora(family);
CREATE INDEX idx_flora_conservation_status ON flora(conservation_status);
CREATE INDEX idx_flora_coordinates ON flora USING GIST(coordinates);
CREATE INDEX idx_flora_verified ON flora(verified);
```

#### Fauna Table

```sql
CREATE TABLE fauna (
    id SERIAL PRIMARY KEY,
    park_id INTEGER NOT NULL REFERENCES parks(id) ON DELETE CASCADE,
    common_name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    family VARCHAR(255),
    genus VARCHAR(255),
    species VARCHAR(255),
    description TEXT,
    habitat TEXT,
    conservation_status VARCHAR(100),
    diet_type VARCHAR(100), -- e.g., 'herbivore', 'carnivore', 'omnivore'
    activity_pattern VARCHAR(100), -- e.g., 'nocturnal', 'diurnal'
    coordinates GEOMETRY(POINT, 4326),
    discovered_date DATE,
    discovered_by INTEGER REFERENCES users(id),
    verified BOOLEAN DEFAULT FALSE,
    verified_by INTEGER REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_fauna_park_id ON fauna(park_id);
CREATE INDEX idx_fauna_scientific_name ON fauna(scientific_name);
CREATE INDEX idx_fauna_family ON fauna(family);
CREATE INDEX idx_fauna_conservation_status ON fauna(conservation_status);
CREATE INDEX idx_fauna_coordinates ON fauna USING GIST(coordinates);
CREATE INDEX idx_fauna_verified ON fauna(verified);
```

### 4. Media & Files

#### Media Files Table

```sql
CREATE TABLE media_files (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_type VARCHAR(50), -- e.g., 'image', 'document', 'video'
    uploaded_by INTEGER REFERENCES users(id),
    related_table VARCHAR(50), -- e.g., 'parks', 'flora', 'fauna'
    related_id INTEGER,
    description TEXT,
    tags TEXT[], -- Array of tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_media_files_uploaded_by ON media_files(uploaded_by);
CREATE INDEX idx_media_files_related ON media_files(related_table, related_id);
CREATE INDEX idx_media_files_type ON media_files(file_type);
CREATE INDEX idx_media_files_tags ON media_files USING GIN(tags);
```

### 5. Activities & Monitoring

#### Activities Table

```sql
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    park_id INTEGER NOT NULL REFERENCES parks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    activity_type VARCHAR(100), -- e.g., 'research', 'conservation', 'education'
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'planned', -- e.g., 'planned', 'ongoing', 'completed'
    assigned_to INTEGER REFERENCES users(id),
    created_by INTEGER REFERENCES users(id),
    priority VARCHAR(50) DEFAULT 'medium', -- e.g., 'low', 'medium', 'high'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_activities_park_id ON activities(park_id);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_assigned_to ON activities(assigned_to);
CREATE INDEX idx_activities_dates ON activities(start_date, end_date);
```

#### Monitoring Data Table

```sql
CREATE TABLE monitoring_data (
    id SERIAL PRIMARY KEY,
    park_id INTEGER NOT NULL REFERENCES parks(id) ON DELETE CASCADE,
    monitoring_type VARCHAR(100) NOT NULL, -- e.g., 'temperature', 'humidity', 'species_count'
    value DECIMAL(15,6),
    unit VARCHAR(50),
    coordinates GEOMETRY(POINT, 4326),
    recorded_by INTEGER REFERENCES users(id),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    weather_conditions VARCHAR(255),
    equipment_used VARCHAR(255)
);

-- Indexes
CREATE INDEX idx_monitoring_park_id ON monitoring_data(park_id);
CREATE INDEX idx_monitoring_type ON monitoring_data(monitoring_type);
CREATE INDEX idx_monitoring_recorded_at ON monitoring_data(recorded_at);
CREATE INDEX idx_monitoring_coordinates ON monitoring_data USING GIST(coordinates);
```

### 6. Notifications & Announcements

#### Announcements Table

```sql
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    announcement_type VARCHAR(100), -- e.g., 'general', 'emergency', 'maintenance'
    priority VARCHAR(50) DEFAULT 'normal', -- e.g., 'low', 'normal', 'high', 'urgent'
    target_audience VARCHAR(100), -- e.g., 'all', 'admins', 'regional_admins'
    park_id INTEGER REFERENCES parks(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_announcements_type ON announcements(announcement_type);
CREATE INDEX idx_announcements_priority ON announcements(priority);
CREATE INDEX idx_announcements_active ON announcements(is_active);
CREATE INDEX idx_announcements_published ON announcements(published_at);
CREATE INDEX idx_announcements_park_id ON announcements(park_id);
```

## Relationships & Constraints

### Foreign Key Relationships

```sql
-- Users and Roles
ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_user_id
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Parks and related entities
ALTER TABLE park_zones ADD CONSTRAINT fk_park_zones_park_id
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE;

ALTER TABLE flora ADD CONSTRAINT fk_flora_park_id
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE;

ALTER TABLE fauna ADD CONSTRAINT fk_fauna_park_id
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE;

ALTER TABLE activities ADD CONSTRAINT fk_activities_park_id
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE;

ALTER TABLE monitoring_data ADD CONSTRAINT fk_monitoring_park_id
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE;

ALTER TABLE announcements ADD CONSTRAINT fk_announcements_park_id
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE;

-- User references
ALTER TABLE parks ADD CONSTRAINT fk_parks_created_by
    FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE flora ADD CONSTRAINT fk_flora_discovered_by
    FOREIGN KEY (discovered_by) REFERENCES users(id);

ALTER TABLE fauna ADD CONSTRAINT fk_fauna_discovered_by
    FOREIGN KEY (discovered_by) REFERENCES users(id);

ALTER TABLE media_files ADD CONSTRAINT fk_media_uploaded_by
    FOREIGN KEY (uploaded_by) REFERENCES users(id);

ALTER TABLE activities ADD CONSTRAINT fk_activities_assigned_to
    FOREIGN KEY (assigned_to) REFERENCES users(id);

ALTER TABLE activities ADD CONSTRAINT fk_activities_created_by
    FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE monitoring_data ADD CONSTRAINT fk_monitoring_recorded_by
    FOREIGN KEY (recorded_by) REFERENCES users(id);

ALTER TABLE announcements ADD CONSTRAINT fk_announcements_created_by
    FOREIGN KEY (created_by) REFERENCES users(id);
```

### Check Constraints

```sql
-- Area constraints
ALTER TABLE parks ADD CONSTRAINT chk_parks_area_positive
    CHECK (area_hectares > 0);

ALTER TABLE park_zones ADD CONSTRAINT chk_zones_area_positive
    CHECK (area_hectares > 0);

-- Date constraints
ALTER TABLE activities ADD CONSTRAINT chk_activities_dates
    CHECK (end_date IS NULL OR end_date >= start_date);

ALTER TABLE announcements ADD CONSTRAINT chk_announcements_dates
    CHECK (expires_at IS NULL OR expires_at >= published_at);

-- Status constraints
ALTER TABLE parks ADD CONSTRAINT chk_parks_status
    CHECK (status IN ('active', 'inactive', 'maintenance'));

ALTER TABLE activities ADD CONSTRAINT chk_activities_status
    CHECK (status IN ('planned', 'ongoing', 'completed', 'cancelled'));

ALTER TABLE activities ADD CONSTRAINT chk_activities_priority
    CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- User constraints
ALTER TABLE users ADD CONSTRAINT chk_users_email_format
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE users ADD CONSTRAINT chk_users_username_format
    CHECK (username ~* '^[a-zA-Z0-9_]{3,50}$');
```

## PostGIS Spatial Features

### Spatial Indexes

```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Spatial indexes for better performance
CREATE INDEX idx_parks_coordinates_gist ON parks USING GIST(coordinates);
CREATE INDEX idx_park_zones_coordinates_gist ON park_zones USING GIST(coordinates);
CREATE INDEX idx_flora_coordinates_gist ON flora USING GIST(coordinates);
CREATE INDEX idx_fauna_coordinates_gist ON fauna USING GIST(coordinates);
CREATE INDEX idx_monitoring_coordinates_gist ON monitoring_data USING GIST(coordinates);
```

### Spatial Functions

```sql
-- Function to find parks within radius
CREATE OR REPLACE FUNCTION find_parks_within_radius(
    center_lat DECIMAL,
    center_lng DECIMAL,
    radius_km INTEGER
) RETURNS TABLE (
    park_id INTEGER,
    park_name VARCHAR,
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        ST_Distance(
            p.coordinates,
            ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)
        ) / 1000 as distance_km
    FROM parks p
    WHERE ST_DWithin(
        p.coordinates,
        ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326),
        radius_km * 1000
    )
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate park area
CREATE OR REPLACE FUNCTION calculate_park_area(park_id INTEGER)
RETURNS DECIMAL AS $$
DECLARE
    total_area DECIMAL;
BEGIN
    SELECT COALESCE(SUM(area_hectares), 0)
    INTO total_area
    FROM park_zones
    WHERE park_id = $1;

    RETURN total_area;
END;
$$ LANGUAGE plpgsql;
```

## Database Views

### Useful Views

```sql
-- Parks with zone count and total area
CREATE VIEW parks_summary AS
SELECT
    p.id,
    p.name,
    p.location,
    p.area_hectares,
    COUNT(pz.id) as zone_count,
    COALESCE(SUM(pz.area_hectares), 0) as total_zone_area,
    COUNT(f.id) as flora_count,
    COUNT(fa.id) as fauna_count,
    p.created_at,
    p.updated_at
FROM parks p
LEFT JOIN park_zones pz ON p.id = pz.park_id
LEFT JOIN flora f ON p.id = f.park_id
LEFT JOIN fauna fa ON p.id = fa.park_id
GROUP BY p.id, p.name, p.location, p.area_hectares, p.created_at, p.updated_at;

-- User activity summary
CREATE VIEW user_activity_summary AS
SELECT
    u.id,
    u.username,
    u.full_name,
    COUNT(DISTINCT p.id) as parks_created,
    COUNT(DISTINCT f.id) as flora_discovered,
    COUNT(DISTINCT fa.id) as fauna_discovered,
    COUNT(DISTINCT a.id) as activities_assigned,
    u.created_at
FROM users u
LEFT JOIN parks p ON u.id = p.created_by
LEFT JOIN flora f ON u.id = f.discovered_by
LEFT JOIN fauna fa ON u.id = fa.discovered_by
LEFT JOIN activities a ON u.id = a.assigned_to
GROUP BY u.id, u.username, u.full_name, u.created_at;

-- Recent discoveries
CREATE VIEW recent_discoveries AS
SELECT
    'flora' as type,
    f.id,
    f.common_name,
    f.scientific_name,
    f.park_id,
    p.name as park_name,
    f.discovered_date,
    u.username as discovered_by,
    f.created_at
FROM flora f
JOIN parks p ON f.park_id = p.id
JOIN users u ON f.discovered_by = u.id
WHERE f.created_at >= CURRENT_DATE - INTERVAL '30 days'

UNION ALL

SELECT
    'fauna' as type,
    fa.id,
    fa.common_name,
    fa.scientific_name,
    fa.park_id,
    p.name as park_name,
    fa.discovered_date,
    u.username as discovered_by,
    fa.created_at
FROM fauna fa
JOIN parks p ON fa.park_id = p.id
JOIN users u ON fa.discovered_by = u.id
WHERE fa.created_at >= CURRENT_DATE - INTERVAL '30 days'

ORDER BY created_at DESC;
```

## Performance Optimization

### Indexing Strategy

```sql
-- Composite indexes for common queries
CREATE INDEX idx_parks_status_created ON parks(status, created_at);
CREATE INDEX idx_flora_park_verified ON flora(park_id, verified);
CREATE INDEX idx_fauna_park_verified ON fauna(park_id, verified);
CREATE INDEX idx_activities_park_status ON activities(park_id, status);
CREATE INDEX idx_monitoring_park_type_date ON monitoring_data(park_id, monitoring_type, recorded_at);

-- Partial indexes for active records
CREATE INDEX idx_active_parks ON parks(id) WHERE status = 'active';
CREATE INDEX idx_verified_flora ON flora(id) WHERE verified = true;
CREATE INDEX idx_verified_fauna ON fauna(id) WHERE verified = true;
CREATE INDEX idx_active_announcements ON announcements(id) WHERE is_active = true;
```

### Query Optimization

```sql
-- Analyze tables for query planning
ANALYZE parks;
ANALYZE flora;
ANALYZE fauna;
ANALYZE activities;
ANALYZE monitoring_data;

-- Update statistics
UPDATE pg_stat_user_tables SET n_tup_ins = 0, n_tup_upd = 0, n_tup_del = 0;
```

## Backup & Maintenance

### Backup Strategy

```sql
-- Create backup script
-- pg_dump -h localhost -U kehati_user -d kehati_db > backup_$(date +%Y%m%d).sql

-- Restore from backup
-- psql -h localhost -U kehati_user -d kehati_db < backup_20231027.sql
```

### Maintenance Tasks

```sql
-- Vacuum and analyze tables
VACUUM ANALYZE parks;
VACUUM ANALYZE flora;
VACUUM ANALYZE fauna;
VACUUM ANALYZE activities;

-- Reindex spatial indexes
REINDEX INDEX idx_parks_coordinates_gist;
REINDEX INDEX idx_flora_coordinates_gist;
REINDEX INDEX idx_fauna_coordinates_gist;
```

## Migration Management

### Alembic Migrations

```python
# Example migration file
"""Add spatial indexes

Revision ID: 001_add_spatial_indexes
Revises:
Create Date: 2023-10-27 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '001_add_spatial_indexes'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Add spatial indexes
    op.execute("CREATE INDEX IF NOT EXISTS idx_parks_coordinates_gist ON parks USING GIST(coordinates);")
    op.execute("CREATE INDEX IF NOT EXISTS idx_flora_coordinates_gist ON flora USING GIST(coordinates);")
    op.execute("CREATE INDEX IF NOT EXISTS idx_fauna_coordinates_gist ON fauna USING GIST(coordinates);")

def downgrade():
    # Remove spatial indexes
    op.execute("DROP INDEX IF EXISTS idx_parks_coordinates_gist;")
    op.execute("DROP INDEX IF EXISTS idx_flora_coordinates_gist;")
    op.execute("DROP INDEX IF EXISTS idx_fauna_coordinates_gist;")
```

## Related Documentation

- [System Architecture Overview](overview.md)
- [Backend API Architecture](backend-api.md)
- [Frontend Application Architecture](frontend-app.md)
- [Development Workflow](../development/workflow.md)
- [Environment Configuration](../reference/environment-variables.md)
