import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ symbol: string }> }
) {
    const { symbol } = await params;

    try {
        // Use OpenAI to generate a sentiment analysis
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Du är Ticko, en AI-driven marknadsanalytiker. Analysera sentimentet för en aktie baserat på aktuella trender, nyheter och social buzz. Svara ENDAST med ett JSON-objekt utan markdown-formatering.`,
                },
                {
                    role: "user",
                    content: `Analysera sentimentet för ${symbol}. Returnera JSON: { "sentiment": 0-100, "upside": -20 till +20, "summary": "en kort mening", "confidence": "low"|"medium"|"high" }`,
                },
            ],
            max_tokens: 200,
            temperature: 0.7,
        });

        const responseText = completion.choices[0]?.message?.content || "{}";

        // Parse the response
        let sentimentData;
        try {
            sentimentData = JSON.parse(responseText.replace(/```json\n?|```/g, "").trim());
        } catch {
            // Fallback if parsing fails
            sentimentData = {
                sentiment: 50,
                upside: 0,
                summary: "Kunde inte analysera sentimentet just nu.",
                confidence: "low",
            };
        }

        return NextResponse.json({
            symbol,
            ...sentimentData,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Sentiment API error:", error);
        return NextResponse.json(
            { error: "Failed to analyze sentiment" },
            { status: 500 }
        );
    }
}
