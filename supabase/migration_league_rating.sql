-- Migration: Add MMR-style league rating system
-- Run this in Supabase SQL Editor

-- Add league rating column (hidden MMR)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS league_rating INT DEFAULT 1000;

-- Add last rating update timestamp
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS league_rating_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for fast league leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_league_rating ON profiles(league_rating DESC);

-- Update existing users to have starting rating
UPDATE profiles
SET league_rating = 1000
WHERE league_rating IS NULL;

-- Comment for documentation
COMMENT ON COLUMN profiles.league_rating IS 'MMR-style rating. 0-999=Bronze, 1000-1499=Silver, 1500-1999=Gold, 2000-2499=Platinum, 2500+=Diamond. Updates weekly based on P&L performance.';
COMMENT ON COLUMN profiles.league_rating_updated_at IS 'Last time league rating was recalculated (for weekly cadence).';
