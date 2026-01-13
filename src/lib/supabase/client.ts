import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create browser client that uses cookies (SSR compatible)
// This ensures auth state is shared between client and server
function createClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
        return null;
    }
    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

export const supabase = createClient();
export const isSupabaseConfigured = !!supabase;
