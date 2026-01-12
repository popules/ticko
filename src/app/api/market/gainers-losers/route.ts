import { NextResponse } from "next/server";
import YahooFinance from 'yahoo-finance2';

const yf = new YahooFinance();

// Common Swedish and US stocks to check for gainers/losers
const SCREENER_SYMBOLS = [
    // US Large Cap
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK-B', 'JPM', 'V',
    'UNH', 'XOM', 'JNJ', 'WMT', 'MA', 'PG', 'HD', 'CVX', 'MRK', 'ABBV',
    'COST', 'PEP', 'KO', 'ADBE', 'CRM', 'NFLX', 'AMD', 'INTC', 'CSCO', 'ORCL',
    // Swedish Stocks
    'VOLV-B.ST', 'ERIC-B.ST', 'SEB-A.ST', 'SWED-A.ST', 'HM-B.ST', 'AZN.ST',
    'INVE-B.ST', 'SAND.ST', 'ASSA-B.ST', 'ABB.ST', 'TELIA.ST', 'SHB-A.ST',
    'SAAB-B.ST', 'SKF-B.ST', 'NDA-SE.ST', 'ALFA.ST', 'EVO.ST', 'SINCH.ST'
];

export async function GET() {
    try {
        // Fetch quotes for all symbols
        const quotes = await Promise.all(
            SCREENER_SYMBOLS.map(async (symbol) => {
                try {
                    const quote: any = await yf.quote(symbol, {
                        fields: ['regularMarketPrice', 'regularMarketChangePercent', 'regularMarketChange', 'shortName', 'longName', 'currency']
                    });
                    return {
                        symbol: quote.symbol,
                        name: quote.longName || quote.shortName || quote.symbol,
                        price: quote.regularMarketPrice,
                        change: quote.regularMarketChange,
                        changePercent: quote.regularMarketChangePercent,
                        currency: quote.currency
                    };
                } catch {
                    return null;
                }
            })
        );

        // Filter out failed fetches
        const validQuotes = quotes.filter((q): q is NonNullable<typeof q> => q !== null && q.changePercent !== undefined);

        // Sort for gainers (highest % first) and losers (lowest % first)
        const sorted = [...validQuotes].sort((a, b) => b.changePercent - a.changePercent);

        const gainers = sorted.slice(0, 5).map(q => ({
            ...q,
            displaySymbol: q.symbol.replace('.ST', '')
        }));

        const losers = sorted.slice(-5).reverse().map(q => ({
            ...q,
            displaySymbol: q.symbol.replace('.ST', '')
        }));

        return NextResponse.json({ gainers, losers });
    } catch (error: any) {
        console.error("Gainers/Losers fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
