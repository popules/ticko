import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    // 1. Verify Vercel Cron Secret (Security)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Allow running in dev without secret if needed, or stick to strict
        // For local dev, we often skip this check or simulate header
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    const supabase = await createClient();

    // 2. Perform Daily Maintenance
    // Example: Expire old challenges, rotate system challenges
    // For MVP, we mainly rely on Lazy Init for per-user rows.

    // Future Feature: Send Push Notifications for "New Challenges Available"
    // Future Feature: Calculate "Daily Streak" (if user didn't login yesterday, reset streak)

    // Log the run
    console.log("Cron: Daily Maintenance running...");

    // We could clean up expired user_challenges to keep table small?
    // delete from user_challenges where expires_at < now() - interval '7 days'

    // For now, just return success so Vercel sees 200 OK
    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
}
