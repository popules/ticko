import { NextRequest, NextResponse } from "next/server";
import YahooFinance from 'yahoo-finance2';

const yf = new YahooFinance();

// Sector definitions with curated stock lists for reliable data
// These are the most traded/popular stocks in each sector
const SECTOR_STOCKS: Record<string, string[]> = {
    technology: [
        'AAPL', 'MSFT', 'NVDA', 'META', 'GOOGL', 'AMZN', 'TSLA', 'AMD', 'INTC', 'CRM',
        'ORCL', 'ADBE', 'CSCO', 'NFLX', 'AVGO', 'QCOM', 'IBM', 'NOW', 'UBER', 'SHOP',
        'SQ', 'SNAP', 'PINS', 'RDDT', 'PLTR', 'SNOW', 'DDOG', 'ZS', 'CRWD', 'NET'
    ],
    financial: [
        'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'AXP', 'BLK', 'SCHW', 'USB',
        'PNC', 'TFC', 'COF', 'BK', 'STT', 'FITB', 'KEY', 'CFG', 'HBAN', 'MTB',
        'V', 'MA', 'PYPL', 'SQ', 'COIN', 'HOOD', 'SOFI', 'AFRM', 'NU', 'MELI'
    ],
    energy: [
        'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'HAL',
        'DVN', 'HES', 'FANG', 'BKR', 'KMI', 'WMB', 'OKE', 'TRGP', 'LNG', 'ET',
        'PXD', 'MRO', 'APA', 'NOV', 'RIG', 'DO', 'HP', 'CLR', 'AR', 'RRC'
    ],
    healthcare: [
        'UNH', 'JNJ', 'PFE', 'ABBV', 'MRK', 'LLY', 'TMO', 'ABT', 'DHR', 'BMY',
        'AMGN', 'GILD', 'CVS', 'CI', 'MDT', 'ISRG', 'REGN', 'VRTX', 'SYK', 'ZTS',
        'BIIB', 'MRNA', 'BNTX', 'ILMN', 'DXCM', 'ALGN', 'HOLX', 'IQV', 'IDXX', 'MTD'
    ],
    consumer: [
        'AMZN', 'TSLA', 'HD', 'MCD', 'NKE', 'SBUX', 'TGT', 'LOW', 'TJX', 'BKNG',
        'CMG', 'ORLY', 'AZO', 'ROST', 'DHI', 'LEN', 'GM', 'F', 'APTV', 'MGM',
        'MAR', 'HLT', 'WYNN', 'LVS', 'RCL', 'CCL', 'DAL', 'UAL', 'LUV', 'AAL'
    ]
};

interface StockMovement {
    symbol: string;
    displaySymbol: string;
    name: string;
    price: number;
    changePercent: number;
    currency: string;
}

async function getSectorMovers(sector: string): Promise<{ gainers: StockMovement[], losers: StockMovement[] }> {
    const stocks = SECTOR_STOCKS[sector];
    if (!stocks) {
        return { gainers: [], losers: [] };
    }

    try {
        const quotes = await Promise.all(
            stocks.map(async (symbol) => {
                try {
                    const quote: any = await yf.quote(symbol, {
                        fields: ['regularMarketPrice', 'regularMarketChangePercent', 'shortName', 'longName', 'currency']
                    });
                    return {
                        symbol: quote.symbol,
                        displaySymbol: quote.symbol,
                        name: quote.longName || quote.shortName || symbol,
                        price: quote.regularMarketPrice || 0,
                        changePercent: quote.regularMarketChangePercent || 0,
                        currency: quote.currency || 'USD'
                    };
                } catch {
                    return null;
                }
            })
        );

        const validQuotes = quotes.filter((q): q is StockMovement => q !== null && q.changePercent !== undefined);

        // Sort by change percent - highest first for gainers
        const sortedByGain = [...validQuotes].sort((a, b) => b.changePercent - a.changePercent);

        // Get top 5 gainers (positive change, sorted by highest gain)
        const gainers = sortedByGain.filter(s => s.changePercent > 0).slice(0, 5);

        // Get top 5 losers (negative change, sorted by biggest loss)
        const losers = sortedByGain.filter(s => s.changePercent < 0).slice(-5).reverse();

        return { gainers, losers };
    } catch (error) {
        console.error(`Sector movers error for ${sector}:`, error);
        return { gainers: [], losers: [] };
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sector = searchParams.get("sector")?.toLowerCase() || "technology";

        const validSectors = Object.keys(SECTOR_STOCKS);
        if (!validSectors.includes(sector)) {
            return NextResponse.json({
                error: `Invalid sector. Valid options: ${validSectors.join(', ')}`
            }, { status: 400 });
        }

        const result = await getSectorMovers(sector);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Sector movers fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
