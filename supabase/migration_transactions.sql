-- =====================================================
-- Paper Trading: Transactions & Snapshots
-- Run this in Supabase SQL Editor
-- =====================================================

-- Transactions table for buy/sell history
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  shares INTEGER NOT NULL,
  price DECIMAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  total_sek DECIMAL NOT NULL,
  realized_pnl DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio snapshots for graph (daily values)
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_value DECIMAL NOT NULL,
  cash_balance DECIMAL NOT NULL,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(user_id, snapshot_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_user_date ON portfolio_snapshots(user_id, snapshot_date DESC);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own snapshots"
  ON portfolio_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage snapshots"
  ON portfolio_snapshots FOR ALL
  USING (true);
