import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { openai } from "@/lib/openai";
import { fetchStockData } from "@/lib/stocks-api";
import { REPORT_SYSTEM_PROMPT, getTimeGreeting } from "@/config/ai-prompts";
import { checkAndIncrementAIUsage, createLimitReachedResponse } from "@/lib/ai-metering";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(_request: Request) {
    const cookieStore = await cookies();
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Cookie: cookieStore.toString() } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check AI usage metering
    const metering = await checkAndIncrementAIUsage(supabase, user.id);
    if (!metering.allowed) {
        return NextResponse.json(createLimitReachedResponse(), { status: 402 });
    }

    try {
        // 1. Get watchlist
        const { data: watchlist } = await supabase
            .from("watchlists")
            .select("ticker_symbol")
            .eq("user_id", user.id);

        // 2. Get user's portfolio positions
        const { data: portfolio } = await supabase
            .from("portfolio")
            .select("symbol, shares, avg_cost, created_at")
            .eq("user_id", user.id);

        // 3. Get recent transactions for trading stats
        const { data: transactions } = await supabase
            .from("transactions")
            .select("symbol, type, shares, price, realized_pnl, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(50);

        // 4. Get user profile for cash balance
        const { data: profile } = await supabase
            .from("profiles")
            .select("paper_balance, username")
            .eq("id", user.id)
            .single();

        // If no watchlist AND no portfolio, suggest adding stocks
        if ((!watchlist || watchlist.length === 0) && (!portfolio || portfolio.length === 0)) {
            return NextResponse.json({
                message: "Add stocks to your watchlist or portfolio to get a personalized market report!"
            });
        }

        // Combine watchlist and portfolio tickers (unique)
        const watchlistTickers = watchlist?.map((w: any) => w.ticker_symbol) || [];
        const portfolioTickers = portfolio?.map((p: any) => p.symbol) || [];
        const allTickers = [...new Set([...portfolioTickers, ...watchlistTickers])];

        // 5. Fetch data for these tickers (limited to top 8)
        const topTickers = allTickers.slice(0, 8);
        const stockDataPromises = topTickers.map((ticker: string) => fetchStockData(ticker));
        const stocks = (await Promise.all(stockDataPromises)).filter(s => s !== null);

        if (stocks.length === 0) {
            return NextResponse.json({
                message: "We could not fetch market data right now. Please try again later."
            });
        }

        // 6. Calculate trading statistics
        const sells = transactions?.filter(t => t.type === "sell") || [];
        const totalRealizedPnl = sells.reduce((sum, t) => sum + (t.realized_pnl || 0), 0);
        const wins = sells.filter(t => (t.realized_pnl || 0) > 0).length;
        const winRate = sells.length > 0 ? (wins / sells.length * 100).toFixed(0) : null;

        // Calculate unrealized P&L for portfolio positions
        let portfolioContext = "";
        let totalUnrealizedPnl = 0;
        if (portfolio && portfolio.length > 0 && stocks.length > 0) {
            const positionsWithPnl = portfolio.map(pos => {
                const currentStock = stocks.find(s => s?.symbol === pos.symbol);
                if (currentStock) {
                    const currentValue = pos.shares * currentStock.price;
                    const costBasis = pos.shares * pos.avg_cost;
                    const unrealizedPnl = currentValue - costBasis;
                    const pnlPercent = ((currentValue / costBasis) - 1) * 100;
                    totalUnrealizedPnl += unrealizedPnl;
                    return `• ${pos.symbol}: ${pos.shares} shares, ${unrealizedPnl >= 0 ? '+' : ''}$${unrealizedPnl.toFixed(0)} (${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(1)}%)`;
                }
                return `• ${pos.symbol}: ${pos.shares} shares @ $${pos.avg_cost.toFixed(2)}`;
            });
            portfolioContext = `
YOUR OPEN POSITIONS:
${positionsWithPnl.join("\n")}
Total Unrealized P&L: ${totalUnrealizedPnl >= 0 ? '+' : ''}$${totalUnrealizedPnl.toFixed(0)}`;
        }

        // 7. Prepare AI prompt or Fallback
        const apiKey = process.env.OPENAI_API_KEY;
        let report = "";
        const timeInfo = getTimeGreeting();

        if (apiKey) {
            try {
                const stockContext = stocks.map(s => {
                    const isOwned = portfolio?.some(p => p.symbol === s!.symbol);
                    return `• ${s!.symbol}: $${s!.price} (${s!.changePercent >= 0 ? '+' : ''}${s!.changePercent.toFixed(2)}%) - ${s!.name}${isOwned ? ' [OWNED]' : ''}`;
                }).join("\n");

                const tradingStatsContext = sells.length > 0 
                    ? `\nTRADING STATS:\n• ${sells.length} completed trades\n• Win rate: ${winRate}%\n• Total realized P&L: ${totalRealizedPnl >= 0 ? '+' : ''}$${totalRealizedPnl.toFixed(0)}`
                    : "";

                const prompt = `
Create a PERSONALIZED ${timeInfo.period} report for ${profile?.username || 'this trader'}.

THEIR WATCHLIST & HOLDINGS:
${stockContext}
${portfolioContext}
${tradingStatsContext}

CASH AVAILABLE: $${(profile?.paper_balance || 10000).toLocaleString()}

INSTRUCTIONS:
- Start with "${timeInfo.greeting}, ${profile?.username || 'trader'}!" 
- Comment on their SPECIFIC positions and P&L if they have any
- Mention today's movers in their portfolio/watchlist
- If they have notable wins or losses, acknowledge them
- Give a personal insight or tip based on their situation
- Max 3 short paragraphs total
- Tone: Like a personal trading coach who knows their portfolio
                `;

                const response = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: REPORT_SYSTEM_PROMPT },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 400,
                });
                report = response.choices[0].message.content || "";
            } catch (aiError) {
                console.warn("OpenAI generation failed, using fallback:", aiError);
            }
        }

        // 8. Fallback if no AI or AI failed
        if (!report) {
            // Find top mover
            const sorted = [...stocks].sort((a, b) => b!.changePercent - a!.changePercent);
            const winner = sorted[0];
            const loser = sorted[sorted.length - 1];
            const sentiment = winner!.changePercent > 0 ? "positive" : "cautious";
            const userName = profile?.username || "trader";

            let personalNote = "";
            if (totalUnrealizedPnl !== 0) {
                personalNote = totalUnrealizedPnl > 0 
                    ? `\n\nYour portfolio is up ${totalUnrealizedPnl.toFixed(0)} today - nice work!`
                    : `\n\nYour portfolio is down ${Math.abs(totalUnrealizedPnl).toFixed(0)} today - stay patient.`;
            }

            report = `Good morning, ${userName}! Here's your quick market snapshot.\n\nMarket sentiment looks ${sentiment} right now. Your stocks are led today by ${winner!.name} (${winner!.symbol}) moving ${winner!.changePercent > 0 ? '+' : ''}${winner!.changePercent.toFixed(2)}%.${personalNote}\n\nKeep an eye on ${loser!.name} which is having a tougher day. Good luck with today's trading!`;
        }

        return NextResponse.json({ report });

    } catch (error: any) {
        console.error("Morning report error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
