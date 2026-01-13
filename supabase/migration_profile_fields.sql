-- ============================================
-- MIGRATION: Add bio and location to profiles
-- Run this in Supabase SQL Editor
-- ============================================

-- Add bio column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add location column  
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;

-- Also add display_name for future use
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';
