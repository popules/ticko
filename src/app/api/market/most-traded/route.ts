import { NextResponse } from "next/server";
import YahooFinance from 'yahoo-finance2';

const yf = new YahooFinance();

// Stocks to check for volume - focusing on most liquid markets
const VOLUME_SYMBOLS = [
    // US High Volume Stocks
    'AAPL', 'TSLA', 'NVDA', 'AMD', 'AMZN', 'META', 'MSFT', 'GOOGL', 'NFLX', 'SPY',
    'QQQ', 'PLTR', 'INTC', 'BAC', 'F', 'T', 'PFE', 'AAL', 'NIO', 'SOFI',
    // Swedish High Volume
    'VOLV-B.ST', 'ERIC-B.ST', 'HM-B.ST', 'SEB-A.ST', 'SWED-A.ST', 'EVO.ST',
    'SAAB-B.ST', 'INVE-B.ST', 'AZN.ST', 'ABB.ST'
];

export async function GET() {
    try {
        const quotes = await Promise.all(
            VOLUME_SYMBOLS.map(async (symbol) => {
                try {
                    const quote: any = await yf.quote(symbol, {
                        fields: ['regularMarketPrice', 'regularMarketChangePercent', 'regularMarketVolume', 'shortName', 'longName', 'currency']
                    });
                    return {
                        symbol: quote.symbol,
                        name: quote.longName || quote.shortName || quote.symbol,
                        price: quote.regularMarketPrice,
                        changePercent: quote.regularMarketChangePercent,
                        volume: quote.regularMarketVolume,
                        currency: quote.currency
                    };
                } catch {
                    return null;
                }
            })
        );

        // Filter and sort by volume (highest first)
        const validQuotes = quotes.filter((q): q is NonNullable<typeof q> => q !== null && q.volume !== undefined);
        const sorted = [...validQuotes].sort((a, b) => b.volume - a.volume);

        const mostTraded = sorted.slice(0, 8).map(q => ({
            ...q,
            displaySymbol: q.symbol.replace('.ST', ''),
            volumeFormatted: formatVolume(q.volume)
        }));

        return NextResponse.json({ mostTraded });
    } catch (error: any) {
        console.error("Most traded fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function formatVolume(vol: number): string {
    if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`;
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`;
    if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`;
    return vol.toLocaleString();
}
