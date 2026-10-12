-- ============================================================================
-- Migration: 001_create_college_master_dataset.sql
-- Description: Creates College and University Master tables, Affiliations,
--              Dataset Import Tracking, and extends user profiles.
-- Compatible with: PostgreSQL 14+, Supabase, SQLite 3.35+
-- ============================================================================

-- 1. Universities Master Table
CREATE TABLE IF NOT EXISTS universities (
    id VARCHAR(36) PRIMARY KEY,
    aishe_code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    normalized_name VARCHAR(255) NOT NULL,
    university_type VARCHAR(100) DEFAULT 'State Public University',
    city VARCHAR(100) DEFAULT '',
    district VARCHAR(100) DEFAULT '',
    state VARCHAR(100) NOT NULL,
    official_website VARCHAR(255) DEFAULT '',
    recognition_status VARCHAR(50) DEFAULT 'UGC_RECOGNIZED',
    verification_status VARCHAR(50) DEFAULT 'verified',
    source_dataset VARCHAR(100) DEFAULT 'UGC_MASTER',
    source_record_id VARCHAR(100) DEFAULT '',
    last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_universities_normalized_name ON universities(normalized_name);
CREATE INDEX IF NOT EXISTS idx_universities_state ON universities(state);
CREATE INDEX IF NOT EXISTS idx_universities_district ON universities(district);

-- 2. Colleges Master Table
CREATE TABLE IF NOT EXISTS colleges (
    id VARCHAR(36) PRIMARY KEY,
    aishe_code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    normalized_name VARCHAR(255) NOT NULL,
    institution_type VARCHAR(100) DEFAULT 'Affiliated College',
    city VARCHAR(100) DEFAULT '',
    district VARCHAR(100) DEFAULT '',
    state VARCHAR(100) NOT NULL,
    country VARCHAR(50) DEFAULT 'India',
    postal_code VARCHAR(20) DEFAULT '',
    official_website VARCHAR(255) DEFAULT '',
    official_domain VARCHAR(100) DEFAULT '',
    institution_status VARCHAR(50) DEFAULT 'Active',
    verification_status VARCHAR(50) DEFAULT 'verified',
    source_dataset VARCHAR(100) DEFAULT 'AISHE_MASTER',
    source_record_id VARCHAR(100) DEFAULT '',
    last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_colleges_normalized_name ON colleges(normalized_name);
CREATE INDEX IF NOT EXISTS idx_colleges_state ON colleges(state);
CREATE INDEX IF NOT EXISTS idx_colleges_district ON colleges(district);
CREATE INDEX IF NOT EXISTS idx_colleges_aishe ON colleges(aishe_code);

-- 3. College-University Affiliations Table
CREATE TABLE IF NOT EXISTS college_university_affiliations (
    id VARCHAR(36) PRIMARY KEY,
    college_id VARCHAR(36) NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    university_id VARCHAR(36) NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) DEFAULT 'affiliated',
    verification_status VARCHAR(50) DEFAULT 'unverified',
    valid_from VARCHAR(50),
    valid_until VARCHAR(50),
    evidence_url VARCHAR(500),
    evidence_source_type VARCHAR(100),
    evidence_checked_at TIMESTAMP WITH TIME ZONE,
    confidence_score FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_college_univ_rel UNIQUE(college_id, university_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_affiliations_college ON college_university_affiliations(college_id);
CREATE INDEX IF NOT EXISTS idx_affiliations_university ON college_university_affiliations(university_id);
CREATE INDEX IF NOT EXISTS idx_affiliations_status ON college_university_affiliations(verification_status);

-- 4. Dataset Import Tracking Table
CREATE TABLE IF NOT EXISTS dataset_imports (
    id VARCHAR(36) PRIMARY KEY,
    dataset_name VARCHAR(255) NOT NULL,
    source VARCHAR(255) NOT NULL,
    version VARCHAR(100) DEFAULT '',
    licence_info VARCHAR(255) DEFAULT 'Open Government Data License (OGDL) India',
    status VARCHAR(50) DEFAULT 'pending',
    records_inserted INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_skipped INTEGER DEFAULT 0,
    records_duplicated INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_summary JSON DEFAULT '[]',
    imported_by_user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Student Missing College Submissions Table
CREATE TABLE IF NOT EXISTS missing_college_submissions (
    id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    submitted_name VARCHAR(255) NOT NULL,
    city VARCHAR(100) DEFAULT '',
    district VARCHAR(100) DEFAULT '',
    state VARCHAR(100) NOT NULL,
    claimed_university VARCHAR(255) DEFAULT '',
    official_website VARCHAR(255) DEFAULT '',
    status VARCHAR(50) DEFAULT 'pending_review',
    reviewed_by_user_id INTEGER REFERENCES users(id),
    review_notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_missing_submissions_user ON missing_college_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_missing_submissions_status ON missing_college_submissions(status);

-- 6. Profile Extensions
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS college_id VARCHAR(36) REFERENCES colleges(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS university_id VARCHAR(36) REFERENCES universities(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS course VARCHAR(100) DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS branch VARCHAR(150) DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS academic_year VARCHAR(50) DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS semester VARCHAR(50) DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS district VARCHAR(100) DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT '';


-- Row Level Security (RLS) for Supabase:
-- Enable RLS on master tables
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_university_affiliations ENABLE ROW LEVEL SECURITY;

-- Allow public read access to master college and university tables
CREATE POLICY "Public read on universities" ON universities FOR SELECT USING (true);
CREATE POLICY "Public read on colleges" ON colleges FOR SELECT USING (true);
CREATE POLICY "Public read on affiliations" ON college_university_affiliations FOR SELECT USING (true);

-- Enable RLS on user submissions & dataset tracking
ALTER TABLE missing_college_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_imports ENABLE ROW LEVEL SECURITY;

-- Students can insert and view their own missing college submissions
CREATE POLICY "Students can view own missing submissions" ON missing_college_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can submit missing colleges" ON missing_college_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Restrict dataset_imports to administrators & service_role
CREATE POLICY "Admin access on dataset_imports" ON dataset_imports FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'service_role');

