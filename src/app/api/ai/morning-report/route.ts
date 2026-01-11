import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { OpenAI } from "openai";
import { fetchStockData } from "@/lib/stocks-api";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
        const { data: watchlist } = await supabase
            .from("watchlists")
            .select("ticker_symbol")
            .eq("user_id", user.id);

        if (!watchlist || watchlist.length === 0) {
            return NextResponse.json({
                message: "Lägg till aktier i din watchlist för att få en personlig morgonrapport!"
            });
        }

        const tickers = watchlist.map(w => w.ticker_symbol);

        // 2. Fetch data for these tickers (limited to top 5 for speed/token limits)
        const topTickers = tickers.slice(0, 5);
        const stockDataPromises = topTickers.map(ticker => fetchStockData(ticker));
        const stocks = (await Promise.all(stockDataPromises)).filter(s => s !== null);

        // 3. Prepare AI prompt
        const stockContext = stocks.map(s => (
            `- ${s!.symbol}: ${s!.price} ${s!.currency} (${s!.changePercent.toFixed(2)}%). ${s!.name}`
        )).join("\n");

        const prompt = `
        Du är Tickos AI-analytiker. Skapa en kortfatta men proffsig och peppig "Morgonrapport" för en användare baserat på deras watchlist:
        
        AKTIE-DATA:
        ${stockContext}

        INSTRUKTIONER:
        - Skriv på Svenska.
        - Fokusera på de viktigaste rörelserna.
        - Ge en kort sammanfattning av marknadsläget (bullish/bearish).
        - Avsluta med en uppmuntrande kommentar för dagen.
        - Håll det under 150 ord.
        - Använd en ton som känns exklusiv och insiktsfull.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "Du är en expert på aktiemarknaden och skriver korta, insiktsfulla morgonrapporter." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });

        const report = response.choices[0].message.content;

        return NextResponse.json({ report });

    } catch (error: any) {
        console.error("Morning report error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
