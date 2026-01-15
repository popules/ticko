-- ============================================
-- ACHIEVEMENTS SYSTEM MIGRATION (v2)
-- Run this in your Supabase SQL Editor
-- ============================================

-- First, drop the old table if it exists with old schema
DROP TABLE IF EXISTS user_achievements CASCADE;

-- Create user achievements table with correct schema
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    achievement_key TEXT NOT NULL,
    awarded_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_key)
);

-- Enable RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ BEGIN
    CREATE POLICY "User achievements are viewable by everyone" ON user_achievements 
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert own achievements" ON user_achievements 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_key ON user_achievements(achievement_key);

-- Add columns to profiles for prediction tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS correct_predictions INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_predictions INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS prediction_streak INTEGER DEFAULT 0;

-- Function to increment reputation (used by prediction verification)
CREATE OR REPLACE FUNCTION increment_reputation(user_id UUID, amount INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE profiles 
    SET reputation_score = GREATEST(0, COALESCE(reputation_score, 0) + amount),
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update prediction stats
CREATE OR REPLACE FUNCTION update_prediction_stats(
    p_user_id UUID, 
    is_correct BOOLEAN
)
RETURNS void AS $$
BEGIN
    UPDATE profiles 
    SET 
        total_predictions = COALESCE(total_predictions, 0) + 1,
        correct_predictions = CASE 
            WHEN is_correct THEN COALESCE(correct_predictions, 0) + 1 
            ELSE COALESCE(correct_predictions, 0) 
        END,
        prediction_streak = CASE 
            WHEN is_correct THEN COALESCE(prediction_streak, 0) + 1 
            ELSE 0 
        END,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add realtime for achievements notifications
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'user_achievements'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE user_achievements;
    END IF;
END $$;
