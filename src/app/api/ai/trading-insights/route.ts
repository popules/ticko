import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { openai } from "@/lib/openai";

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

        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
        if (!serviceRoleKey || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
            return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            serviceRoleKey
        );

        // Fetch user's trading history
        const { data: transactions, error: txError } = await supabase
            .from("transactions")
            .select("*")
            .eq("user_id", userId)
            .eq("archived", false)
            .order("created_at", { ascending: true });

        if (txError) {
            console.error("Transaction fetch error:", txError);
            return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
        }

        if (!transactions || transactions.length < 3) {
            return NextResponse.json({
                insight: null,
                message: "Du behöver minst 3 trades för att få insikter. Fortsätt handla!",
            });
        }

        // Calculate trading statistics
        const buys = transactions.filter((t) => t.type === "buy");
        const sells = transactions.filter((t) => t.type === "sell");

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
            const day = new Date(sell.created_at).toLocaleDateString("sv-SE", { weekday: "long" });
            if (!dayStats[day]) dayStats[day] = { count: 0, pnl: 0 };
            dayStats[day].count++;
            dayStats[day].pnl += sell.realized_pnl || 0;
        }

        // Create prompt for OpenAI
        const statsContext = `
ANVÄNDARENS TRADING-STATISTIK:
- Totalt antal trades: ${transactions.length} (${buys.length} köp, ${sells.length} sälj)
- Win rate: ${winRate.toFixed(1)}%
- Total realiserad P&L: ${totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(0)} kr
- Genomsnittlig hålltid: ${avgHoldDays.toFixed(1)} dagar
- Bästa trade: ${bestTrade?.symbol} (+${(bestTrade?.realized_pnl || 0).toFixed(0)} kr)
- Sämsta trade: ${worstTrade?.symbol} (${(worstTrade?.realized_pnl || 0).toFixed(0)} kr)
- Handlade aktier: ${[...new Set(transactions.map((t) => t.symbol))].join(", ")}
- Mest aktiva dagar: ${Object.entries(dayStats)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 3)
                .map(([day, stats]) => `${day} (${stats.count} trades)`)
                .join(", ")}
`;

        const systemPrompt = `Du är en rolig men insiktsfull trading-coach som analyserar användares paper trading-mönster.

Din uppgift:
1. Ge 2-3 konkreta insikter baserat på statistiken
2. Var lite "roastig" men vänlig - tänk stand-up comedian som ger investeringsråd
3. Använd emojis sparsamt men effektivt
4. Håll det kort och minnesvärt (max 150 ord)
5. Avsluta med ett uppmuntrande råd

Skriv på svenska. Var personlig och specifik - referera till deras faktiska siffror.`;

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

        return NextResponse.json({
            insight,
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
