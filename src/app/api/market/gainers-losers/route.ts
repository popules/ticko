import { NextRequest, NextResponse } from "next/server";
import YahooFinance from 'yahoo-finance2';

const yf = new YahooFinance();

// Swedish stocks for manual screening (Yahoo doesn't have a screener for OMX)
const SWEDISH_STOCKS = [
    'VOLV-B.ST', 'ERIC-B.ST', 'SEB-A.ST', 'SWED-A.ST', 'HM-B.ST', 'AZN.ST',
    'INVE-B.ST', 'SAND.ST', 'ASSA-B.ST', 'ABB.ST', 'TELIA.ST', 'SHB-A.ST',
    'SAAB-B.ST', 'SKF-B.ST', 'NDA-SE.ST', 'ALFA.ST', 'EVO.ST', 'SINCH.ST',
    'ATCO-A.ST', 'ATCO-B.ST', 'BOL.ST', 'ESSITY-B.ST', 'HEXA-B.ST', 'KINV-B.ST',
    'LUND-B.ST', 'SCA-B.ST', 'SECU-B.ST', 'TEL2-B.ST', 'TREL-B.ST', 'ELUX-B.ST'
];

interface StockMovement {
    symbol: string;
    displaySymbol: string;
    name: string;
    price: number;
    changePercent: number;
    currency: string;
}

// Fetch Swedish stocks manually
async function getSwedishMovers(): Promise<{ gainers: StockMovement[], losers: StockMovement[] }> {
    try {
        const quotes = await Promise.all(
            SWEDISH_STOCKS.map(async (symbol) => {
                try {
                    const quote: any = await yf.quote(symbol, {
                        fields: ['regularMarketPrice', 'regularMarketChangePercent', 'shortName', 'longName', 'currency']
                    });
                    return {
                        symbol: quote.symbol,
                        displaySymbol: symbol.replace('.ST', ''),
                        name: quote.longName || quote.shortName || symbol,
                        price: quote.regularMarketPrice || 0,
                        changePercent: quote.regularMarketChangePercent || 0,
                        currency: quote.currency || 'SEK'
                    };
                } catch {
                    return null;
                }
            })
        );

        const validQuotes = quotes.filter((q): q is StockMovement => q !== null && q.changePercent !== undefined);
        const sorted = [...validQuotes].sort((a, b) => b.changePercent - a.changePercent);

        return {
            gainers: sorted.filter(s => s.changePercent > 0).slice(0, 5),
            losers: sorted.filter(s => s.changePercent < 0).slice(-5).reverse()
        };
    } catch (error) {
        console.error("Swedish movers error:", error);
        return { gainers: [], losers: [] };
    }
}

// Fetch US stocks using Yahoo Finance screener
async function getUSMovers(): Promise<{ gainers: StockMovement[], losers: StockMovement[] }> {
    try {
        // Try to use screener for US stocks
        let gainers: StockMovement[] = [];
        let losers: StockMovement[] = [];

        try {
            // Yahoo Finance top gainers screener
            const gainersResult: any = await yf.screener({
                scrIds: "day_gainers",
                count: 10
            });

            if (gainersResult?.quotes) {
                gainers = gainersResult.quotes.slice(0, 5).map((q: any) => ({
                    symbol: q.symbol,
                    displaySymbol: q.symbol,
                    name: q.longName || q.shortName || q.symbol,
                    price: q.regularMarketPrice || 0,
                    changePercent: q.regularMarketChangePercent || 0,
                    currency: q.currency || 'USD'
                }));
            }
        } catch (screenerError) {
            console.error("Screener error for gainers:", screenerError);
        }

        try {
            // Yahoo Finance top losers screener
            const losersResult: any = await yf.screener({
                scrIds: "day_losers",
                count: 10
            });

            if (losersResult?.quotes) {
                losers = losersResult.quotes.slice(0, 5).map((q: any) => ({
                    symbol: q.symbol,
                    displaySymbol: q.symbol,
                    name: q.longName || q.shortName || q.symbol,
                    price: q.regularMarketPrice || 0,
                    changePercent: q.regularMarketChangePercent || 0,
                    currency: q.currency || 'USD'
                }));
            }
        } catch (screenerError) {
            console.error("Screener error for losers:", screenerError);
        }

        // Fallback to manual list if screener fails
        if (gainers.length === 0 || losers.length === 0) {
            const US_FALLBACK = [
                'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM', 'V',
                'UNH', 'XOM', 'JNJ', 'WMT', 'MA', 'PG', 'HD', 'CVX', 'MRK', 'ABBV',
                'COST', 'PEP', 'KO', 'ADBE', 'CRM', 'NFLX', 'AMD', 'INTC', 'CSCO', 'ORCL'
            ];

            const quotes = await Promise.all(
                US_FALLBACK.map(async (symbol) => {
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

            const validQuotes = quotes.filter((q): q is StockMovement => q !== null);
            const sorted = [...validQuotes].sort((a, b) => b.changePercent - a.changePercent);

            if (gainers.length === 0) {
                gainers = sorted.filter(s => s.changePercent > 0).slice(0, 5);
            }
            if (losers.length === 0) {
                losers = sorted.filter(s => s.changePercent < 0).slice(-5).reverse();
            }
        }

        return { gainers, losers };
    } catch (error) {
        console.error("US movers error:", error);
        return { gainers: [], losers: [] };
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const market = searchParams.get("market") || "all";

        let result: { gainers: StockMovement[], losers: StockMovement[] };

        if (market === "se") {
            result = await getSwedishMovers();
        } else if (market === "us") {
            result = await getUSMovers();
        } else {
            // Combined: fetch both and merge
            const [usData, seData] = await Promise.all([
                getUSMovers(),
                getSwedishMovers()
            ]);

            // Merge and sort
            const allGainers = [...usData.gainers, ...seData.gainers]
                .sort((a, b) => b.changePercent - a.changePercent)
                .slice(0, 5);

            const allLosers = [...usData.losers, ...seData.losers]
                .sort((a, b) => a.changePercent - b.changePercent)
                .slice(0, 5);

            result = { gainers: allGainers, losers: allLosers };
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Gainers/Losers fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
