-- Add missing columns for predictions if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'is_prediction') THEN
        ALTER TABLE posts ADD COLUMN is_prediction BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'prediction_price') THEN
        ALTER TABLE posts ADD COLUMN prediction_price DECIMAL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'target_date') THEN
        ALTER TABLE posts ADD COLUMN target_date TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'prediction_status') THEN
        -- We might need to create the enum type first check
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prediction_status') THEN
             CREATE TYPE prediction_status AS ENUM ('pending', 'correct', 'incorrect');
        END IF;
        ALTER TABLE posts ADD COLUMN prediction_status prediction_status DEFAULT 'pending';
    END IF;
END $$;

-- Force schema cache reload hint (comment)
-- You may need to go to Supabase Dashboard -> API -> Settings -> Reload Schema Cache if this persists.
