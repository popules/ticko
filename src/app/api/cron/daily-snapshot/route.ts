import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Daily Portfolio Snapshot Cron Job
 * Runs every day at 00:00 UTC
 * 
 * Saves each user's current portfolio value for the equity graph
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

    const USD_TO_SEK = 10.5;
    const STARTING_CAPITAL = 100000;

    try {
        // Get all users with portfolio items
        const { data: users } = await supabase
            .from("profiles")
            .select("id");

        if (!users || users.length === 0) {
            return NextResponse.json({ success: true, snapshots: 0 });
        }

        let snapshotsCreated = 0;

        for (const user of users) {
            // Get user's portfolio
            const { data: portfolio } = await supabase
                .from("portfolio")
                .select("symbol, shares, buy_price, currency")
                .eq("user_id", user.id);

            // Calculate total invested and current value
            let totalInvestedSek = 0;

            for (const item of portfolio || []) {
                const rate = item.currency === "SEK" ? 1 : USD_TO_SEK;
                totalInvestedSek += item.shares * item.buy_price * rate;
            }

            // For simplicity, we'll use the invested value as current value
            // In production, you'd fetch current prices via API
            const totalCurrentSek = totalInvestedSek; // Placeholder - ideally fetch live prices
            const cashBalance = STARTING_CAPITAL - totalInvestedSek;
            const totalValue = totalCurrentSek + cashBalance;

            // Upsert snapshot (handles duplicate dates)
            await supabase.from("portfolio_snapshots").upsert({
                user_id: user.id,
                total_value: totalValue,
                cash_balance: cashBalance,
                snapshot_date: new Date().toISOString().split("T")[0],
            }, {
                onConflict: "user_id,snapshot_date"
            });

            snapshotsCreated++;
        }

        return NextResponse.json({
            success: true,
            snapshots: snapshotsCreated,
            date: new Date().toISOString().split("T")[0]
        });

    } catch (error) {
        console.error("Snapshot error:", error);
        return NextResponse.json({ error: "Failed to create snapshots" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    return GET(request);
}
