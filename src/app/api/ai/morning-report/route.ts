import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { openai } from "@/lib/openai";
import { fetchStockData } from "@/lib/stocks-api";
import { REPORT_SYSTEM_PROMPT, getTimeGreeting } from "@/config/ai-prompts";

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

    try {
        // 1. Get watchlist
        const { data: watchlist } = await (supabase as any)
            .from("watchlists")
            .select("ticker_symbol")
            .eq("user_id", user.id);

        if (!watchlist || watchlist.length === 0) {
            return NextResponse.json({
                message: "Add stocks to your watchlist to get a personalized market report!"
            });
        }

        const tickers = (watchlist as any[]).map((w: any) => w.ticker_symbol);

        // 2. Fetch data for these tickers (limited to top 5)
        const topTickers = tickers.slice(0, 5);
        const stockDataPromises = topTickers.map((ticker: string) => fetchStockData(ticker));
        const stocks = (await Promise.all(stockDataPromises)).filter(s => s !== null);

        if (stocks.length === 0) {
            return NextResponse.json({
                message: "We could not fetch market data right now. Please try again later."
            });
        }

        // 3. Prepare AI prompt or Fallback
        const apiKey = process.env.OPENAI_API_KEY;
        let report = "";
        const timeInfo = getTimeGreeting();

        if (apiKey) {
            try {
                const stockContext = stocks.map(s => (
                    `• ${s!.symbol}: ${s!.price} ${s!.currency} (${s!.changePercent >= 0 ? '+' : ''}${s!.changePercent.toFixed(2)}%) - ${s!.name}`
                )).join("\n");

                const prompt = `
Create a ${timeInfo.period} report for the user's watchlist.

STOCKS TO ANALYZE:
${stockContext}

INSTRUCTIONS:
- Start with "${timeInfo.greeting}!" 
- Briefly mention today's winners and losers
- Give an observation or insight
- Max 3 short paragraphs total
- Tone: Professional but warm
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

        // 4. Fallback if no AI or AI failed
        if (!report) {
            // Find top mover
            const sorted = [...stocks].sort((a, b) => b!.changePercent - a!.changePercent);
            const winner = sorted[0];
            const loser = sorted[sorted.length - 1];
            const sentiment = winner!.changePercent > 0 ? "positive" : "cautious";

            report = `Good morning! Here's your quick market snapshot.\n\nMarket sentiment looks ${sentiment} right now. Your portfolio is led today by ${winner!.name} (${winner!.symbol}) moving ${winner!.changePercent > 0 ? '+' : ''}${winner!.changePercent.toFixed(2)}%.\n\nKeep an eye on ${loser!.name} which is having a tougher day. Good luck with today's trading!`;
        }

        return NextResponse.json({ report });

    } catch (error: any) {
        console.error("Morning report error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
