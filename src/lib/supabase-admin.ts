import { createClient } from '@supabase/supabase-js';

// Note: access to SUPABASE_SERVICE_ROLE_KEY is required
// This client should ONLY be used in server-side API routes, never on the client
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);
