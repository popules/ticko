import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Get all Fantasy Leagues the user is a member of
 */
export async function GET() {
    try {
        const supabase = await createSupabaseServerClient();

        // Authenticate user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get all leagues the user is a member of, with league details
        const { data: memberships, error: membershipError } = await supabase
            .from("fantasy_league_members")
            .select(`
                id,
                rank_in_league,
                current_value,
                starting_value,
                joined_at,
                league:fantasy_leagues (
                    id,
                    name,
                    invite_code,
                    creator_id,
                    start_date,
                    end_date,
                    duration_days,
                    max_members,
                    is_active
                )
            `)
            .eq("user_id", user.id)
            .order("joined_at", { ascending: false });

        if (membershipError) {
            console.error("Fetch leagues error:", membershipError);
            return NextResponse.json({ error: "Failed to fetch leagues" }, { status: 500 });
        }

        // For each league, get the member count
        const leaguesWithCounts = await Promise.all(
            (memberships || []).map(async (membership: any) => {
                const { count } = await supabase
                    .from("fantasy_league_members")
                    .select("*", { count: "exact", head: true })
                    .eq("league_id", membership.league.id);

                // Calculate days remaining
                const endDate = membership.league.end_date ? new Date(membership.league.end_date) : null;
                const now = new Date();
                const daysRemaining = endDate
                    ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
                    : null;

                // Calculate P&L
                const pnl = membership.current_value - membership.starting_value;
                const pnlPercent = membership.starting_value > 0
                    ? ((pnl / membership.starting_value) * 100)
                    : 0;

                return {
                    id: membership.league.id,
                    name: membership.league.name,
                    invite_code: membership.league.invite_code,
                    is_creator: membership.league.creator_id === user.id,
                    rank_in_league: membership.rank_in_league,
                    members_count: count || 1,
                    max_members: membership.league.max_members,
                    current_value: membership.current_value,
                    starting_value: membership.starting_value,
                    pnl,
                    pnl_percent: pnlPercent,
                    days_remaining: daysRemaining,
                    end_date: membership.league.end_date,
                    is_active: membership.league.is_active && (daysRemaining === null || daysRemaining > 0),
                    joined_at: membership.joined_at,
                };
            })
        );

        return NextResponse.json(leaguesWithCounts);

    } catch (error: any) {
        console.error("My leagues error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch leagues" }, { status: 500 });
    }
}
