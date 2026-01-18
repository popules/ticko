-- ============================================
-- FAIR PLAY MIGRATION
-- 30-minute holding period for Paper Trading
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add lock timestamp to portfolio
ALTER TABLE portfolio
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

-- Comment for documentation
COMMENT ON COLUMN portfolio.locked_until IS 'Timestamp when the position can be sold (30 min after purchase for Fair Play)';

-- Index for efficient lock checks (optional but clean)
CREATE INDEX IF NOT EXISTS idx_portfolio_locked_until 
ON portfolio (locked_until) 
WHERE locked_until IS NOT NULL;
