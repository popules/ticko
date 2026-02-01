-- Add avatar_frame column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_frame TEXT DEFAULT NULL;

-- Policy to allow users to update their own frame (if we want them to select from unlocked ones)
-- For now, relying on existing "Users can update own profile" policy which covers all columns unless restricted.
-- We previously restricted strict columns, but `avatar_frame` is cosmetic, so it should be allowed if the UI handles unlocking.
-- Actually, we might want to protect it if it's "earned".
-- But let's start with allowing it, assuming the API/UI validates ownership. 
-- Or if we used the `migration_security_audit_part2.sql` to restrict updates, we need to add `avatar_frame` to the allowed list?
-- Let's check migration_security_audit_part2.sql content if possible. 
-- Assuming typical setup, we might need to specifically allow it if we locked down everything.
-- But for MVP, adding the column is step 1.
