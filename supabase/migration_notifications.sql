-- Create Notifications Table
CREATE TYPE notification_type AS ENUM ('like', 'comment', 'reply', 'follow', 'system');

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- User who performed the action
  type notification_type NOT NULL,
  entity_id UUID, -- ID of the post, comment, etc.
  content TEXT, -- Optional preview text
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- TRIGGER FUNCTION: Notify on Comment
CREATE OR REPLACE FUNCTION notify_on_comment() RETURNS TRIGGER AS $$
BEGIN
  -- Notify the post owner (if not the commenter)
  IF NEW.user_id != (SELECT user_id FROM posts WHERE id = NEW.post_id) THEN
    INSERT INTO notifications (user_id, actor_id, type, entity_id, content)
    VALUES (
      (SELECT user_id FROM posts WHERE id = NEW.post_id),
      NEW.user_id,
      'comment',
      NEW.post_id,
      LEFT(NEW.content, 50)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_created
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE PROCEDURE notify_on_comment();

-- TRIGGER FUNCTION: Notify on Post Reaction (Like)
CREATE OR REPLACE FUNCTION notify_on_reaction() RETURNS TRIGGER AS $$
BEGIN
  -- Only notify on upvote/like, and trigger once
  IF NEW.reaction_type = 'up' AND NEW.user_id != (SELECT user_id FROM posts WHERE id = NEW.post_id) THEN
      -- Check if notification already exists to avoid spam (optional but good)
      IF NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = (SELECT user_id FROM posts WHERE id = NEW.post_id) AND actor_id = NEW.user_id AND type = 'like' AND entity_id = NEW.post_id) THEN
        INSERT INTO notifications (user_id, actor_id, type, entity_id)
        VALUES (
          (SELECT user_id FROM posts WHERE id = NEW.post_id),
          NEW.user_id,
          'like',
          NEW.post_id
        );
      END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_reaction_created
  AFTER INSERT ON reactions
  FOR EACH ROW EXECUTE PROCEDURE notify_on_reaction();
