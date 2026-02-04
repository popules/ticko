import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

/**
 * Join a Fantasy League via invite code
 */
export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const admin = getSupabaseAdmin();

        // Authenticate user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse request body
        const { invite_code } = await request.json();

        if (!invite_code || invite_code.trim().length < 4) {
            return NextResponse.json({ error: "Invalid invite code" }, { status: 400 });
        }

        // Find the league by invite code
        const { data: league, error: leagueError } = await admin
            .from("fantasy_leagues")
            .select("*")
            .eq("invite_code", invite_code.toUpperCase().trim())
            .single();

        if (leagueError || !league) {
            return NextResponse.json({ error: "League not found. Check your invite code." }, { status: 404 });
        }

        // Check if league is still active
        if (!league.is_active) {
            return NextResponse.json({ error: "This league has ended" }, { status: 400 });
        }

        // Check if league has ended (time-based)
        if (league.end_date && new Date(league.end_date) < new Date()) {
            return NextResponse.json({ error: "This league has ended" }, { status: 400 });
        }

        // Check if user is already a member
        const { data: existingMember } = await admin
            .from("fantasy_league_members")
            .select("id")
            .eq("league_id", league.id)
            .eq("user_id", user.id)
            .single();

        if (existingMember) {
            return NextResponse.json({
                error: "You are already a member of this league",
                league_id: league.id,
                already_member: true
            }, { status: 400 });
        }

        // Check member count
        const { count } = await admin
            .from("fantasy_league_members")
            .select("*", { count: "exact", head: true })
            .eq("league_id", league.id);

        if (count && count >= league.max_members) {
            return NextResponse.json({ error: "This league is full" }, { status: 400 });
        }

        // Get user's current portfolio value
        const { data: portfolio } = await admin
            .from("portfolio")
            .select("shares, buy_price, currency")
            .eq("user_id", user.id);

        const EXCHANGE_RATE_USD_SEK = 10.5;
        const STARTING_CAPITAL = 10000;

        let totalInvestedUsd = 0;
        (portfolio || []).forEach((item: any) => {
            const rateToUsd = item.currency === "SEK" ? (1 / EXCHANGE_RATE_USD_SEK) : 1;
            totalInvestedUsd += item.shares * item.buy_price * rateToUsd;
        });

        const currentValue = Math.round(STARTING_CAPITAL - totalInvestedUsd + totalInvestedUsd);

        // Add user to league
        const { error: memberError } = await admin
            .from("fantasy_league_members")
            .insert({
                league_id: league.id,
                user_id: user.id,
                starting_value: currentValue,
                current_value: currentValue,
                rank_in_league: (count || 0) + 1, // Last place for now, will be recalculated
            });

        if (memberError) {
            console.error("Join league error:", memberError);
            return NextResponse.json({ error: "Failed to join league" }, { status: 500 });
        }

        // Recalculate all ranks
        await recalculateLeagueRanks(admin, league.id);

        // Get updated member count
        const { count: newCount } = await admin
            .from("fantasy_league_members")
            .select("*", { count: "exact", head: true })
            .eq("league_id", league.id);

        return NextResponse.json({
            success: true,
            league_id: league.id,
            name: league.name,
            members_count: newCount || 1,
            end_date: league.end_date,
        });

    } catch (error: any) {
        console.error("Join league error:", error);
        return NextResponse.json({ error: error.message || "Failed to join league" }, { status: 500 });
    }
}

/**
 * Recalculate ranks within a league based on current value
 */
async function recalculateLeagueRanks(admin: any, leagueId: string) {
    // Get all members sorted by current_value descending
    const { data: members } = await admin
        .from("fantasy_league_members")
        .select("id, current_value")
        .eq("league_id", leagueId)
        .order("current_value", { ascending: false });

    if (!members) return;

    // Update ranks
    for (let i = 0; i < members.length; i++) {
        await admin
            .from("fantasy_league_members")
            .update({ rank_in_league: i + 1 })
            .eq("id", members[i].id);
    }
}
