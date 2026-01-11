import { NextResponse } from "next/server";
import OpenAI from "openai";
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

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const systemPrompt = `Du är en senior aktieanalytiker som ger djupgående, professionella analyser på svenska. Din uppgift är att ge en balanserad men insiktsfull analys av aktier. Svara ALLTID i följande JSON-format:

{
  "bullCase": ["Argument 1", "Argument 2", "Argument 3"],
  "bearCase": ["Argument 1", "Argument 2", "Argument 3"],
  "catalysts": ["Katalysator 1", "Katalysator 2"],
  "verdict": "STARK KÖPARE" | "KÖPARE" | "HÅLL" | "SÄLJ" | "STARK SÄLJARE",
  "verdictReason": "En mening som förklarar varför.",
  "riskLevel": "Låg" | "Medel" | "Hög"
}

Håll varje punkt koncis (max 20 ord). Svara ENDAST med valid JSON, ingen annan text.`;

        const userPrompt = `Analysera aktien ${stockData.name} (${upperTicker}):
- Nuvarande pris: ${stockData.currencySymbol}${stockData.price.toFixed(2)}
- Förändring idag: ${stockData.changePercent.toFixed(2)}%
- P/E-tal: ${stockData.pe.toFixed(1)}
- Börsvärde: ${stockData.marketCap}
- 52-veckorsintervall: ${stockData.week52Range}

Ge en djupgående analys med bull case, bear case, kommande katalysatorer och din slutgiltiga bedömning.`;

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
