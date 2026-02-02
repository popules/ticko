import { createSupabaseServerClient } from "@/lib/supabase/server";
import { awardXp } from "@/lib/achievements";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { amount, reason } = await req.json();

        if (!amount || typeof amount !== "number") {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        // Apply some basic limits for non-admin requests
        const MAX_ONE_TIME_XP = 100;
        if (amount > MAX_ONE_TIME_XP) {
            return NextResponse.json({ error: "Amount exceeds limit" }, { status: 400 });
        }

        const success = await awardXp(user.id, amount, supabase);

        if (!success) {
            return NextResponse.json({ error: "Failed to award XP" }, { status: 500 });
        }

        return NextResponse.json({ success: true, awarded: amount, reason });
    } catch (error) {
        console.error("XP Award API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
