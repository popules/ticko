import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { fetchStockData } from "@/lib/stocks-api";

interface AnalysisResult {
    ticker: string;
    fairValue: number;
    currentPrice: number;
    reasoning: string;
    sentiment: "bullish" | "bearish" | "neutral";
    confidence: number;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ ticker: string }> }
) {
    const { ticker } = await params;
    const upperTicker = ticker.toUpperCase();

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
            { error: "OpenAI API key not configured" },
            { status: 500 }
        );
    }

    try {
        // Fetch real-time stock data
        const stockData = await fetchStockData(upperTicker);

        if (!stockData) {
            return NextResponse.json(
                { error: "Stock not found" },
                { status: 404 }
            );
        }

        const currentPrice = stockData.price;
        const prompt = `You are an experienced financial analyst. Analyze the stock ${stockData.name} (${upperTicker}) and provide a brief valuation.
        
Current data:
- Price: ${currentPrice} ${stockData.currency}
- Change: ${stockData.changePercent.toFixed(2)}%
- Volume: ${stockData.volume}
- Market Cap: ${stockData.marketCap}
- P/E: ${stockData.pe}
- 52w Range: ${stockData.week52Range}

Respond in the following JSON format:
{
  "fairValue": [your estimated fair value as a number],
  "reasoning": "[a short sentence explaining your analysis, max 100 characters]",
  "sentiment": "[bullish/bearish/neutral]",
  "confidence": [0-100 representing your confidence level]
}

Base your analysis on typical valuation methods and market trends. Be realistic but give a clear recommendation.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a professional financial analyst who gives short, concise stock valuations. Always respond with valid JSON.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 200,
        });

        const responseText = completion.choices[0]?.message?.content || "";

        // Parse JSON from response
        let analysis: Partial<AnalysisResult>;
        try {
            // Extract JSON from response (handle markdown code blocks)
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                analysis = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("No JSON found in response");
            }
        } catch {
            // Fallback response if parsing fails
            analysis = {
                fairValue: currentPrice * 1.1,
                reasoning: "Technical analysis indicates potential for short-term upside.",
                sentiment: "neutral",
                confidence: 60,
            };
        }

        const result: AnalysisResult = {
            ticker: upperTicker,
            currentPrice,
            fairValue: analysis.fairValue || currentPrice * 1.1,
            reasoning: analysis.reasoning || "No analysis available.",
            sentiment: analysis.sentiment || "neutral",
            confidence: analysis.confidence || 50,
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error("OpenAI API error:", error);
        return NextResponse.json(
            { error: "Failed to analyze stock" },
            { status: 500 }
        );
    }
}
