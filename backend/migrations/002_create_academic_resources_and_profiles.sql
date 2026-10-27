-- ============================================================================
-- Migration: 002_create_academic_resources_and_profiles.sql
-- Description: Extends student profiles and subjects for personalized discovery;
--              creates academic_resources catalog table.
-- Compatible with: PostgreSQL 14+, Supabase, SQLite 3.35+
-- ============================================================================

-- 1. Extend Profiles Table for Academic Personalization
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS curriculum VARCHAR(100) DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS learning_preferences JSON DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS academic_goals JSON DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subjects_list JSON DEFAULT '[]';

-- 2. Extend Subjects Table with Academic Details
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS semester VARCHAR(50) DEFAULT '';
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 3;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS proficiency VARCHAR(50) DEFAULT 'Intermediate';
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS needs_improvement BOOLEAN DEFAULT FALSE;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS topics JSON DEFAULT '[]';

-- 3. Academic Resources Catalog Table
CREATE TABLE IF NOT EXISTS academic_resources (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    subject_code VARCHAR(50) NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    topic VARCHAR(255) DEFAULT '',
    syllabus_unit VARCHAR(100) DEFAULT '',
    resource_type VARCHAR(50) NOT NULL,
    source_category VARCHAR(50) DEFAULT 'curated',
    provenance VARCHAR(100) DEFAULT 'Curated Academic',
    institution_or_publisher VARCHAR(255) DEFAULT '',
    url VARCHAR(500) NOT NULL,
    language VARCHAR(50) DEFAULT 'English',
    semester VARCHAR(50) DEFAULT '',
    curriculum VARCHAR(100) DEFAULT 'All',
    is_verified BOOLEAN DEFAULT TRUE,
    rating FLOAT DEFAULT 4.8,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_academic_resources_subject ON academic_resources(subject_code);
CREATE INDEX IF NOT EXISTS idx_academic_resources_type ON academic_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_academic_resources_category ON academic_resources(source_category);
CREATE INDEX IF NOT EXISTS idx_academic_resources_semester ON academic_resources(semester);
