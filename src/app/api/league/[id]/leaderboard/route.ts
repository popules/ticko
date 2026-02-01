import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createSupabaseServerClient();
    const resolvedParams = await params;
    const leagueId = resolvedParams.id;

    try {
        const { data, error } = await supabase
            .from("league_placements")
            .select("*, profiles(username, avatar_url, reputation_score)")
            .eq("league_id", leagueId)
            // TODO: Order by paper_trading PnL in the future, for now using reputation as proxy or rank_in_league
            .order("rank_in_league", { ascending: true, nullsFirst: false })
            .limit(50);

        if (error) {
            console.error("Error fetching league leaderboard:", error);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error("Server error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
