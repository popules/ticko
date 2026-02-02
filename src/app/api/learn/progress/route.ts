import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { awardXp } from "@/lib/achievements";

// GET: Fetch all completed lessons for the current user
export async function GET() {
    const supabase = await createSupabaseServerClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data, error } = await supabase
            .from("learn_progress")
            .select("module_id, lesson_id")
            .eq("user_id", user.id);

        if (error) {
            console.error("Error fetching progress:", error);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        // Return simpler format: ["module/lesson", ...]
        const completedIds = (data as any[]).map(row => `${row.module_id}/${row.lesson_id}`);

        return NextResponse.json({ completedLessons: completedIds });

    } catch (error) {
        console.error("Server error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Mark a lesson as complete
export async function POST(request: Request) {
    const supabase = await createSupabaseServerClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { moduleId, lessonId } = await request.json();

        if (!moduleId || !lessonId) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // 1. Check if already completed
        const { data: existing } = await supabase
            .from("learn_progress")
            .select("id")
            .eq("user_id", user.id)
            .eq("lesson_id", lessonId) // assuming lesson_id is unique enough, or use unique composite check
            .eq("module_id", moduleId)
            .maybeSingle();

        if (existing) {
            return NextResponse.json({ success: true, alreadyCompleted: true, xpAwarded: 0 });
        }

        // 2. Insert progress
        const xpAmount = 10; // Balanced: 10xp per lesson (vs 1xp per comment)
        const { error: insertError } = await (supabase as any)
            .from("learn_progress")
            .insert({
                user_id: user.id,
                module_id: moduleId,
                lesson_id: lessonId,
                xp_awarded: xpAmount
            });

        if (insertError) {
            console.error("Failed to insert progress:", insertError);
            return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
        }

        // 3. Award XP
        await awardXp(user.id, xpAmount, supabase);

        return NextResponse.json({ success: true, xpAwarded: xpAmount });

    } catch (error) {
        console.error("Server error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
