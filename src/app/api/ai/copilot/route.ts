import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { fetchStockData } from "@/lib/stocks-api";
import { COPILOT_SYSTEM_PROMPT } from "@/config/ai-prompts";

export async function POST(request: Request) {
    try {
        const { message, contextTicker, history } = await request.json();

        let contextData = "";

        // If the user is looking at a specific stock, fetch data for it
        if (contextTicker) {
            const stock = await fetchStockData(contextTicker);
            if (stock) {
                contextData = `
AKTIEDATA:
• Namn: ${stock.name} (${stock.symbol})
• Pris: ${stock.price} ${stock.currency}
• Daglig förändring: ${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%
• P/E-tal: ${stock.pe || 'N/A'}
• Börsvärde: ${stock.marketCap || 'N/A'}
• 52-veckors H/L: ${stock.week52Range || 'N/A'}
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
            { reply: "Jag har lite problem att koppla upp mig mot marknaden just nu. Försök igen om en stund." },
            { status: 500 }
        );
    }
}
