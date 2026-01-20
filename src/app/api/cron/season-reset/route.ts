import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { awardAchievement } from "@/lib/achievements";

/**
 * Season Reset Cron Job
 * Runs when a season ends (manually triggered or via vercel cron)
 * 
 * 1. Gets current active season
 * 2. Snapshots all portfolios to historical_portfolios with rankings
 * 3. Awards badges to top performers
 * 4. Marks current season as inactive
 * 5. Creates new season
 * 6. Resets users' portfolios
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
        // 1. Get current active season
        const { data: currentSeason, error: seasonError } = await supabase
            .from("seasons")
            .select("*")
            .eq("is_active", true)
            .single();

        if (seasonError || !currentSeason) {
            return NextResponse.json({ error: "No active season found" }, { status: 404 });
        }

        // 2. Get leaderboard (all users with portfolios)
        // Calculate total value: cash + stock holdings
        const { data: allProfiles } = await supabase
            .from("profiles")
            .select("id, username, paper_cash_balance, paper_total_pnl")
            .not("paper_cash_balance", "is", null);

        // Get portfolio values for each user
        const portfolioValues: { userId: string; totalValue: number; username: string }[] = [];

        for (const profile of allProfiles || []) {
            // Get portfolio holdings value
            const { data: holdings } = await supabase
                .from("portfolio")
                .select("shares, buy_price, currency")
                .eq("user_id", profile.id);

            let holdingsValue = 0;
            for (const holding of holdings || []) {
                // Simplified: use buy_price as current value estimation
                // In production, you'd fetch real-time prices
                const value = holding.shares * holding.buy_price * (holding.currency === "SEK" ? 1 : 10.5);
                holdingsValue += value;
            }

            const totalValue = (profile.paper_cash_balance || 0) + holdingsValue;
            portfolioValues.push({
                userId: profile.id,
                totalValue,
                username: profile.username,
            });
        }

        // Sort by total value descending
        portfolioValues.sort((a, b) => b.totalValue - a.totalValue);

        // 3. Create historical snapshots with rankings
        const badgeAssignments: { userId: string; badges: string[] }[] = [];

        for (let i = 0; i < portfolioValues.length; i++) {
            const { userId, totalValue } = portfolioValues[i];
            const rank = i + 1;
            const badges: string[] = [];

            // Assign badges based on rank
            if (rank === 1) badges.push("season_winner", "top_10");
            else if (rank <= 3) badges.push("top_3", "top_10");
            else if (rank <= 10) badges.push("top_10");
            else if (rank <= 100) badges.push("top_100");

            // Survivor badge for anyone who participated
            badges.push("survivor");

            badgeAssignments.push({ userId, badges });

            // Insert into historical_portfolios
            await supabase.from("historical_portfolios").insert({
                user_id: userId,
                season_id: currentSeason.id,
                final_value: totalValue,
                final_rank: rank,
                badges_earned: badges,
            });
        }

        const winner = portfolioValues[0];

        // 4. Award achievement and notify winner
        if (winner) {
            await awardAchievement(winner.userId, "paper_winner");

            await supabase.from("notifications").insert({
                user_id: winner.userId,
                type: "season_winner",
                title: `🏆 Congratulations! You won ${currentSeason.name}!`,
                content: `You finished in first place with $${winner.totalValue.toLocaleString("en-US")}!`,
                read: false,
            });
        }

        // 5. Mark current season as inactive and set end date
        await supabase
            .from("seasons")
            .update({ is_active: false, end_date: new Date().toISOString() })
            .eq("id", currentSeason.id);

        // 6. Create new season
        const newSeasonNumber = parseInt(currentSeason.name.match(/\d+/)?.[0] || "1") + 1;
        const { data: newSeason } = await supabase
            .from("seasons")
            .insert({
                name: `Season ${newSeasonNumber}`,
                start_date: new Date().toISOString(),
                is_active: true,
            })
            .select()
            .single();

        // 7. Reset all users' portfolios and cash
        // Delete portfolio holdings
        await supabase.from("portfolio").delete().neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

        // Archive transactions
        await supabase
            .from("transactions")
            .update({ archived: true })
            .eq("archived", false);

        // Reset cash balance
        await supabase
            .from("profiles")
            .update({
                paper_cash_balance: 10000, // $10k USD
                paper_total_pnl: 0,
                paper_season_pnl: 0,
                paper_win_streak: 0,
                active_season_id: newSeason?.id,
            })
            .not("paper_cash_balance", "is", null);

        return NextResponse.json({
            success: true,
            endedSeason: currentSeason.name,
            newSeason: newSeason?.name,
            participants: portfolioValues.length,
            winner: winner ? {
                username: winner.username,
                totalValue: winner.totalValue,
            } : null,
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
