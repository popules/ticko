-- Migration: Add Pro subscription and AI usage tracking fields
-- Run this in Supabase SQL Editor

-- Add Pro subscription expiration timestamp
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMPTZ;

-- Add AI usage tracking columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS ai_usage_count INT DEFAULT 0;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS ai_usage_date DATE;

-- Add watchlist_limit column (for future customization per tier)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS watchlist_limit INT DEFAULT 10;

-- Update existing Pro users to have a far-future expiration (if any)
UPDATE profiles 
SET pro_expires_at = '2099-12-31'::TIMESTAMPTZ 
WHERE is_pro = true AND pro_expires_at IS NULL;

-- Comment on columns for documentation
COMMENT ON COLUMN profiles.pro_expires_at IS 'When the Pro subscription expires. NULL = never subscribed.';
COMMENT ON COLUMN profiles.ai_usage_count IS 'Daily AI analysis usage count for free tier metering.';
COMMENT ON COLUMN profiles.ai_usage_date IS 'Date of last AI usage count reset. Resets daily.';
COMMENT ON COLUMN profiles.watchlist_limit IS 'Maximum watchlist items. Free=10, Pro=50.';

-- Create index for efficient Pro status checks
CREATE INDEX IF NOT EXISTS idx_profiles_pro_status ON profiles (is_pro, pro_expires_at);
