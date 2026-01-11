-- Achievements System
CREATE TABLE achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL, -- e.g. "first_post", "oracle_5"
    name TEXT NOT NULL,
    description TEXT not null,
    icon_name TEXT NOT NULL, -- lucide icon name or emoji
    rarity TEXT DEFAULT 'common' -- common, rare, epic, legendary
);

CREATE TABLE user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Seed some achievements
INSERT INTO achievements (key, name, description, icon_name, rarity) VALUES
('early_adopter', 'Early Adopter', 'Joined Ticko in the early days.', 'Sparkles', 'legendary'),
('first_post', 'Hello World', 'Published your first post.', 'Pen', 'common'),
('oracle', 'The Oracle', 'Correctly predicted a stock movement.', 'Eye', 'rare'),
('influencer', 'Influencer', 'Received 100 likes on a post.', 'Heart', 'epic');


-- Polls System
CREATE TABLE polls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE, -- Polls are attached to posts
    question TEXT NOT NULL,
    -- JSONB for options e.g. [{"id": 1, "text": "Yes"}, {"id": 2, "text": "No"}]
    options_data JSONB NOT NULL, 
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ends_at TIMESTAMPTZ
);

CREATE TABLE poll_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    option_index INTEGER NOT NULL, -- 0, 1, 2...
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(poll_id, user_id) -- One vote per poll
);

-- RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- Achievements are public read
CREATE POLICY "Achievements are viewable by everyone" ON achievements FOR SELECT USING (true);
CREATE POLICY "User achievements are viewable by everyone" ON user_achievements FOR SELECT USING (true);

-- Only system/triggers insert achievements (simulate via service role or generic authenticated for now if manual)
CREATE POLICY "System inserts achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id); 

-- Polls
CREATE POLICY "Polls are viewable by everyone" ON polls FOR SELECT USING (true);
CREATE POLICY "Creators can insert polls" ON polls FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM posts WHERE id = post_id)
);

-- Votes
CREATE POLICY "Votes are viewable by everyone" ON poll_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote" ON poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
