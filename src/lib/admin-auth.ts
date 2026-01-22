import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { User } from "@supabase/supabase-js";

// Admin email whitelist
const ADMIN_EMAILS = ["aberg.anton@gmail.com"];

/**
 * Verify that the current user is an admin.
 * Returns the user if authorized, or a 401/403 response if not.
 */
export async function verifyAdmin(): Promise<{ user: User } | NextResponse> {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
        return NextResponse.json({ error: "Not authorized - admin access required" }, { status: 403 });
    }

    return { user };
}

/**
 * Check if a response is an error response
 */
export function isErrorResponse(result: { user: any } | NextResponse): result is NextResponse {
    return result instanceof NextResponse;
}
