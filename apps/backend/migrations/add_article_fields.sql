-- Add missing fields to articles table
-- Date: 2024-10-25

-- Add slug column
ALTER TABLE articles ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Add category column
ALTER TABLE articles ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Add featured_image column
ALTER TABLE articles ADD COLUMN IF NOT EXISTS featured_image VARCHAR(500);

-- Add index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);

-- Add index on category
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);

COMMENT ON COLUMN articles.slug IS 'URL-friendly version of title';
COMMENT ON COLUMN articles.category IS 'Article category (Konservasi, Penelitian, etc)';
COMMENT ON COLUMN articles.featured_image IS 'URL to featured/cover image';

