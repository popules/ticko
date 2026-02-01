import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { openai } from "@/lib/openai";
import { checkAndIncrementAIUsage, createLimitReachedResponse } from "@/lib/ai-metering";

/**
 * API Route: /api/ai/trading-insights
 * 
 * Analyzes user's paper trading history and provides personalized insights.
 * Uses OpenAI to generate a "roast" style analysis of trading patterns.
 */
export async function POST(request: Request) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: "userId required" }, { status: 400 });
        }

        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE || "";
        if (!serviceRoleKey || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
            return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            serviceRoleKey
        );

        // Check AI usage metering (use service role client to read profile)
        const metering = await checkAndIncrementAIUsage(supabase, userId);
        if (!metering.allowed) {
            return NextResponse.json(createLimitReachedResponse(), { status: 402 });
        }

        // Fetch user's trading history
        const { data: transactions, error: txError } = await supabase
            .from("transactions")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: true });

        if (txError) {
            console.error("Transaction fetch error:", txError);
            return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
        }

        // Calculate trading statistics
        const buys = (transactions || []).filter((t) => t.type === "buy");
        const sells = (transactions || []).filter((t) => t.type === "sell");

        // Need at least 1 completed sell to analyze
        if (sells.length === 0) {
            const holdingsCount = buys.length;
            return NextResponse.json({
                insight: null,
                message: holdingsCount > 0
                    ? `You have ${holdingsCount} open position${holdingsCount === 1 ? "" : "s"}. Sell some stock first and I can analyze your trading style! 📊`
                    : "You don't have any trades yet. Start buying stocks and I can analyze your trading style! 🚀",
            });
        }

        const wins = sells.filter((t) => (t.realized_pnl || 0) > 0);
        const losses = sells.filter((t) => (t.realized_pnl || 0) < 0);

        const winRate = sells.length > 0 ? (wins.length / sells.length) * 100 : 0;
        const totalPnl = sells.reduce((sum, t) => sum + (t.realized_pnl || 0), 0);

        // Calculate average hold time (buy to sell)
        const holdTimes: number[] = [];
        for (const sell of sells) {
            const correspondingBuy = buys.find(
                (b) => b.symbol === sell.symbol && new Date(b.created_at) < new Date(sell.created_at)
            );
            if (correspondingBuy) {
                const holdMs = new Date(sell.created_at).getTime() - new Date(correspondingBuy.created_at).getTime();
                const holdDays = holdMs / (1000 * 60 * 60 * 24);
                holdTimes.push(holdDays);
            }
        }
        const avgHoldDays = holdTimes.length > 0
            ? holdTimes.reduce((a, b) => a + b, 0) / holdTimes.length
            : 0;

        // Find best and worst trades
        const bestTrade = sells.reduce((best, t) =>
            (t.realized_pnl || 0) > (best?.realized_pnl || 0) ? t : best, sells[0]);
        const worstTrade = sells.reduce((worst, t) =>
            (t.realized_pnl || 0) < (worst?.realized_pnl || 0) ? t : worst, sells[0]);

        // Calculate day-of-week patterns
        const dayStats: Record<string, { count: number; pnl: number }> = {};
        for (const sell of sells) {
            const day = new Date(sell.created_at).toLocaleDateString("en-US", { weekday: "long" });
            if (!dayStats[day]) dayStats[day] = { count: 0, pnl: 0 };
            dayStats[day].count++;
            dayStats[day].pnl += sell.realized_pnl || 0;
        }

        // Create prompt for OpenAI
        const statsContext = `
USER'S TRADING STATISTICS:
- Total number of trades: ${transactions.length} (${buys.length} buys, ${sells.length} sells)
- Win rate: ${winRate.toFixed(1)}%
- Total realized P&L: ${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(0)}
- Average hold time: ${avgHoldDays.toFixed(1)} days
- Best trade: ${bestTrade?.symbol} (+$${(bestTrade?.realized_pnl || 0).toFixed(0)})
- Worst trade: ${worstTrade?.symbol} ($${(worstTrade?.realized_pnl || 0).toFixed(0)})
- Traded stocks: ${[...new Set(transactions.map((t) => t.symbol))].join(", ")}
- Most active days: ${Object.entries(dayStats)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 3)
                .map(([day, stats]) => `${day} (${stats.count} trades)`)
                .join(", ")}
`;

        const systemPrompt = `You are a funny but insightful trading coach who analyzes users' paper trading patterns.

Your task:
1. Give 2-3 concrete insights based on the statistics
2. Be a bit "roasty" but friendly - think stand-up comedian giving investment advice
3. Use emojis sparingly but effectively
4. Keep it short and memorable (max 150 words)
5. End with an encouraging tip

Write in English. Be personal and specific - reference their actual numbers.`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: statsContext },
            ],
            temperature: 0.8,
            max_tokens: 300,
        });

        const insight = response.choices[0].message.content;

        // Calculate confidence based on data quality
        // More trades = higher confidence
        const tradeCount = transactions.length;
        let confidence: "low" | "medium" | "high" = "low";
        if (tradeCount >= 20) confidence = "high";
        else if (tradeCount >= 5) confidence = "medium";

        return NextResponse.json({
            insight,
            confidence,
            dataSources: [
                `${transactions.length} transactions analyzed`,
                `${sells.length} completed trades`,
                "Real-time price data",
            ],
            stats: {
                totalTrades: transactions.length,
                winRate: winRate.toFixed(1),
                totalPnl,
                avgHoldDays: avgHoldDays.toFixed(1),
                bestTrade: bestTrade?.symbol,
                worstTrade: worstTrade?.symbol,
            },
        });

    } catch (error: any) {
        console.error("Trading insights error:", error);
        return NextResponse.json(
            { error: "Failed to generate insights" },
            { status: 500 }
        );
    }
}
