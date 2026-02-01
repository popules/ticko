import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    if (code) {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: any) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: any) {
                        cookieStore.set({ name, value: "", ...options });
                    },
                },
            }
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
            // NOTE: With the new OnboardingModal logic, we might not strictly need this redirection 
            // anymore if the modal handles it on the client side, but it's safe to keep as a fallback 
            // or we can just redirect to root and let the modal handle it for better UX.
            // Let's redirect to root to ensure the cookie is set and client takes over.

            // Actually, for now, let's keep the redirect to root which is the standard flow,
            // and relying on OnboardingModal (client-side) to force the username choice.
            // Check for new user (Google Signup) to send welcome email
            const createdAt = new Date(data.user.created_at || "");
            const now = new Date();
            const isNewUser = (now.getTime() - createdAt.getTime()) < 15000; // 15 seconds threshold

            if (isNewUser && data.user.email) {
                // Determine username: try metadata first, then fallback to email prefix
                const username = data.user.user_metadata?.full_name ||
                    data.user.user_metadata?.name ||
                    data.user.email.split('@')[0];

                // Fire and forget welcome email
                fetch(`${requestUrl.origin}/api/email/welcome`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: data.user.email,
                        username: username
                    })
                }).catch(err => console.error("Failed to send OAuth welcome email:", err));
            }

            return NextResponse.redirect(new URL("/", requestUrl.origin));
        }
    }

    // Something went wrong, redirect to login
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
}
