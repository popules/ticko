import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { fetchStockData } from "@/lib/stocks-api";

// Simple in-memory cache
const analysisCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ ticker: string }> }
) {
    const { ticker } = await params;
    const upperTicker = ticker.toUpperCase();

    // Check cache
    const cached = analysisCache.get(upperTicker);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json(cached.data);
    }

    try {
        // Fetch real-time stock data for context
        const stockData = await fetchStockData(upperTicker);
        if (!stockData) {
            return NextResponse.json({ error: "Stock not found" }, { status: 404 });
        }


        const systemPrompt = `You are a senior stock analyst who provides in-depth, professional analyses in English. Your task is to give a balanced but insightful analysis of stocks. ALWAYS respond in the following JSON format:

{
  "bullCase": ["Argument 1", "Argument 2", "Argument 3"],
  "bearCase": ["Argument 1", "Argument 2", "Argument 3"],
  "catalysts": ["Catalyst 1", "Catalyst 2"],
  "verdict": "STRONG BUY" | "BUY" | "HOLD" | "SELL" | "STRONG SELL",
  "verdictReason": "One sentence explaining why.",
  "riskLevel": "Low" | "Medium" | "High"
}

Keep each point concise (max 20 words). Respond ONLY with valid JSON, no other text.`;

        const userPrompt = `Analyze the stock ${stockData.name} (${upperTicker}):
- Current price: ${stockData.currencySymbol}${stockData.price.toFixed(2)}
- Change today: ${stockData.changePercent.toFixed(2)}%
- P/E ratio: ${stockData.pe.toFixed(1)}
- Market cap: ${stockData.marketCap}
- 52-week range: ${stockData.week52Range}

Provide an in-depth analysis with bull case, bear case, upcoming catalysts and your final verdict.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            max_tokens: 1000
        });

        const rawContent = completion.choices[0]?.message?.content;
        if (!rawContent) {
            throw new Error("No response from AI");
        }

        const analysis = JSON.parse(rawContent);

        const responseData = {
            ticker: upperTicker,
            name: stockData.name,
            price: stockData.price,
            currencySymbol: stockData.currencySymbol,
            changePercent: stockData.changePercent,
            ...analysis,
            generatedAt: new Date().toISOString()
        };

        // Cache the result
        analysisCache.set(upperTicker, { data: responseData, timestamp: Date.now() });

        return NextResponse.json(responseData);
    } catch (error) {
        console.error("Deep Dive Analysis failed:", error);
        return NextResponse.json(
            { error: "Failed to generate analysis" },
            { status: 500 }
        );
    }
}
