import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import YahooFinance from "yahoo-finance2";

const TICKOBOT_USER_ID = process.env.TICKOBOT_USER_ID || "tickobot-system-user";

// Create admin client lazily to avoid build-time errors
function getSupabaseAdmin() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || "";
    if (!serviceRoleKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");
    }
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
    );
}

// Create OpenAI client lazily to avoid build-time errors
function getOpenAI() {
    if (!process.env.OPENAI_API_KEY) {
        console.log("OPENAI_API_KEY is missing. OpenAI features will fail at runtime.");
        return null;
    }
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const yf = new YahooFinance();

// Swedish tickers + US majors for dynamic posts
const WATCHED_TICKERS = [
    "VOLV-B.ST", "AZN.ST", "ERIC-B.ST", "HM-B.ST", "INVE-B.ST", "SEB-A.ST", "SAND.ST",
    "TSLA", "NVDA", "AAPL", "MSFT", "AMZN"
];

async function getMarketMover(): Promise<{ ticker: string; name: string; change: number } | null> {
    try {
        const quotes = await Promise.all(
            WATCHED_TICKERS.slice(0, 6).map(async (ticker) => {
                try {
                    const quote: any = await yf.quote(ticker, { fields: ["regularMarketPrice", "regularMarketChangePercent", "shortName"] });
                    return {
                        ticker,
                        name: quote.shortName || ticker,
                        change: quote.regularMarketChangePercent || 0
                    };
                } catch {
                    return null;
                }
            })
        );

        const validQuotes = quotes.filter((q): q is { ticker: string; name: string; change: number } => q !== null);
        if (validQuotes.length === 0) return null;

        // Find biggest mover (positive or negative)
        return validQuotes.reduce((max, q) => Math.abs(q.change) > Math.abs(max.change) ? q : max);
    } catch {
        return null;
    }
}

async function generateMarketPost(): Promise<string> {
    const mover = await getMarketMover();

    const prompt = mover
        ? `Skriv ett kort, energiskt inlägg (max 150 tecken) om att ${mover.name} (${mover.ticker}) rört sig ${mover.change > 0 ? "upp" : "ner"} ${Math.abs(mover.change).toFixed(1)}% idag. Var nyfiken, inte rådgivande. Inkludera $${mover.ticker.replace(".ST", "")} som en cashtag.`
        : `Skriv ett kort, engagerande inlägg (max 150 tecken) om börsen idag. Fråga vad folk håller koll på. Var social och nyfiken.`;

    try {
        const openai = getOpenAI();
        if (!openai) {
            return "God morgon! Vad håller ni koll på idag? 🔍";
        }
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Du är TickoBot, en vänlig börs-entusiast som delar marknadsuppdateringar på Ticko. Du ger ALDRIG råd, bara observationer och frågor." },
                { role: "user", content: prompt }
            ],
            max_tokens: 100
        });
        return completion.choices[0]?.message?.content?.trim() || "Hur ser er torsdag ut på börsen? 📈";
    } catch {
        return "God morgon! Vad håller ni koll på idag? 🔍";
    }
}

export async function POST(request: Request) {
    // Verify cron secret to prevent abuse
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const content = await generateMarketPost();
        const mover = await getMarketMover();
        const supabaseAdmin = getSupabaseAdmin();
        const { error } = await supabaseAdmin
            .from("posts")
            .insert({
                user_id: TICKOBOT_USER_ID,
                content: content,
                ticker_symbol: mover?.ticker.replace(".ST", "").toUpperCase() || null,
                sentiment: mover && mover.change > 0 ? "bull" : mover && mover.change < 0 ? "bear" : null,
            });

        if (error) throw error;

        return NextResponse.json({ success: true, content });
    } catch (error) {
        console.error("TickoBot post failed:", error);
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}
