-- ============================================
-- TICKO SCHEMA MIGRATION V2
-- Run this in Supabase SQL Editor
-- ============================================

-- Add GIF URL column to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS gif_url TEXT;

-- ============================================
-- TABLE: reactions
-- ============================================
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)  -- One reaction per user per post
);

CREATE INDEX IF NOT EXISTS idx_reactions_post ON reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON reactions(user_id);

-- Enable RLS
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Reactions: Public read, authenticated write
CREATE POLICY "Reactions are viewable by everyone" 
  ON reactions FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can react" 
  ON reactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change own reactions" 
  ON reactions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions" 
  ON reactions FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable Realtime for reactions
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;

-- ============================================
-- FUNCTION: Get sentiment for a ticker
-- ============================================
CREATE OR REPLACE FUNCTION get_ticker_sentiment(ticker_symbol_param TEXT)
RETURNS TABLE (
  bullish_count BIGINT,
  bearish_count BIGINT,
  bullish_percent NUMERIC,
  bearish_percent NUMERIC,
  total_posts BIGINT
) AS $$
DECLARE
  bull_count BIGINT;
  bear_count BIGINT;
  total BIGINT;
BEGIN
  SELECT COUNT(*) INTO bull_count 
  FROM posts 
  WHERE ticker_symbol = ticker_symbol_param AND sentiment = 'bull';
  
  SELECT COUNT(*) INTO bear_count 
  FROM posts 
  WHERE ticker_symbol = ticker_symbol_param AND sentiment = 'bear';
  
  total := bull_count + bear_count;
  
  RETURN QUERY SELECT 
    bull_count,
    bear_count,
    CASE WHEN total > 0 THEN ROUND((bull_count::NUMERIC / total) * 100, 1) ELSE 50 END,
    CASE WHEN total > 0 THEN ROUND((bear_count::NUMERIC / total) * 100, 1) ELSE 50 END,
    total;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Get reaction counts for a post
-- ============================================
CREATE OR REPLACE FUNCTION get_post_reactions(post_id_param UUID)
RETURNS TABLE (
  up_count BIGINT,
  down_count BIGINT
) AS $$
BEGIN
  RETURN QUERY SELECT 
    COUNT(*) FILTER (WHERE reaction_type = 'up'),
    COUNT(*) FILTER (WHERE reaction_type = 'down')
  FROM reactions
  WHERE post_id = post_id_param;
END;
$$ LANGUAGE plpgsql;
