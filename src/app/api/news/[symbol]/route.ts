import { NextResponse } from "next/server";

// Using Alpha Vantage News API (free tier)
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "demo";

interface NewsItem {
    title: string;
    url: string;
    source: string;
    summary: string;
    time_published: string;
    banner_image?: string;
    overall_sentiment_label?: string;
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ symbol: string }> }
) {
    const { symbol } = await params;

    try {
        // Try Alpha Vantage first
        const response = await fetch(
            `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}&limit=5`
        );

        const data = await response.json();

        if (data.feed && data.feed.length > 0) {
            const news = data.feed.slice(0, 5).map((item: NewsItem) => ({
                title: item.title,
                url: item.url,
                source: item.source,
                summary: item.summary?.slice(0, 200) + "...",
                publishedAt: item.time_published,
                image: item.banner_image,
                sentiment: item.overall_sentiment_label,
            }));

            return NextResponse.json({ news });
        }

        // Fallback: Generate placeholder news using symbol context
        const placeholderNews = [
            {
                title: `${symbol}: Aktien i fokus denna vecka`,
                url: "#",
                source: "Ticko Analys",
                summary: `Ticko har analyserat de senaste rörelserna i ${symbol} och ser intressanta mönster.`,
                publishedAt: new Date().toISOString(),
                sentiment: "Neutral",
            },
            {
                title: `Marknaden reagerar på ${symbol} kvartalsrapport`,
                url: "#",
                source: "Ticko Nyheter",
                summary: `Investerare följer noga utvecklingen efter den senaste rapporten från ${symbol}.`,
                publishedAt: new Date(Date.now() - 3600000).toISOString(),
                sentiment: "Bullish",
            },
        ];

        return NextResponse.json({ news: placeholderNews });
    } catch (error) {
        console.error("News API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch news", news: [] },
            { status: 500 }
        );
    }
}
