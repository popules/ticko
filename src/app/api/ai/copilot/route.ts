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

        let contextData = "";

        // If the user is looking at a specific stock, fetch data for it
        if (contextTicker) {
            const stock = await fetchStockData(contextTicker);
            if (stock) {
                contextData = `
STOCK DATA:
• Name: ${stock.name} (${stock.symbol})
• Price: ${stock.price} ${stock.currency}
• Daily change: ${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%
• P/E ratio: ${stock.pe || 'N/A'}
• Market cap: ${stock.marketCap || 'N/A'}
• 52-week H/L: ${stock.week52Range || 'N/A'}
                `;
            }
        }

        const systemPrompt = COPILOT_SYSTEM_PROMPT(contextData);

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
        console.error("Copilot error:", error);
        return NextResponse.json(
            { reply: "I'm having trouble connecting to the market right now. Please try again in a moment." },
            { status: 500 }
        );
    }
}
