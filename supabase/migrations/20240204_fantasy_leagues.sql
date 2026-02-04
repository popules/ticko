-- Fantasy Leagues Migration
-- Run this in Supabase SQL Editor

-- 1. Fantasy Leagues Table (private friend leagues)
CREATE TABLE IF NOT EXISTS fantasy_leagues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    invite_code TEXT UNIQUE NOT NULL,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    starting_capital INTEGER DEFAULT 10000,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    duration_days INTEGER DEFAULT 30,
    max_members INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique index on invite code for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_fantasy_leagues_invite_code ON fantasy_leagues(invite_code);

-- 2. Fantasy League Members Table (who's in which league)
CREATE TABLE IF NOT EXISTS fantasy_league_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES fantasy_leagues(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    starting_value INTEGER DEFAULT 10000,
    current_value INTEGER DEFAULT 10000,
    rank_in_league INTEGER,
    UNIQUE(league_id, user_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_flm_league ON fantasy_league_members(league_id);
CREATE INDEX IF NOT EXISTS idx_flm_user ON fantasy_league_members(user_id);

-- 3. Snapshot table for tracking daily portfolio values per league
CREATE TABLE IF NOT EXISTS fantasy_league_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES fantasy_leagues(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    snapshot_date DATE NOT NULL,
    portfolio_value INTEGER NOT NULL,
    UNIQUE(league_id, user_id, snapshot_date)
);

-- 4. Row Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE fantasy_leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_league_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_league_snapshots ENABLE ROW LEVEL SECURITY;

-- Fantasy Leagues policies
-- Anyone can read leagues (to join via invite code)
CREATE POLICY "Anyone can view leagues" ON fantasy_leagues 
    FOR SELECT USING (true);

-- Only authenticated users can create
CREATE POLICY "Authenticated users can create leagues" ON fantasy_leagues 
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Only creator can update/delete
CREATE POLICY "Creator can update their leagues" ON fantasy_leagues 
    FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creator can delete their leagues" ON fantasy_leagues 
    FOR DELETE USING (auth.uid() = creator_id);

-- Fantasy League Members policies
-- Anyone can see league members (for leaderboard)
CREATE POLICY "Anyone can view league members" ON fantasy_league_members 
    FOR SELECT USING (true);

-- Authenticated users can join leagues
CREATE POLICY "Users can join leagues" ON fantasy_league_members 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can leave leagues (delete own membership)
CREATE POLICY "Users can leave leagues" ON fantasy_league_members 
    FOR DELETE USING (auth.uid() = user_id);

-- League creator or service role can update members (for rank updates)
CREATE POLICY "Service role can update members" ON fantasy_league_members 
    FOR UPDATE USING (true);

-- Snapshots policies
CREATE POLICY "Anyone can view snapshots" ON fantasy_league_snapshots 
    FOR SELECT USING (true);

CREATE POLICY "Service can insert snapshots" ON fantasy_league_snapshots 
    FOR INSERT WITH CHECK (true);

-- 5. Enable realtime for league members (optional, for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE fantasy_league_members;

-- 6. Add league notification support to notifications table
-- (Add columns if they don't exist - safe to run multiple times)
DO $$ 
BEGIN
    -- Add league_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'league_id') THEN
        ALTER TABLE notifications ADD COLUMN league_id UUID REFERENCES fantasy_leagues(id) ON DELETE CASCADE;
    END IF;
    
    -- Add message column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'message') THEN
        ALTER TABLE notifications ADD COLUMN message TEXT;
    END IF;
    
    -- Add metadata column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'metadata') THEN
        ALTER TABLE notifications ADD COLUMN metadata JSONB;
    END IF;
END $$;

-- 7. Add index for league notifications
CREATE INDEX IF NOT EXISTS idx_notifications_league ON notifications(league_id) WHERE league_id IS NOT NULL;

