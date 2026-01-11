import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { fetchStockData } from "@/lib/stocks-api";

export async function POST(request: Request) {
    try {
        const { message, contextTicker, history } = await request.json();

        let contextData = "";

        // If the user is looking at a specific stock, fetch data for it
        if (contextTicker) {
            const stock = await fetchStockData(contextTicker);
            if (stock) {
                contextData = `
                ANVÄNDAREN TITTAR PÅ: ${stock.name} (${stock.symbol})
                Pris: ${stock.price} ${stock.currency}
                Ändring: ${stock.changePercent.toFixed(2)}%
                P/E: ${stock.pe}
                Börsvärde: ${stock.marketCap}
                52v H/L: ${stock.week52Range}
                `;
            }
        }

        const systemPrompt = `
        Du är Ticko Copilot, en smart och hjälpsam trading-assistent.
        Du hjälper användare på plattformen Ticko att förstå aktiemarknaden.

        CONTEXT:
        ${contextData ? contextData : "Användaren är på startsidan/feed."}

        INSTRUKTIONER:
        - Svara på Svenska.
        - Var kortfattad (chat-format).
        - Om du får aktiedata ovan, använd den för att svara på frågor om värdering, trend, etc.
        - Om användaren frågar om "sentiment", gissa baserat på kursrörelsen om data finns (t.ex. "Med +5% idag är sentimentet troligen positivt"), men var tydlig med att du inte läst alla inlägg än.
        - Du kan INTE ge finansiell rådgivning. Säg "Detta är information, inte råd." om det behövs.
        `;

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
