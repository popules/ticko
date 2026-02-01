-- =====================================================
-- SECURITY AUDIT PART 2: COLUMN LEVEL SECURITY
-- Restrict which columns users can update/insert.
-- Use this to protect Reputation, XP, and Verification status.
-- =====================================================

-- 1. PROFILES: Prevent cheating on Reputation/XP
-- Revoke full update access
REVOKE UPDATE ON profiles FROM authenticated;

-- Grant access ONLY to safe columns
GRANT UPDATE (
    username, 
    avatar_url, 
    bio, 
    location, 
    display_name
) ON profiles TO authenticated;

-- 2. POSTS: Prevent faking prediction results
-- Revoke full insert access
REVOKE INSERT ON posts FROM authenticated;

-- Grant access ONLY to content columns
-- explicitly excluding: prediction_status (system controlled), id (auto), created_at (auto)
GRANT INSERT (
    user_id, 
    content, 
    ticker_symbol, 
    sentiment, 
    gif_url, 
    is_prediction, 
    prediction_price, 
    target_date
) ON posts TO authenticated;

-- Note: We generally don't allow UPDATING posts, but if we did/do:
-- REVOKE UPDATE ON posts FROM authenticated;
-- GRANT UPDATE (content) ON posts TO authenticated; -- Example

-- 3. CONFIRMATION
-- Users can still READ everything (SELECT is usually GRANT ALL or defined by policy).
-- RLS policies created in Part 1 still apply to filter *which* rows they can see/edit.
-- These GRANTS filter *which columns* they can touch on those rows.
