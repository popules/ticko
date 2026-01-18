import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchBatchStockData } from "@/lib/stocks-api";
import { getPaperTradingSettings } from "@/config/subscription";

/**
 * Daily Portfolio Snapshot Cron Job
 * Runs every day at 00:00 UTC
 * 
 * Saves each user's current portfolio value for the equity graph
 */
// Daily Portfolio Snapshot Cron Job
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

    try {
        // 1. Fetch all profiles (to know who has pro status for starting capital)
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, is_pro");

        if (!profiles || profiles.length === 0) {
            return NextResponse.json({ success: true, snapshots: 0 });
        }

        // 2. Fetch all portfolio items
        const { data: allPortfolio } = await supabase
            .from("portfolio")
            .select("user_id, symbol, shares, buy_price, currency");

        // 3. Fetch all realized PnL from transactions
        const { data: allTransactions } = await supabase
            .from("transactions")
            .select("user_id, realized_pnl");

        // 4. Collect unique symbols
        const uniqueSymbols = [...new Set((allPortfolio || []).map((p: any) => p.symbol))];

        // 5. Batch fetch live prices
        const priceMap = await fetchBatchStockData(uniqueSymbols);

        let snapshotsCreated = 0;
        const snapshotDate = new Date().toISOString().split("T")[0];

        // 6. Calculate value for each user
        for (const profile of profiles) {
            const userPortfolio = (allPortfolio || []).filter((p: any) => p.user_id === profile.id);
            // If user has no portfolio and no transactions, skip? Or record 100k? 
            // Better to record so graph starts tracking idle money.

            const userTransactions = (allTransactions || []).filter((t: any) => t.user_id === profile.id);

            // Calculate totals
            let totalInvestedSek = 0;
            let totalCurrentValueSek = 0;

            for (const item of userPortfolio) {
                const rate = item.currency === "SEK" ? 1 : USD_TO_SEK;
                const price = priceMap[item.symbol] || item.buy_price; // Fallback to buy_price

                totalInvestedSek += item.shares * item.buy_price * rate;
                totalCurrentValueSek += item.shares * price * rate;
            }

            const totalRealizedPnl = userTransactions.reduce((sum: number, t: any) => sum + (t.realized_pnl || 0), 0);

            // Get starting capital based on Pro status
            const { startingCapital } = getPaperTradingSettings(profile.is_pro || false);

            // Cash Balance = Start + Realized PnL - Cost Basis of Current Holdings
            const cashBalance = startingCapital + totalRealizedPnl - totalInvestedSek;

            // Total Portfolio Value = Current Holdings Value + Cash
            const totalValue = totalCurrentValueSek + cashBalance;

            // Upsert snapshot
            await supabase.from("portfolio_snapshots").upsert({
                user_id: profile.id,
                total_value: Math.round(totalValue),
                cash_balance: Math.round(cashBalance),
                snapshot_date: snapshotDate,
            }, {
                onConflict: "user_id,snapshot_date"
            });

            snapshotsCreated++;
        }

        return NextResponse.json({
            success: true,
            snapshots: snapshotsCreated,
            date: snapshotDate
        });

    } catch (error) {
        console.error("Snapshot error:", error);
        return NextResponse.json({ error: "Failed to create snapshots" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    return GET(request);
}
