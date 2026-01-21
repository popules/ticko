import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    if (code) {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
            // Check if user has a profile with username
            const { data: profile } = await supabase
                .from("profiles")
                .select("username")
                .eq("id", data.user.id)
                .single();

            // If no profile or no username, redirect to choose alias page
            if (!profile || !profile.username) {
                return NextResponse.redirect(new URL("/valj-alias", requestUrl.origin));
            }

            // User has username, redirect to feed
            return NextResponse.redirect(new URL("/", requestUrl.origin));
        }
    }

    // Something went wrong, redirect to login
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
}
