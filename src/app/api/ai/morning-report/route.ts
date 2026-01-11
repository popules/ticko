import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { openai } from "@/lib/openai";
import { fetchStockData } from "@/lib/stocks-api";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: Request) {
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
                message: "Lägg till aktier i din watchlist för att få en personlig morgonrapport!"
            });
        }

        const tickers = (watchlist as any[]).map((w: any) => w.ticker_symbol);

        // 2. Fetch data for these tickers (limited to top 5)
        const topTickers = tickers.slice(0, 5);
        const stockDataPromises = topTickers.map((ticker: string) => fetchStockData(ticker));
        const stocks = (await Promise.all(stockDataPromises)).filter(s => s !== null);

        if (stocks.length === 0) {
            return NextResponse.json({
                message: "Vi kunde inte hämta marknadsdata just nu. Försök igen senare."
            });
        }

        // 3. Prepare AI prompt or Fallback
        const apiKey = process.env.OPENAI_API_KEY;
        let report = "";

        if (apiKey) {
            try {
                const stockContext = stocks.map(s => (
                    `- ${s!.symbol}: ${s!.price} ${s!.currency} (${s!.changePercent.toFixed(2)}%). ${s!.name}`
                )).join("\n");

                const prompt = `
                Du är Tickos AI-analytiker. Skapa en kortfatta men proffsig och peppig "Morgonrapport" med fokus på användarens aktier:
                
                ${stockContext}

                INSTRUKTIONER:
                - Skriv på Svenska.
                - Max 3 korta stycken. 
                - Nämn dagens vinnare.
                - Ton: Exklusiv, insiktsfull.
                `;

                const response = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: "Du är en expert på aktiemarknaden." },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7,
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
            const sentiment = winner!.changePercent > 0 ? "positiv" : "försiktig";

            report = `God morgon! Här är din snabbkoll på marknaden.\n\nMarknadsklimatet verkar ${sentiment} just nu. Din portfölj leds idag av ${winner!.name} (${winner!.symbol}) som rör sig ${winner!.changePercent > 0 ? '+' : ''}${winner!.changePercent.toFixed(2)}%.\n\nHåll ett öga på ${loser!.name} som har det lite tuffare. Lycka till med dagens handel!`;
        }

        return NextResponse.json({ report });

    } catch (error: any) {
        console.error("Morning report error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
