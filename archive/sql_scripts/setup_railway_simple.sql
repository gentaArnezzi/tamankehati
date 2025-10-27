-- =============================================================================
-- Railway Database Setup - Simple Version
-- Run this with: psql "postgresql://postgres:wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz@maglev.proxy.rlwy.net:26951/railway" -f setup_railway_simple.sql
-- =============================================================================

\echo '🚀 Starting Railway Database Setup...'
\echo ''

-- =============================================================================
-- 1. Create Extensions
-- =============================================================================

\echo '📦 Step 1: Creating Extensions...'

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

\echo '✅ Extensions created!'
\echo ''

-- =============================================================================
-- 2. Create Users Table
-- =============================================================================

\echo '📦 Step 2: Creating users table...'

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    region_code VARCHAR(10),
    wilayah VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

\echo '✅ Users table created!'
\echo ''

-- =============================================================================
-- 3. Create Regions Table
-- =============================================================================

\echo '📦 Step 3: Creating regions table...'

CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    timezone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

\echo '✅ Regions table created!'
\echo ''

-- =============================================================================
-- 4. Create Parks Table
-- =============================================================================

\echo '📦 Step 4: Creating parks table...'

CREATE TABLE IF NOT EXISTS parks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    region_id INTEGER REFERENCES regions(id),
    sk_penetapan VARCHAR(255),
    pengelola VARCHAR(255),
    tipe_ekoregion VARCHAR(100),
    area_ha NUMERIC(10, 2),
    description TEXT,
    kondisi_fisik TEXT,
    nilai_penting TEXT,
    sejarah TEXT,
    visi TEXT,
    misi TEXT,
    nilai_dasar TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

\echo '✅ Parks table created!'
\echo ''

-- =============================================================================
-- 5. Create Flora Table
-- =============================================================================

\echo '📦 Step 5: Creating flora table...'

CREATE TABLE IF NOT EXISTS flora (
    id SERIAL PRIMARY KEY,
    park_id INTEGER REFERENCES parks(id) ON DELETE CASCADE,
    common_name VARCHAR(255),
    scientific_name VARCHAR(255),
    family VARCHAR(100),
    genus VARCHAR(100),
    species VARCHAR(100),
    description TEXT,
    habitat TEXT,
    conservation_status VARCHAR(50),
    image_url VARCHAR(500),
    submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

\echo '✅ Flora table created!'
\echo ''

-- =============================================================================
-- 6. Create Fauna Table
-- =============================================================================

\echo '📦 Step 6: Creating fauna table...'

CREATE TABLE IF NOT EXISTS fauna (
    id SERIAL PRIMARY KEY,
    park_id INTEGER REFERENCES parks(id) ON DELETE CASCADE,
    common_name VARCHAR(255),
    scientific_name VARCHAR(255),
    family VARCHAR(100),
    genus VARCHAR(100),
    species VARCHAR(100),
    description TEXT,
    habitat TEXT,
    conservation_status VARCHAR(50),
    image_url VARCHAR(500),
    submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

\echo '✅ Fauna table created!'
\echo ''

-- =============================================================================
-- 7. Create Activities Table
-- =============================================================================

\echo '📦 Step 7: Creating activities table...'

CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    park_id INTEGER REFERENCES parks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    activity_type VARCHAR(50),
    activity_date DATE,
    image_url VARCHAR(500),
    submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

\echo '✅ Activities table created!'
\echo ''

-- =============================================================================
-- 8. Create Articles Table
-- =============================================================================

\echo '📦 Step 8: Creating articles table...'

CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    featured_image VARCHAR(500),
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'draft',
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

\echo '✅ Articles table created!'
\echo ''

-- =============================================================================
-- 9. Create Galleries Table
-- =============================================================================

\echo '📦 Step 9: Creating galleries table...'

CREATE TABLE IF NOT EXISTS galleries (
    id SERIAL PRIMARY KEY,
    park_id INTEGER REFERENCES parks(id) ON DELETE CASCADE,
    title VARCHAR(255),
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

\echo '✅ Galleries table created!'
\echo ''

-- =============================================================================
-- 10. Seed Initial Data
-- =============================================================================

\echo '📦 Step 10: Seeding initial data...'

-- Insert admin user (password: "password" hashed with bcrypt)
INSERT INTO users (email, hashed_password, full_name, role, region_code, wilayah, is_active)
VALUES 
    ('admin@kehati.org', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEkKC6', 'Administrator', 'super_admin', NULL, NULL, true),
    ('kaltim.admin@kehati.org', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEkKC6', 'Admin Kalimantan Timur', 'regional_admin', 'KALTIM', 'Kalimantan Timur', true),
    ('sumut.admin@kehati.org', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEkKC6', 'Admin Sumatera Utara', 'regional_admin', 'SUMUT', 'Sumatera Utara', true)
ON CONFLICT (email) DO NOTHING;

\echo '✅ Users seeded!'

-- Insert 38 Indonesian provinces
INSERT INTO regions (code, name, timezone, is_active) VALUES
-- Sumatera
('ACEH', 'Aceh', 'Asia/Jakarta', true),
('SUMUT', 'Sumatera Utara', 'Asia/Jakarta', true),
('SUMBAR', 'Sumatera Barat', 'Asia/Jakarta', true),
('RIAU', 'Riau', 'Asia/Jakarta', true),
('KEPRI', 'Kepulauan Riau', 'Asia/Jakarta', true),
('JAMBI', 'Jambi', 'Asia/Jakarta', true),
('SUMSEL', 'Sumatera Selatan', 'Asia/Jakarta', true),
('BENGKULU', 'Bengkulu', 'Asia/Jakarta', true),
('LAMPUNG', 'Lampung', 'Asia/Jakarta', true),
('BABEL', 'Bangka Belitung', 'Asia/Jakarta', true),
-- Jawa
('DKI', 'DKI Jakarta', 'Asia/Jakarta', true),
('JABAR', 'Jawa Barat', 'Asia/Jakarta', true),
('BANTEN', 'Banten', 'Asia/Jakarta', true),
('JATENG', 'Jawa Tengah', 'Asia/Jakarta', true),
('YOGYA', 'DI Yogyakarta', 'Asia/Jakarta', true),
('JATIM', 'Jawa Timur', 'Asia/Jakarta', true),
-- Kalimantan
('KALBAR', 'Kalimantan Barat', 'Asia/Pontianak', true),
('KALTENG', 'Kalimantan Tengah', 'Asia/Pontianak', true),
('KALSEL', 'Kalimantan Selatan', 'Asia/Makassar', true),
('KALTIM', 'Kalimantan Timur', 'Asia/Makassar', true),
('KALTARA', 'Kalimantan Utara', 'Asia/Makassar', true),
-- Sulawesi
('SULUT', 'Sulawesi Utara', 'Asia/Makassar', true),
('SULTENG', 'Sulawesi Tengah', 'Asia/Makassar', true),
('SULSEL', 'Sulawesi Selatan', 'Asia/Makassar', true),
('SULTRA', 'Sulawesi Tenggara', 'Asia/Makassar', true),
('GORONTALO', 'Gorontalo', 'Asia/Makassar', true),
('SULBAR', 'Sulawesi Barat', 'Asia/Makassar', true),
-- Bali & Nusa Tenggara
('BALI', 'Bali', 'Asia/Makassar', true),
('NTB', 'Nusa Tenggara Barat', 'Asia/Makassar', true),
('NTT', 'Nusa Tenggara Timur', 'Asia/Makassar', true),
-- Maluku
('MALUKU', 'Maluku', 'Asia/Jayapura', true),
('MALUT', 'Maluku Utara', 'Asia/Jayapura', true),
-- Papua
('PAPUA', 'Papua', 'Asia/Jayapura', true),
('PAPBAR', 'Papua Barat', 'Asia/Jayapura', true),
('PAPTENG', 'Papua Tengah', 'Asia/Jayapura', true),
('PAPSEL', 'Papua Selatan', 'Asia/Jayapura', true),
('PAPPEG', 'Papua Pegunungan', 'Asia/Jayapura', true),
('PAPBARDAYA', 'Papua Barat Daya', 'Asia/Jayapura', true)
ON CONFLICT (code) DO NOTHING;

\echo '✅ Regions seeded (38 provinces)!'
\echo ''

-- =============================================================================
-- 11. Verification
-- =============================================================================

\echo '📦 Step 11: Verifying database...'
\echo ''

\echo 'Users:'
SELECT id, email, role, region_code FROM users;

\echo ''
\echo 'Regions (first 10):'
SELECT id, code, name FROM regions ORDER BY id LIMIT 10;

\echo ''
\echo 'Tables created:'
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

\echo ''
\echo '🎉 Railway Database Setup Complete!'
\echo ''
\echo '📝 Login Credentials:'
\echo '   Admin: admin@kehati.org / password'
\echo '   KALTIM: kaltim.admin@kehati.org / password'
\echo '   SUMUT: sumut.admin@kehati.org / password'
\echo ''

