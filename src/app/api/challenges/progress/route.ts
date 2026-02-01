import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { awardXp } from "@/lib/achievements";

type ActionType = 'trade' | 'comment' | 'lesson';

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { actionType, count = 1 }: { actionType: ActionType, count?: number } = await request.json();

    if (!actionType) {
        return NextResponse.json({ error: "Missing actionType" }, { status: 400 });
    }

    // Map action to category
    // 'trade' -> 'trading'
    // 'comment' -> 'social'
    // 'lesson' -> 'learning'
    const categoryMap: Record<ActionType, string> = {
        'trade': 'trading',
        'comment': 'social',
        'lesson': 'learning'
    };

    const targetCategory = categoryMap[actionType];

    // 1. Get active user challenges for this category
    // We need to join with the challenges table to check the category
    // Supabase join syntax: user_challenges!inner(..., challenges!inner(...))
    // Or just fetch all active user challenges and filter in code (easier for MVP)

    const { data: userChallenges, error } = await (supabase as any)
        .from("user_challenges")
        .select(`
            id,
            current_count,
            is_completed,
            challenges (
                id,
                category,
                target_count,
                xp_reward
            )
        `)
        .eq("user_id", user.id)
        .eq("is_completed", false)
        .gt("expires_at", new Date().toISOString());

    if (error || !userChallenges) {
        return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 });
    }

    // Filter by category
    const relevantChallenges = userChallenges.filter((uc: any) =>
        uc.challenges && uc.challenges.category === targetCategory
    );

    if (relevantChallenges.length === 0) {
        return NextResponse.json({ message: "No active challenges for this action" });
    }

    let totalXpAwarded = 0;
    const updates = [];

    // 2. Update progress
    for (const uc of relevantChallenges) {
        const newCount = uc.current_count + count;
        const target = uc.challenges.target_count;
        const isNowComplete = newCount >= target;

        if (isNowComplete) {
            totalXpAwarded += uc.challenges.xp_reward;
            // Award XP immediately
            await awardXp(user.id, uc.challenges.xp_reward);
        }

        updates.push({
            id: uc.id,
            current_count: newCount,
            is_completed: isNowComplete,
            completed_at: isNowComplete ? new Date().toISOString() : null
        });
    }

    // 3. Batch update (or loop update)
    // Supabase upsert works well if we have IDs
    const { error: updateError } = await (supabase as any)
        .from("user_challenges")
        .upsert(updates);

    if (updateError) {
        console.error("Error updating challenge progress:", updateError);
        return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        updated: updates.length,
        xpAwarded: totalXpAwarded,
        completedIds: updates.filter(u => u.is_completed).map(u => u.id)
    });
}
