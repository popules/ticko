-- =====================================================
-- SECURITY AUDIT: LOCK DOWN TABLES
-- Revoke INSERT/UPDATE/DELETE from 'authenticated' role
-- for sensitive tables. Writes must go through API.
-- =====================================================

-- 1. Portfolio
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Users can manage own portfolio" ON portfolio;
DROP POLICY IF EXISTS "Users can view own portfolio" ON portfolio; -- Drop this too to avoid conflicts

-- Create stricter policies
CREATE POLICY "Users can view own portfolio"
    ON portfolio FOR SELECT
    USING (auth.uid() = user_id);

-- Explicitly DENY insert/update/delete for authenticated (by not having policies for them)
-- The only way to write is via Service Role (API Routes)

-- 2. Transactions
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions; -- Recreating just to be sure

-- Create stricter policies
CREATE POLICY "Users can view own transactions"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);

-- 3. Watchlists
-- Watchlists are less sensitive, but let's check what we had.
-- "Users can manage own watchlist" - Keeping this is probably fine as it's user preference.
-- But if we want to be strict, we could restrict it too. For now, leave it.

-- 4. Alerts (Just to be safe if it exists)
-- CREATE TABLE IF NOT EXISTS alerts ...
-- If alerts exist, we might want to verify RLS there too.
