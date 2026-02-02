import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getLeagueFromRating } from "@/lib/leagues";

export async function GET() {
    const supabase = await createSupabaseServerClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user's rating
        const { data: profile } = await supabase
            .from("profiles")
            .select("league_rating, paper_season_pnl, username")
            .eq("id", user.id)
            .single();

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        // Cast to any since league_rating is new column not in generated types yet
        const p = profile as any;
        const rating = p.league_rating || 1000;
        const league = getLeagueFromRating(rating);

        // Get rank within this league (how many people in same tier have higher P&L)
        const { count } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .gte("league_rating", league.tier === 5 ? 2500 : league.tier === 4 ? 2000 : league.tier === 3 ? 1500 : league.tier === 2 ? 1000 : 0)
            .lt("league_rating", league.tier === 5 ? 999999 : league.tier === 4 ? 2500 : league.tier === 3 ? 2000 : league.tier === 2 ? 1500 : 1000)
            .gt("paper_season_pnl", p.paper_season_pnl || 0);

        const rankInLeague = (count || 0) + 1;

        // Get points to next tier
        const nextTierThreshold = league.tier === 5 ? null : 
            league.tier === 4 ? 2500 :
            league.tier === 3 ? 2000 :
            league.tier === 2 ? 1500 : 1000;

        const pointsToPromotion = nextTierThreshold ? nextTierThreshold - rating : null;

        return NextResponse.json({
            league: league.name,
            tier: league.tier,
            rating,
            rank_in_league: rankInLeague,
            points_to_promotion: pointsToPromotion,
            username: p.username,
        });

    } catch (error) {
        console.error("Server error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
