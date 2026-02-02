import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";
import { fetchStockData } from "@/lib/stocks-api";
import { checkAndIncrementAIUsage, createLimitReachedResponse } from "@/lib/ai-metering";

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

    try {
        // 1. Authenticate with standard server client
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Check AI usage metering
        const metering = await checkAndIncrementAIUsage(supabase, user.id);
        if (!metering.allowed) {
            return NextResponse.json(createLimitReachedResponse(), { status: 402 });
        }

        // 3. Check if OpenAI is configured
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "OpenAI API key not configured" },
                { status: 500 }
            );
        }

        // 4. Fetch real-time stock data
        const stockData = await fetchStockData(upperTicker);

        if (!stockData) {
            return NextResponse.json(
                { error: "Stock not found" },
                { status: 404 }
            );
        }

        const currentPrice = stockData.price;
        const prompt = `You are an experienced financial analyst. Analyze ${stockData.name} (${upperTicker}) and provide a concise valuation.
        
Current Data:
- Price: ${currentPrice} ${stockData.currency}
- Change: ${stockData.changePercent.toFixed(2)}%
- Volume: ${stockData.volume}
- Market Cap: ${stockData.marketCap}
- P/E Rel: ${stockData.pe}
- 52w Range: ${stockData.week52Range}

Respond ONLY with valid JSON in this format:
{
  "fairValue": number,
  "reasoning": "short sentence max 100 chars",
  "sentiment": "bullish" | "bearish" | "neutral",
  "confidence": number (0-100)
}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a professional financial analyst. Always respond with valid JSON.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            response_format: { type: "json_object" },
            temperature: 0.5,
            max_tokens: 300,
        });

        const responseText = completion.choices[0]?.message?.content || "{}";
        let analysis: Partial<AnalysisResult>;

        try {
            analysis = JSON.parse(responseText);
        } catch {
            // Robust parsing fallback
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                analysis = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("Invalid AI response");
            }
        }

        const result: AnalysisResult = {
            ticker: upperTicker,
            currentPrice,
            fairValue: analysis.fairValue || currentPrice * 1.05,
            reasoning: analysis.reasoning || "Technical indicators suggest neutral momentum.",
            sentiment: (analysis.sentiment as any) || "neutral",
            confidence: analysis.confidence || 50,
        };

        return NextResponse.json(result);
    } catch (error: any) {
        console.error(`[AI Analyze Error] ${upperTicker}:`, error);
        return NextResponse.json(
            { error: error?.message || "Failed to analyze stock" },
            { status: 500 }
        );
    }
}
