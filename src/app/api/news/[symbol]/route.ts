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
            const news = data.feed.slice(0, 5).map((item: NewsItem) => {
                // Convert Alpha Vantage date format (YYYYMMDDTHHMMSS) to ISO format
                let publishedAt = new Date().toISOString();
                if (item.time_published && item.time_published.length >= 8) {
                    const y = item.time_published.slice(0, 4);
                    const m = item.time_published.slice(4, 6);
                    const d = item.time_published.slice(6, 8);
                    const h = item.time_published.slice(9, 11) || "00";
                    const min = item.time_published.slice(11, 13) || "00";
                    publishedAt = `${y}-${m}-${d}T${h}:${min}:00Z`;
                }

                return {
                    title: item.title,
                    url: item.url,
                    source: item.source,
                    summary: item.summary?.slice(0, 200) + "...",
                    publishedAt,
                    image: item.banner_image,
                    sentiment: item.overall_sentiment_label,
                };
            });

            return NextResponse.json({ news });
        }

        // Fallback: Generate placeholder news using symbol context
        const placeholderNews = [
            {
                title: `${symbol}: Stock in Focus This Week`,
                url: "#",
                source: "Ticko Analysis",
                summary: `Ticko has analyzed the latest movements in ${symbol} and sees interesting patterns.`,
                publishedAt: new Date().toISOString(),
                sentiment: "Neutral",
            },
            {
                title: `Market Reacts to ${symbol} Quarterly Report`,
                url: "#",
                source: "Ticko News",
                summary: `Investors are closely following developments after the latest report from ${symbol}.`,
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
