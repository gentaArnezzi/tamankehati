-- Fix articles table schema to match model
-- Date: 2024-10-25

-- Add missing columns
ALTER TABLE articles ADD COLUMN IF NOT EXISTS summary VARCHAR(500);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS region_code VARCHAR(10);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add workflow columns
ALTER TABLE articles ADD COLUMN IF NOT EXISTS submitted_by INTEGER;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS approved_by INTEGER;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS rejected_by INTEGER;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(500);

-- Drop columns that are not in model
ALTER TABLE articles DROP COLUMN IF EXISTS park_id;
ALTER TABLE articles DROP COLUMN IF EXISTS tags;
ALTER TABLE articles DROP COLUMN IF EXISTS created_by;

-- Rename if needed (excerpt -> summary already done above)
-- Update any existing excerpt data if column exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='articles' AND column_name='excerpt') THEN
        UPDATE articles SET summary = excerpt WHERE summary IS NULL AND excerpt IS NOT NULL;
        ALTER TABLE articles DROP COLUMN IF EXISTS excerpt;
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_articles_deleted_at ON articles(deleted_at);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_region_code ON articles(region_code);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);

COMMENT ON COLUMN articles.summary IS 'Article summary/excerpt';
COMMENT ON COLUMN articles.author_id IS 'User who created the article';
COMMENT ON COLUMN articles.region_code IS 'Region code for regional filtering';
COMMENT ON COLUMN articles.deleted_at IS 'Soft delete timestamp';

