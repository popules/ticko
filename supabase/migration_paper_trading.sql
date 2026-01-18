-- Add paper trading reset fields to profiles
-- Run this in Supabase SQL Editor

-- Add reset tracking columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS paper_reset_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS paper_last_reset TIMESTAMPTZ;

-- Add paper trading stats for leaderboard
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS paper_total_pnl DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS paper_best_trade DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS paper_worst_trade DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS paper_win_rate DECIMAL(5, 2) DEFAULT 0;

-- Create index for paper trading leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_paper_pnl 
ON profiles (paper_total_pnl DESC NULLS LAST);

-- Comment for documentation
COMMENT ON COLUMN profiles.paper_reset_count IS 'Number of times user has reset their paper trading portfolio';
COMMENT ON COLUMN profiles.paper_last_reset IS 'Timestamp of last portfolio reset';
COMMENT ON COLUMN profiles.paper_total_pnl IS 'Total profit/loss from paper trades (in SEK)';
