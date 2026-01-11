import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { OpenAI } from "openai";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET(
    request: Request,
    { params }: { params: Promise<{ ticker: string }> }
) {
    const { ticker } = await params;
    const cookieStore = await cookies();
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Cookie: cookieStore.toString() } },
    });

    try {
        // 1. Fetch recent posts for this ticker
        const { data: posts, error } = await supabase
            .from("posts")
            .select("content, created_at")
            .eq("ticker_symbol", ticker.toUpperCase())
            .order("created_at", { ascending: false })
            .limit(20);

        if (error) throw error;

        if (!posts || posts.length === 0) {
            return NextResponse.json({
                summary: `Inga nyliga inlägg hittades för $${ticker}. Bli den första att dela din analys!`
            });
        }

        // 2. Prepare posts for AI
        const postsContent = posts.map(p => p.content).join("\n---\n");

        const prompt = `
        Analysera följande inlägg från Ticko-communityt gällande aktien $${ticker}:
        
        INLÄGG:
        ${postsContent}

        UPPGIFT:
        Sammanfatta community-snacket på Svenska. 
        - Vad är det generella sentimentet (Bullish/Bearish/Neutralt)?
        - Vilka är de vanligaste argumenten eller observationerna?
        - Håll det kort och insiktsfullt (max 100 ord).
        - Fokusera på "snacket", inte din egen analys av aktien.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "Du är en expert på att analysera socialt sentiment på finansmarknaden." },
                { role: "user", content: prompt }
            ],
            temperature: 0.5,
        });

        const summary = response.choices[0].message.content;

        return NextResponse.json({ summary });

    } catch (error: any) {
        console.error("Ticker summary error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
