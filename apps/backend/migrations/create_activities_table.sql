-- Migration: Create activities table
-- Created: 2024-10-24
-- Description: Create activities table for park conservation activities

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    park_id INTEGER NOT NULL REFERENCES parks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    activity_date DATE NOT NULL,
    location VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    created_by INTEGER REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activities_park_id ON activities(park_id);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_activity_date ON activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_activities_created_by ON activities(created_by);

-- Add comments for documentation
COMMENT ON TABLE activities IS 'Conservation activities conducted in parks';
COMMENT ON COLUMN activities.park_id IS 'ID of the park where activity is conducted';
COMMENT ON COLUMN activities.title IS 'Title or name of the conservation activity';
COMMENT ON COLUMN activities.description IS 'Detailed description of the activity';
COMMENT ON COLUMN activities.activity_date IS 'Date when the activity is scheduled to be conducted';
COMMENT ON COLUMN activities.location IS 'Location or coordinates where activity takes place';
COMMENT ON COLUMN activities.status IS 'Workflow status: draft, in_review, approved, rejected';
COMMENT ON COLUMN activities.created_by IS 'User who created the activity';
COMMENT ON COLUMN activities.approved_by IS 'User who approved the activity';
