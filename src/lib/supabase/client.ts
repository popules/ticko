import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create browser client that uses cookies (SSR compatible)
// This ensures auth state is shared between client and server
// We assert non-null here because the app won't work without Supabase anyway
export const supabase: SupabaseClient<Database> = isSupabaseConfigured
    ? createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
    : (null as unknown as SupabaseClient<Database>); // Type assertion to avoid null checks everywhere
