import YahooFinance from 'yahoo-finance2';
import { openai } from './openai';

// Create a singleton instance for our app
const yf = new YahooFinance();

export interface StockData {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: string;
    marketCap: string;
    pe: number;
    week52Range: string;
    currency: string;
    currencySymbol: string;
    discoveryHook?: string;
    bullishPercent?: number;
    performanceCue?: string;
}

function getCurrencySymbol(currency: string): string {
    switch (currency) {
        case 'USD': return '$';
        case 'SEK': return 'kr';
        case 'EUR': return '€';
        case 'GBP': return '£';
        case 'DKK': return 'kr';
        case 'NOK': return 'kr';
        default: return currency;
    }
}

export async function fetchStockData(ticker: string): Promise<StockData | null> {
    try {
        // Use the instance we created
        const quote: any = await yf.quote(ticker, { fields: ['regularMarketPrice', 'regularMarketChange', 'regularMarketChangePercent', 'regularMarketVolume', 'marketCap', 'forwardPE', 'trailingPE', 'fiftyTwoWeekLow', 'fiftyTwoWeekHigh', 'currency', 'longName', 'shortName'] });

        if (!quote) return null;

        const currency = quote.currency || 'USD';
        const currencySymbol = getCurrencySymbol(currency);

        return {
            symbol: quote.symbol,
            name: quote.longName || quote.shortName || quote.symbol,
            price: quote.regularMarketPrice || 0,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0,
            volume: formatCount(quote.regularMarketVolume),
            marketCap: formatCurrencyValue(quote.marketCap, currencySymbol),
            pe: quote.forwardPE || quote.trailingPE || 0,
            week52Range: format52WeekRange(quote.fiftyTwoWeekLow, quote.fiftyTwoWeekHigh, currencySymbol),
            currency: currency,
            currencySymbol: currencySymbol,
        };
    } catch (error) {
        console.error(`Error fetching data for ${ticker}:`, error);
        return null;
    }
}

export async function fetchBatchStockData(tickers: string[]): Promise<Record<string, number>> {
    const prices: Record<string, number> = {};
    if (tickers.length === 0) return prices;

    // chunk requests to avoid URL length issues or timeouts
    const CHUNK_SIZE = 50;
    for (let i = 0; i < tickers.length; i += CHUNK_SIZE) {
        const chunk = tickers.slice(i, i + CHUNK_SIZE);
        try {
            const results = await yf.quote(chunk, { fields: ['regularMarketPrice', 'currency'] });

            // Handle single result vs array
            const quotes = Array.isArray(results) ? results : [results];

            quotes.forEach((q: any) => {
                if (q && q.symbol && q.regularMarketPrice) {
                    prices[q.symbol] = q.regularMarketPrice;
                }
            });
        } catch (error) {
            console.error(`Error fetching batch data for chunk ${i}:`, error);
        }
    }

    return prices;
}

function formatCurrencyValue(num: number | undefined, symbol: string): string {
    if (num === undefined) return 'N/A';

    let formatted = "";
    if (num >= 1e12) formatted = `${(num / 1e12).toFixed(1)}T`;
    else if (num >= 1e9) formatted = `${(num / 1e9).toFixed(1)}B`;
    else if (num >= 1e6) formatted = `${(num / 1e6).toFixed(1)}M`;
    else formatted = num.toLocaleString();

    // Swedish style currency formatting
    if (symbol === 'kr') {
        return `${formatted} kr`;
    }
    return `${symbol}${formatted}`;
}

function formatCount(num: number | undefined): string {
    if (num === undefined) return 'N/A';
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
}

function format52WeekRange(low: number | undefined, high: number | undefined, symbol: string): string {
    if (low === undefined || high === undefined) return 'N/A';
    if (symbol === 'kr') {
        return `${low.toFixed(2)} - ${high.toFixed(2)} kr`;
    }
    return `${symbol}${low.toFixed(2)} - ${symbol}${high.toFixed(2)}`;
}

export async function fetchDiscoveryStocks(): Promise<StockData[]> {
    try {
        // Core curated list to ALWAYS be available
        const curated = [
            'VOLV-B.ST', 'AZN.ST', 'SEB-A.ST', 'ERIC-B.ST', 'HM-B.ST', 'ABB.ST', 'TELIA.ST', 'INVE-B.ST', 'SAND.ST', // SE
            'TSLA', 'NVDA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'NFLX', 'AMD', 'PLTR', 'COST', 'V', 'UBER' // US
        ];

        // 1. Try to fetch trending symbols from Yahoo
        let symbols = [...curated];
        try {
            const trending: any = await yf.trendingSymbols('SE'); // Start with Swedish trending
            if (trending?.quotes) {
                symbols = [...new Set([...symbols, ...trending.quotes.map((q: any) => q.symbol)])];
            }
        } catch (e) {
            console.warn("Yahoo trending fetch failed, using curated list.");
        }

        // 2. Pick 10 random symbols to keep it snappy
        const selectedSymbols = symbols
            .sort(() => 0.5 - Math.random())
            .slice(0, 10);

        // 3. Fetch basic stock data (Parallel)
        const stocks = await Promise.all(
            selectedSymbols.map(symbol => fetchStockData(symbol))
        );

        const validStocks = stocks.filter((s): s is StockData => s !== null);

        // 4. Enhance with AI hooks (Optional - fail gracefully)
        const enhancedStocks = await Promise.all(validStocks.map(async (stock) => {
            try {
                // Quick check to skip AI if key is missing
                if (!process.env.OPENAI_API_KEY) throw new Error("No API key");

                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [{
                        role: "system",
                        content: "You are a trend scout. A short sentence (max 6 words) about the stock. No financial advice."
                    }, {
                        role: "user",
                        content: `Aktie: ${stock.name} (${stock.symbol}), Pris: ${stock.price} ${stock.currency}`
                    }],
                    max_tokens: 30
                });
                return {
                    ...stock,
                    discoveryHook: completion.choices[0]?.message?.content?.replace(/"/g, '') || "High activity right now.",
                    bullishPercent: Math.floor(Math.random() * (95 - 45 + 1) + 45),
                    performanceCue: Math.random() > 0.5 ? "High Accuracy" : "Strong Trend",
                };
            } catch (error) {
                // Fallback hooks if AI fails
                const fallbacks = [
                    "High activity in community",
                    "Strong trend right now",
                    "Many watchers",
                    "Volatile movement today",
                    "Interesting levels"
                ];
                return {
                    ...stock,
                    discoveryHook: fallbacks[Math.floor(Math.random() * fallbacks.length)],
                    bullishPercent: Math.floor(Math.random() * (95 - 45 + 1) + 45),
                    performanceCue: "Popular Today",
                };
            }
        }));

        return enhancedStocks;
    } catch (error) {
        console.error("Discovery failed completely:", error);
        return [];
    }
}


function getMarketLabel(exchange: string, symbol: string): string {
    // Check suffixes first for Nordic markets
    if (symbol.endsWith('.ST')) return '🇸🇪 OMX Sthlm';
    if (symbol.endsWith('.OL')) return '🇳🇴 Oslo SE';
    if (symbol.endsWith('.CO')) return '🇩🇰 Copenhagen';
    if (symbol.endsWith('.HE')) return '🇫🇮 Helsinki';

    // Check exchange codes
    switch (exchange) {
        // Swedish
        case 'STO': return '🇸🇪 OMX Sthlm';
        // US
        case 'NMS': return '🇺🇸 NASDAQ';
        case 'NGM': return '🇺🇸 NASDAQ';
        case 'NCM': return '🇺🇸 NASDAQ CM';
        case 'NYQ': return '🇺🇸 NYSE';
        case 'ASE': return '🇺🇸 AMEX';
        case 'PCX': return '🇺🇸 NYSE Arca';
        case 'BTS': return '🇺🇸 BATS';
        case 'PNK': return '🇺🇸 OTC Pink';
        case 'OTC': return '🇺🇸 OTC';
        case 'OQB': return '🇺🇸 OTC QB';
        case 'OPR': return '🇺🇸 Options';
        // Canada
        case 'VAN': return '🇨🇦 TSX Venture';
        case 'TOR': return '🇨🇦 TSX';
        case 'NEO': return '🇨🇦 NEO';
        case 'CNQ': return '🇨🇦 CSE';
        // Europe
        case 'LSE': return '🇬🇧 London';
        case 'GER': return '🇩🇪 XETRA';
        case 'FRA': return '🇩🇪 Frankfurt';
        case 'MUN': return '🇩🇪 München';
        case 'STU': return '🇩🇪 Stuttgart';
        case 'PAR': return '🇫🇷 Paris';
        case 'AMS': return '🇳🇱 Amsterdam';
        case 'BRU': return '🇧🇪 Brussels';
        case 'MIL': return '🇮🇹 Milan';
        case 'MAD': return '🇪🇸 Madrid';
        // Crypto
        case 'CCC': return '🪙 Crypto';
        default: return exchange || '';
    }
}

export async function searchStocks(query: string) {
    try {
        const results: any = await yf.search(query);
        const queryUpper = query.toUpperCase();
        const queryLower = query.toLowerCase();

        // Score each result for relevance
        const scoredResults = results.quotes
            .filter((q: any) => q.isYahooFinance === true || q.quoteType === 'EQUITY' || q.quoteType === 'INDEX' || q.quoteType === 'ETF')
            .map((q: any) => {
                const symbol = q.symbol || '';
                const symbolUpper = symbol.toUpperCase();
                const symbolBase = symbolUpper.split('.')[0].split('-')[0]; // SAAB-B.ST -> SAAB
                const type = q.quoteType || '';
                const name = q.longname || q.shortname || '';
                const nameLower = name.toLowerCase();
                const exchange = q.exchange || '';

                let score = 0;

                // === CRITICAL: Symbol must relate to query ===
                const symbolContainsQuery = symbolUpper.includes(queryUpper);
                const queryContainsSymbolBase = queryUpper.includes(symbolBase) || symbolBase.includes(queryUpper);
                const nameContainsQuery = nameLower.includes(queryLower);

                // If NEITHER symbol NOR name contains the query, heavily penalize
                if (!symbolContainsQuery && !queryContainsSymbolBase && !nameContainsQuery) {
                    score -= 500; // This result is probably irrelevant
                }

                // === Symbol matching (highest priority) ===
                if (symbolUpper === queryUpper) score += 1000; // Exact match
                if (symbolBase === queryUpper) score += 900; // Base symbol match (SAAB-B.ST == SAAB)
                if (symbolUpper.startsWith(queryUpper)) score += 600; // Starts with query
                if (symbolContainsQuery) score += 300; // Contains query

                // === Type priority: EQUITY > INDEX > ETF ===
                if (type === 'EQUITY') score += 300;
                if (type === 'INDEX') score += 150;
                if (type === 'ETF') score -= 100; // ETFs are penalized by default

                // === Exchange priority ===
                // Swedish stocks
                if (symbol.endsWith('.ST')) score += 150;
                // US main exchanges (no suffix)
                if (!symbol.includes('.') && ['NMS', 'NYQ', 'NGM', 'NCM', 'ASE'].includes(exchange)) score += 100;
                // Canadian main
                if (exchange === 'TOR') score += 50;

                // === Penalize problematic exchanges ===
                if (exchange === 'PNK') score -= 80; // Pink sheets
                if (exchange === 'OTC') score -= 80;
                if (exchange === 'OQB') score -= 50; // OTC QB is slightly better
                if (exchange === 'VAN') score -= 30; // TSX Venture is speculative
                // Foreign listings of same stock
                if (symbol.endsWith('.F')) score -= 100; // Frankfurt ADR
                if (symbol.endsWith('.MU')) score -= 100; // Munich
                if (symbol.endsWith('.SG')) score -= 100; // Stuttgart
                if (symbol.endsWith('.SW')) score -= 50; // Swiss

                // === HEAVILY penalize derivatives and leveraged products ===
                if (nameLower.includes('leverage')) score -= 300;
                if (nameLower.includes('2x long')) score -= 300;
                if (nameLower.includes('2x short')) score -= 300;
                if (nameLower.includes('3x long')) score -= 300;
                if (nameLower.includes('3x short')) score -= 300;
                if (nameLower.includes('bull ')) score -= 200;
                if (nameLower.includes('bear ')) score -= 200;
                if (nameLower.includes(' etf')) score -= 150;
                if (nameLower.includes('daily')) score -= 100; // Daily ETFs
                if (nameLower.includes('ultra')) score -= 200;
                if (nameLower.includes('proshares')) score -= 150;
                if (nameLower.includes('direxion')) score -= 150;
                if (nameLower.includes('yield')) score -= 50;
                if (type === 'OPTION') score -= 500;

                // === Boost if company name contains query ===
                if (nameContainsQuery) score += 100;

                return {
                    symbol: q.symbol,
                    name: q.longname || q.shortname || q.symbol,
                    type: q.quoteType,
                    exchange: q.exchange,
                    market: getMarketLabel(q.exchange, q.symbol),
                    _score: score
                };
            })
            .filter((r: any) => r._score > -200) // Filter out clearly irrelevant results
            .sort((a: any, b: any) => b._score - a._score) // Sort by score descending
            .slice(0, 5) // Limit to top 5
            .map(({ _score, ...rest }: any) => rest); // Remove internal score

        return scoredResults;
    } catch (error) {
        console.error("Stock search failed:", error);
        return [];
    }
}
