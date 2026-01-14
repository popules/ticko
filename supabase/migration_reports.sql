-- ============================================
-- REPORTS TABLE - För anmälningar av inlägg
-- ============================================

-- Skapa reports-tabell
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL CHECK (reason IN ('market_manipulation', 'spam', 'harassment', 'misinformation', 'other')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    notes TEXT
);

-- Index för snabba sökningar
CREATE INDEX idx_reports_post ON reports(post_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created ON reports(created_at DESC);

-- RLS policies
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Användare kan skapa anmälningar
CREATE POLICY "Users can create reports"
    ON reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

-- Användare kan se sina egna anmälningar
CREATE POLICY "Users can view own reports"
    ON reports FOR SELECT
    USING (auth.uid() = reporter_id);

-- Notera: Admins behöver separat policy eller service role för att hantera alla anmälningar
