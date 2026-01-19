-- ============================================
-- PAID PORTFOLIO RESET MIGRATION
-- Tracks paid resets and enables archiving
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add paid reset count to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS paid_reset_count INTEGER DEFAULT 0;

-- Add archived flag to transactions for archiving instead of deleting
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Create reset transactions table for audit trail
CREATE TABLE IF NOT EXISTS reset_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_sek INTEGER NOT NULL DEFAULT 49,
    reset_type TEXT NOT NULL CHECK (reset_type IN ('paid', 'free')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create helper function to increment paid_reset_count
CREATE OR REPLACE FUNCTION increment_paid_reset()
RETURNS INTEGER AS $$
DECLARE
    current_count INTEGER;
BEGIN
    SELECT COALESCE(paid_reset_count, 0) + 1 INTO current_count
    FROM profiles
    WHERE id = auth.uid();
    RETURN current_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Index for efficient archived transaction queries
CREATE INDEX IF NOT EXISTS idx_transactions_archived
ON transactions (user_id, archived)
WHERE archived = true;

-- Index for reset transaction history
CREATE INDEX IF NOT EXISTS idx_reset_transactions_user
ON reset_transactions (user_id, created_at DESC);

-- RLS policies for reset_transactions
ALTER TABLE reset_transactions ENABLE ROW LEVEL SECURITY;

-- Users can read their own reset history
CREATE POLICY "Users can view own reset history"
ON reset_transactions FOR SELECT
USING (auth.uid() = user_id);

-- Only server (service role) can insert (via webhook)
CREATE POLICY "Service role can insert reset transactions"
ON reset_transactions FOR INSERT
WITH CHECK (true);

-- Comments
COMMENT ON COLUMN profiles.paid_reset_count IS 'Number of paid portfolio resets';
COMMENT ON COLUMN transactions.archived IS 'Whether transaction is archived from a reset';
COMMENT ON TABLE reset_transactions IS 'Audit log of portfolio resets (paid and free)';
