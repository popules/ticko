import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createSupabaseServerClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data, error } = await supabase
            .from("league_placements")
            .select("*, leagues(*)")
            .eq("user_id", user.id)
            .maybeSingle();

        if (error) {
            console.error("Error fetching user league:", error);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        // Return null if not in a league yet (frontend handles "Join League" CTA)
        return NextResponse.json(data || null);

    } catch (error) {
        console.error("Server error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
