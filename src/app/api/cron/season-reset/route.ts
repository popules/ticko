import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { awardAchievement } from "@/lib/achievements";

/**
 * Weekly Season Reset Cron Job
 * Runs every Sunday at 00:00 UTC
 * 
 * 1. Archives current season to paper_seasons table
 * 2. Awards "Säsongens Vinnare" achievement to #1
 * 3. Resets all users' paper_season_pnl to 0
 * 4. Increments paper_season_number
 */
export async function GET(request: Request) {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (!serviceRoleKey || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceRoleKey
    );

    try {
        // 1. Get current season number from any user (they should all be the same)
        const { data: seasonInfo } = await supabase
            .from("profiles")
            .select("paper_season_number")
            .limit(1)
            .single();

        const currentSeasonNumber = seasonInfo?.paper_season_number || 1;

        // 2. Get the leaderboard for this season
        const { data: leaderboard, error: leaderboardError } = await supabase
            .from("profiles")
            .select("id, username, paper_season_pnl")
            .not("paper_season_pnl", "is", null)
            .gt("paper_season_pnl", 0)
            .order("paper_season_pnl", { ascending: false })
            .limit(10);

        if (leaderboardError) {
            throw new Error(`Failed to fetch leaderboard: ${leaderboardError.message}`);
        }

        const winner = leaderboard?.[0];
        const participantCount = leaderboard?.length || 0;

        // 3. Archive the season
        if (winner) {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

            await supabase.from("paper_seasons").insert({
                season_number: currentSeasonNumber,
                winner_id: winner.id,
                winner_username: winner.username,
                winner_pnl: winner.paper_season_pnl,
                participants_count: participantCount,
                started_at: oneMonthAgo.toISOString(),
                ended_at: new Date().toISOString(),
            });

            // 4. Award achievement to winner
            await awardAchievement(winner.id, "paper_winner");

            // 5. Create notification for winner
            await supabase.from("notifications").insert({
                user_id: winner.id,
                type: "season_winner",
                title: `🏆 Grattis! Du vann Säsong ${currentSeasonNumber}!`,
                content: `Du slutade på första plats med +${winner.paper_season_pnl?.toLocaleString("sv-SE")} kr i profit!`,
                read: false,
            });
        }

        // 6. Update all users' best season if applicable and reset
        const { data: allUsers } = await supabase
            .from("profiles")
            .select("id, paper_season_pnl, paper_all_time_best_season");

        for (const user of allUsers || []) {
            const currentPnl = user.paper_season_pnl || 0;
            const bestEver = user.paper_all_time_best_season || 0;

            await supabase
                .from("profiles")
                .update({
                    paper_season_pnl: 0,
                    paper_season_start: new Date().toISOString(),
                    paper_season_number: currentSeasonNumber + 1,
                    paper_all_time_best_season: currentPnl > bestEver ? currentPnl : bestEver,
                })
                .eq("id", user.id);
        }

        return NextResponse.json({
            success: true,
            season: currentSeasonNumber,
            nextSeason: currentSeasonNumber + 1,
            winner: winner ? {
                username: winner.username,
                pnl: winner.paper_season_pnl,
            } : null,
            participants: participantCount,
        });

    } catch (error) {
        console.error("Season reset error:", error);
        return NextResponse.json({ error: "Failed to reset season" }, { status: 500 });
    }
}

// POST for manual triggering
export async function POST(request: Request) {
    return GET(request);
}
