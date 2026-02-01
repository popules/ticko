import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Challenge, UserChallenge } from "@/types/database";

export async function GET() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Get all globally active challenges
    const { data: activeChallenges, error: challengeError } = await (supabase as any)
        .from("challenges")
        .select("*")
        .eq("is_active", true);

    if (challengeError || !activeChallenges) {
        return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 });
    }

    // 2. Get user's progress on these challenges
    const { data: userProgress, error: progressError } = await (supabase as any)
        .from("user_challenges")
        .select("*")
        .eq("user_id", user.id)
        .in("challenge_id", (activeChallenges || []).map((c: any) => c.id));

    if (progressError) {
        return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
    }

    // 3. Lazy Initialization: Create missing progress rows
    // Identify which active challenges don't have a user_challenge row
    const existingChallengeIds = new Set(userProgress?.map((p: any) => p.challenge_id));
    const missingChallenges = activeChallenges.filter((c: Challenge) => !existingChallengeIds.has(c.id));

    if (missingChallenges.length > 0) {
        const now = new Date();
        const expiresAt = new Date();

        // Simple logic: Daily expires at next midnight UTC, Weekly expires next Sunday
        // For MVP, let's just say "Daily" = +24h from *now* (simplification) or next midnight
        // Let's do Next Midnight UTC for consistency
        expiresAt.setUTCHours(24, 0, 0, 0);

        const newRows = missingChallenges.map((c: Challenge) => ({
            user_id: user.id,
            challenge_id: c.id,
            current_count: 0,
            is_completed: false,
            expires_at: expiresAt.toISOString()
        }));

        const { error: insertError } = await (supabase as any)
            .from("user_challenges")
            .insert(newRows);

        if (insertError) {
            console.error("Error creating user challenges:", insertError);
            // Continue anyway, they'll just show as empty/0 progress in UI for now
        } else {
            // Refetch to include the new rows? Or just manually merge them for the response
            // Manually merging is faster
            // Note: We won't have the 'id' of the new rows, but for the UI we mainly need the challenge info
        }
    }

    // 4. Merge Data for UI
    // We want to return a list of challenges with their attached progress
    // If we just inserted, we might verify by refetching, but let's trust the logic for speed.
    // Actually, let's refetch to be safe and consistent.
    const { data: finalUserProgress } = await (supabase as any)
        .from("user_challenges")
        .select("*")
        .eq("user_id", user.id)
        .in("challenge_id", (activeChallenges || []).map((c: any) => c.id));

    const combined = activeChallenges.map((challenge: Challenge) => {
        const progress = finalUserProgress?.find((p: any) => p.challenge_id === challenge.id);
        return {
            ...challenge,
            progress: progress || {
                current_count: 0,
                is_completed: false,
                expires_at: new Date().toISOString() // Should not happen if lazy init worked
            }
        };
    });

    return NextResponse.json({ challenges: combined });
}
