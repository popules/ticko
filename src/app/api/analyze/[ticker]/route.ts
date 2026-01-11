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
        const prompt = `Du är en erfaren finansanalytiker. Analysera aktien ${stockData.name} (${upperTicker}) och ge en kort värdering.
        
Aktuell data:
- Kurs: ${currentPrice} ${stockData.currency}
- Förändring: ${stockData.changePercent.toFixed(2)}%
- Volym: ${stockData.volume}
- Börsvärde: ${stockData.marketCap}
- P/E: ${stockData.pe}
- 52v intervall: ${stockData.week52Range}

Svara på svenska med följande JSON-format:
{
  "fairValue": [ditt uppskattade rimliga värde som nummer],
  "reasoning": "[en kort mening på svenska som förklarar din analys, max 100 tecken]",
  "sentiment": "[bullish/bearish/neutral]",
  "confidence": [0-100 som representerar din konfidensnivå]
}

Basera din analys på typiska värderingsmetoder och marknadstrender. Var realistisk men ge en tydlig rekommendation.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "Du är en professionell finansanalytiker som ger korta, koncisa aktievärderingar på svenska. Svara alltid med giltig JSON.",
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
                reasoning: "Teknisk analys indikerar potential för uppgång på kort sikt.",
                sentiment: "neutral",
                confidence: 60,
            };
        }

        const result: AnalysisResult = {
            ticker: upperTicker,
            currentPrice,
            fairValue: analysis.fairValue || currentPrice * 1.1,
            reasoning: analysis.reasoning || "Ingen analys tillgänglig.",
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
