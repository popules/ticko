-- ============================================
-- WIN STREAKS MIGRATION
-- Track consecutive profitable trades
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add streak tracking to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS paper_win_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS paper_best_streak INTEGER DEFAULT 0;

-- Comments for documentation
COMMENT ON COLUMN profiles.paper_win_streak IS 'Current consecutive profitable paper trades';
COMMENT ON COLUMN profiles.paper_best_streak IS 'Best ever win streak (for achievements)';
