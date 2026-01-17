-- Push Subscriptions table for Web Push notifications
-- Run this migration in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- RLS policies
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON push_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own subscriptions
CREATE POLICY "Users can insert own subscriptions" ON push_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own subscriptions
CREATE POLICY "Users can delete own subscriptions" ON push_subscriptions
    FOR DELETE USING (auth.uid() = user_id);

-- Service role can do everything (for server-side operations)
CREATE POLICY "Service role full access" ON push_subscriptions
    FOR ALL USING (auth.role() = 'service_role');
