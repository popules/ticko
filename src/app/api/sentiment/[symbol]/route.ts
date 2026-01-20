import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

// Simple in-memory cache
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ symbol: string }> }
) {
    const { symbol } = await params;

    // Check cache
    const cached = cache.get(symbol);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return NextResponse.json({
            symbol,
            ...cached.data,
            timestamp: new Date(cached.timestamp).toISOString(),
            cached: true
        });
    }

    try {
        // Use OpenAI to generate a sentiment analysis
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are Ticko, an AI-driven market analyst. Analyze the sentiment for a stock based on current trends, news, and social buzz. Respond ONLY with a JSON object without markdown formatting.`,
                },
                {
                    role: "user",
                    content: `Analyze the sentiment for ${symbol}. Return JSON: { "sentiment": 0-100, "upside": -20 to +20, "summary": "a short sentence", "confidence": "low"|"medium"|"high" }`,
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
                summary: "Could not analyze sentiment right now.",
                confidence: "low",
            };
        }

        // Update cache
        cache.set(symbol, { data: sentimentData, timestamp: Date.now() });

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
