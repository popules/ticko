-- Portfolio table for tracking holdings
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT,
  shares DECIMAL NOT NULL,
  buy_price DECIMAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

-- Enable RLS
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;

-- Users can only see their own portfolio
CREATE POLICY "Users can view their own portfolio"
  ON portfolio FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can add to their portfolio
CREATE POLICY "Users can add to portfolio"
  ON portfolio FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their holdings
CREATE POLICY "Users can update portfolio"
  ON portfolio FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can remove from portfolio
CREATE POLICY "Users can delete from portfolio"
  ON portfolio FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_portfolio_user_id ON portfolio(user_id);
