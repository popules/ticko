-- ============================================
-- SEASONS & HISTORICAL PORTFOLIOS MIGRATION
-- Growth Phase 2: Retention
-- ============================================

-- 1. Create Seasons Table
CREATE TABLE IF NOT EXISTS seasons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL, -- e.g. "Säsong 1: Genesis"
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ, -- Nuvarande säsong har NULL end_date tills den avslutas? Eller satt datum.
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Historical Portfolios (Snapshot from previous seasons)
CREATE TABLE IF NOT EXISTS historical_portfolios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    final_value NUMERIC NOT NULL, -- Cash + Stock Value
    final_rank INTEGER, -- Position on leaderboard
    badges_earned TEXT[], -- Array of badge IDs e.g. ['top_10', 'survivor']
    snapshot_data JSONB, -- Full JSON dump of portfolio for detail view if needed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add active_season_id to profiles to track participation
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS active_season_id UUID REFERENCES seasons(id);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_seasons_active ON seasons(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_historical_portfolios_user ON historical_portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_historical_portfolios_season ON historical_portfolios(season_id);

-- 5. RLS Policies

-- Seasons: Public read
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seasons are viewable by everyone" ON seasons FOR SELECT USING (true);

-- Historical Portfolios: Public read (Hall of Fame)
ALTER TABLE historical_portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Historical portfolios are viewable by everyone" ON historical_portfolios FOR SELECT USING (true);

-- 6. Helper Function: Get Current Season
CREATE OR REPLACE FUNCTION get_current_season_id()
RETURNS UUID AS $$
DECLARE
    season_id UUID;
BEGIN
    SELECT id INTO season_id
    FROM seasons
    WHERE is_active = true
    LIMIT 1;
    RETURN season_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Seed "Genesis" Season if none exists
INSERT INTO seasons (name, start_date, is_active)
SELECT 'Säsong 1: Genesis', NOW(), true
WHERE NOT EXISTS (SELECT 1 FROM seasons WHERE is_active = true);
