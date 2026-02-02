import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getLeagueFromRating, calculateRatingChange } from "@/lib/leagues";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE!;

/**
 * Weekly Cron: Update league ratings based on 7-day P&L performance
 * 
 * Run this every Sunday at 1am UTC
 */
export async function GET(request: NextRequest) {
    // Verify cron secret (skip in dev)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        if (process.env.NODE_ENV === "production") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // Get all users who have been active in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: profiles, error } = await supabase
            .from("profiles")
            .select("id, username, paper_balance, league_rating, league_rating_updated_at")
            .gte("updated_at", sevenDaysAgo.toISOString());

        if (error) {
            console.error("Error fetching profiles:", error);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        let promotions = 0;
        let relegations = 0;
        let totalUpdated = 0;

        for (const profile of profiles || []) {
            // Get starting balance from 7 days ago
            const { data: snapshot } = await supabase
                .from("portfolio_snapshots")
                .select("total_value")
                .eq("user_id", profile.id)
                .lte("snapshot_date", sevenDaysAgo.toISOString().split("T")[0])
                .order("snapshot_date", { ascending: false })
                .limit(1)
                .maybeSingle();

            const startingBalance = snapshot?.total_value || 10000;
            const currentBalance = profile.paper_balance || 10000;

            // Calculate 7-day P&L percentage
            const pnlPercent = ((currentBalance - startingBalance) / startingBalance) * 100;

            // Get rating change
            const ratingChange = calculateRatingChange(pnlPercent);
            const oldRating = profile.league_rating || 1000;
            const newRating = Math.max(0, oldRating + ratingChange);

            // Update rating
            await supabase
                .from("profiles")
                .update({
                    league_rating: newRating,
                    league_rating_updated_at: new Date().toISOString(),
                })
                .eq("id", profile.id);

            totalUpdated++;

            // Check for league change
            const oldLeague = getLeagueFromRating(oldRating);
            const newLeague = getLeagueFromRating(newRating);

            if (oldLeague.name !== newLeague.name) {
                const wasPromotion = newLeague.tier > oldLeague.tier;

                if (wasPromotion) promotions++;
                else relegations++;

                // Send notification
                await supabase.from("notifications").insert({
                    user_id: profile.id,
                    type: "system",
                    title: wasPromotion 
                        ? `🏆 Promoted to ${newLeague.name} League!`
                        : `Moved to ${newLeague.name} League`,
                    message: wasPromotion
                        ? `Amazing performance! Your rating is now ${newRating}. Keep climbing!`
                        : `Your rating is now ${newRating}. Bounce back strong!`,
                    created_at: new Date().toISOString(),
                });
            }
        }

        return NextResponse.json({
            success: true,
            stats: {
                total_updated: totalUpdated,
                promotions,
                relegations,
            },
        });

    } catch (error) {
        console.error("Weekly rating update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
