import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { openai } from "@/lib/openai";
import { fetchStockData } from "@/lib/stocks-api";
import { COPILOT_SYSTEM_PROMPT } from "@/config/ai-prompts";
import { checkAndIncrementAIUsage, createLimitReachedResponse } from "@/lib/ai-metering";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Cookie: cookieStore.toString() } },
        });

        // Check authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check AI usage metering
        const metering = await checkAndIncrementAIUsage(supabase, user.id);
        if (!metering.allowed) {
            return NextResponse.json(createLimitReachedResponse(), { status: 402 });
        }

        const { message, contextTicker, history } = await request.json();

        // ========================================
        // FETCH USER'S PERSONAL TICKO DATA
        // ========================================

        // 1. Get user's portfolio positions
        const { data: portfolio } = await supabase
            .from("portfolio")
            .select("symbol, shares, avg_cost, created_at")
            .eq("user_id", user.id);

        // 2. Get user's recent transactions (last 20)
        const { data: transactions } = await supabase
            .from("transactions")
            .select("symbol, type, shares, price, realized_pnl, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(20);

        // 3. Get user's watchlist
        const { data: watchlist } = await supabase
            .from("watchlists")
            .select("ticker_symbol")
            .eq("user_id", user.id);

        // 4. Get user's profile for cash balance
        const { data: profile } = await supabase
            .from("profiles")
            .select("paper_balance, reputation_score")
            .eq("id", user.id)
            .single();

        // Calculate portfolio stats
        let totalInvested = 0;
        let portfolioSummary = "";
        if (portfolio && portfolio.length > 0) {
            const positions = portfolio.map(p => {
                const shares = p.shares || 0;
                const avgCost = p.avg_cost || 0;
                const invested = shares * avgCost;
                totalInvested += invested;
                return `${p.symbol}: ${shares} shares @ $${avgCost.toFixed(2)} avg`;
            });
            portfolioSummary = positions.join("\n");
        }

        // Calculate recent trading stats
        let tradingStats = "";
        if (transactions && transactions.length > 0) {
            const sells = transactions.filter(t => t.type === "sell");
            const totalPnl = sells.reduce((sum, t) => sum + (t.realized_pnl || 0), 0);
            const wins = sells.filter(t => (t.realized_pnl || 0) > 0).length;
            const winRate = sells.length > 0 ? (wins / sells.length * 100).toFixed(0) : "N/A";
            
            const recentTrades = transactions.slice(0, 5).map(t => {
                const price = t.price || 0;
                const shares = t.shares || 0;
                const pnl = t.realized_pnl;
                return `${(t.type || 'trade').toUpperCase()} ${t.symbol}: ${shares} @ $${price.toFixed(2)}${pnl ? ` (${pnl >= 0 ? '+' : ''}$${pnl.toFixed(0)})` : ''}`;
            }).join("\n");
            
            tradingStats = `
Recent trades:
${recentTrades}

Stats: ${sells.length} closed trades, ${winRate}% win rate, ${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(0)} total P&L`;
        }

        // Build personal context
        let personalContext = `
========================================
USER'S PERSONAL TICKO DATA:
========================================

CASH BALANCE: $${(profile?.paper_balance || 10000).toLocaleString()}
TOTAL INVESTED: $${totalInvested.toLocaleString()}
REPUTATION LEVEL: ${profile?.reputation_score || 0} XP

CURRENT POSITIONS:
${portfolioSummary || "No open positions"}

${tradingStats || "No completed trades yet"}

WATCHLIST: ${watchlist?.map(w => w.ticker_symbol).join(", ") || "Empty"}
========================================
`;

        let stockContext = "";

        // If the user is looking at a specific stock, fetch data for it
        if (contextTicker) {
            const stock = await fetchStockData(contextTicker);
            if (stock) {
                // Check if user owns this stock
                const userPosition = portfolio?.find(p => p.symbol === contextTicker.toUpperCase());
                const positionInfo = userPosition 
                    ? `\nUSER OWNS: ${userPosition.shares} shares @ $${userPosition.avg_cost.toFixed(2)} avg cost`
                    : "\nUSER DOES NOT OWN THIS STOCK";

                stockContext = `
CURRENTLY VIEWING - ${stock.symbol}:
• Name: ${stock.name}
• Price: $${stock.price} ${stock.currency}
• Daily change: ${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%
• P/E ratio: ${stock.pe || 'N/A'}
• Market cap: ${stock.marketCap || 'N/A'}
• 52-week H/L: ${stock.week52Range || 'N/A'}${positionInfo}
`;
            }
        }

        const fullContext = personalContext + stockContext;
        const systemPrompt = COPILOT_SYSTEM_PROMPT(fullContext);

        const messages = [
            { role: "system", content: systemPrompt },
            ...history.map((msg: any) => ({
                role: msg.role,
                content: msg.content
            })),
            { role: "user", content: message }
        ];

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: messages as any,
            temperature: 0.7,
            max_tokens: 300,
        });

        const reply = response.choices[0].message.content;

        return NextResponse.json({ reply });

    } catch (error: any) {
        console.error("Copilot error:", error?.message || error);
        console.error("Copilot error stack:", error?.stack);
        return NextResponse.json(
            { 
                reply: "I'm having trouble right now. Please try again in a moment.",
                debug: process.env.NODE_ENV === "development" ? error?.message : undefined
            },
            { status: 500 }
        );
    }
}
