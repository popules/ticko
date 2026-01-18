-- ============================================
-- PRO SUBSCRIPTION & SEASONS MIGRATION
-- Run this in your Supabase SQL Editor
-- ============================================

-- Pro subscription fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMPTZ;

-- Season tracking fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS paper_season_pnl DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS paper_season_start TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS paper_season_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS paper_all_time_best_season DECIMAL(12, 2) DEFAULT 0;

-- Season history table for tracking past winners
CREATE TABLE IF NOT EXISTS paper_seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season_number INTEGER NOT NULL,
    winner_id UUID REFERENCES profiles(id),
    winner_username TEXT,
    winner_pnl DECIMAL(12, 2),
    participants_count INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(season_number)
);

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_season_pnl 
ON profiles (paper_season_pnl DESC NULLS LAST);

-- Comments for documentation
COMMENT ON COLUMN profiles.is_pro IS 'Whether user has active Pro subscription';
COMMENT ON COLUMN profiles.pro_expires_at IS 'When Pro subscription expires';
COMMENT ON COLUMN profiles.paper_season_pnl IS 'Current season profit/loss (SEK)';
COMMENT ON COLUMN profiles.paper_season_number IS 'Current season number (increments weekly)';
COMMENT ON COLUMN profiles.paper_all_time_best_season IS 'Best single-season P&L ever achieved';
