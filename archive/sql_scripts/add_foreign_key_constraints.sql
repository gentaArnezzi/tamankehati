-- Migration: Add missing Foreign Key constraints and columns
-- Date: 2025-01-26
-- Author: Database Schema Audit
-- Purpose: Fix critical data integrity issues identified in schema analysis

BEGIN;

-- ============================================================================
-- 1. Add Foreign Key constraints to Articles
-- ============================================================================

ALTER TABLE articles 
  ADD CONSTRAINT fk_articles_submitted_by 
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE articles 
  ADD CONSTRAINT fk_articles_approved_by 
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE articles 
  ADD CONSTRAINT fk_articles_rejected_by 
  FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================================================
-- 2. Add Foreign Key constraints to Galleries & Remove region_code
-- ============================================================================

ALTER TABLE galleries 
  ADD CONSTRAINT fk_galleries_submitted_by 
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE galleries 
  ADD CONSTRAINT fk_galleries_approved_by 
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE galleries 
  ADD CONSTRAINT fk_galleries_rejected_by 
  FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL;

-- Change author_id constraint from CASCADE to SET NULL
ALTER TABLE galleries 
  DROP CONSTRAINT IF EXISTS galleries_author_id_fkey;
  
ALTER TABLE galleries 
  ADD CONSTRAINT fk_galleries_author_id 
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL;

-- Remove legacy region_code column
ALTER TABLE galleries 
  DROP COLUMN IF EXISTS region_code;

-- ============================================================================
-- 3. Add rejected_by column to Fauna (if not exists)
-- ============================================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='fauna' AND column_name='rejected_by'
    ) THEN
        ALTER TABLE fauna 
          ADD COLUMN rejected_by INTEGER NULL;
          
        ALTER TABLE fauna 
          ADD CONSTRAINT fk_fauna_rejected_by 
          FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- 4. Add rejected_by column to Activities (if not exists)
-- ============================================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='activities' AND column_name='rejected_by'
    ) THEN
        ALTER TABLE activities 
          ADD COLUMN rejected_by INTEGER NULL;
          
        ALTER TABLE activities 
          ADD CONSTRAINT fk_activities_rejected_by 
          FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- 5. Update existing FK constraints to add ON DELETE SET NULL
-- ============================================================================

-- Flora
ALTER TABLE flora 
  DROP CONSTRAINT IF EXISTS flora_submitted_by_fkey;
ALTER TABLE flora 
  ADD CONSTRAINT fk_flora_submitted_by 
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE flora 
  DROP CONSTRAINT IF EXISTS flora_approved_by_fkey;
ALTER TABLE flora 
  ADD CONSTRAINT fk_flora_approved_by 
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE flora 
  DROP CONSTRAINT IF EXISTS flora_rejected_by_fkey;
ALTER TABLE flora 
  ADD CONSTRAINT fk_flora_rejected_by 
  FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL;

-- Fauna
ALTER TABLE fauna 
  DROP CONSTRAINT IF EXISTS fauna_submitted_by_fkey;
ALTER TABLE fauna 
  ADD CONSTRAINT fk_fauna_submitted_by 
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE fauna 
  DROP CONSTRAINT IF EXISTS fauna_approved_by_fkey;
ALTER TABLE fauna 
  ADD CONSTRAINT fk_fauna_approved_by 
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Activities
ALTER TABLE activities 
  DROP CONSTRAINT IF EXISTS activities_submitted_by_fkey;
ALTER TABLE activities 
  ADD CONSTRAINT fk_activities_submitted_by 
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE activities 
  DROP CONSTRAINT IF EXISTS activities_approved_by_fkey;
ALTER TABLE activities 
  ADD CONSTRAINT fk_activities_approved_by 
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Announcements
ALTER TABLE announcements 
  DROP CONSTRAINT IF EXISTS announcements_submitted_by_fkey;
ALTER TABLE announcements 
  ADD CONSTRAINT fk_announcements_submitted_by 
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE announcements 
  DROP CONSTRAINT IF EXISTS announcements_approved_by_fkey;
ALTER TABLE announcements 
  ADD CONSTRAINT fk_announcements_approved_by 
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE announcements 
  DROP CONSTRAINT IF EXISTS announcements_rejected_by_fkey;
ALTER TABLE announcements 
  ADD CONSTRAINT fk_announcements_rejected_by 
  FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL;

-- News
ALTER TABLE news 
  DROP CONSTRAINT IF EXISTS news_submitted_by_fkey;
ALTER TABLE news 
  ADD CONSTRAINT fk_news_submitted_by 
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE news 
  DROP CONSTRAINT IF EXISTS news_approved_by_fkey;
ALTER TABLE news 
  ADD CONSTRAINT fk_news_approved_by 
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE news 
  DROP CONSTRAINT IF EXISTS news_rejected_by_fkey;
ALTER TABLE news 
  ADD CONSTRAINT fk_news_rejected_by 
  FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL;

COMMIT;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Verify all foreign keys are in place
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name = 'users'
  AND tc.table_name IN ('articles', 'galleries', 'flora', 'fauna', 'activities', 'announcements', 'news')
ORDER BY tc.table_name, kcu.column_name;

-- Expected output should show all workflow fields with ON DELETE SET NULL

