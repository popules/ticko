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
                        content: "Du är en trendspanare. En kort mening (max 6 ord) om aktien. Ingen finansiell rådgivning. Svara på svenska."
                    }, {
                        role: "user",
                        content: `Aktie: ${stock.name} (${stock.symbol}), Pris: ${stock.price} ${stock.currency}`
                    }],
                    max_tokens: 30
                });
                return {
                    ...stock,
                    discoveryHook: completion.choices[0]?.message?.content?.replace(/"/g, '') || "Hög aktivitet i aktien just nu.",
                    bullishPercent: Math.floor(Math.random() * (95 - 45 + 1) + 45),
                    performanceCue: Math.random() > 0.5 ? "Hög träffsäkerhet i communityn" : "Trendar starkt",
                };
            } catch (error) {
                // Fallback hooks if AI fails
                const fallbacks = [
                    "Hög aktivitet i communityn",
                    "Trendar starkt just nu",
                    "Många sparare bevakar denna",
                    "Volatila rörelser idag",
                    "Intresseväckande nivåer"
                ];
                return {
                    ...stock,
                    discoveryHook: fallbacks[Math.floor(Math.random() * fallbacks.length)],
                    bullishPercent: Math.floor(Math.random() * (95 - 45 + 1) + 45),
                    performanceCue: "Populär i dag",
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
    if (symbol.endsWith('.OL')) return '🇳🇴 Oslo Börs';
    if (symbol.endsWith('.CO')) return '🇩🇰 Köpenhamn';
    if (symbol.endsWith('.HE')) return '🇫🇮 Helsingfors';

    // Check exchange codes
    switch (exchange) {
        case 'STO': return '🇸🇪 OMX Sthlm';
        case 'NMS': return '🇺🇸 NASDAQ';
        case 'NGM': return '🇺🇸 NASDAQ';
        case 'NYQ': return '🇺🇸 NYSE';
        case 'ASE': return '🇺🇸 AMEX';
        case 'PNK': return '🇺🇸 OTC';
        case 'OTC': return '🇺🇸 OTC';
        case 'VAN': return '🇨🇦 TSX Venture';
        case 'TOR': return '🇨🇦 TSX';
        case 'LSE': return '🇬🇧 London';
        case 'GER': return '🇩🇪 XETRA';
        case 'PAR': return '🇫🇷 Paris';
        case 'AMS': return '🇳🇱 Amsterdam';
        case 'BRU': return '🇧🇪 Bryssel';
        case 'CCC': return 'Crypto';
        default: return exchange || 'Globally';
    }
}

export async function searchStocks(query: string) {
    try {
        const results: any = await yf.search(query);

        // Score each result for relevance
        const scoredResults = results.quotes
            .filter((q: any) => q.isYahooFinance === true || q.quoteType === 'EQUITY' || q.quoteType === 'INDEX' || q.quoteType === 'ETF')
            .map((q: any) => {
                const symbol = q.symbol || '';
                const type = q.quoteType || '';
                const name = q.longname || q.shortname || '';
                const exchange = q.exchange || '';
                const queryUpper = query.toUpperCase();

                let score = 0;

                // Exact symbol match (highest priority)
                if (symbol.toUpperCase() === queryUpper) score += 1000;
                if (symbol.toUpperCase().startsWith(queryUpper + '.')) score += 500; // e.g. SAAB-B.ST matches SAAB
                if (symbol.toUpperCase().split('.')[0].split('-')[0] === queryUpper) score += 800; // SAAB-B.ST == SAAB

                // EQUITY over ETF (much higher priority)
                if (type === 'EQUITY') score += 200;
                if (type === 'INDEX') score += 150;
                if (type === 'ETF') score += 10; // ETFs get low score

                // Main exchange priority
                // Swedish stocks on Stockholm (.ST)
                if (symbol.endsWith('.ST')) score += 100;
                // US stocks on NASDAQ/NYSE (no suffix usually)
                if (!symbol.includes('.') && (exchange === 'NMS' || exchange === 'NYQ' || exchange === 'NGM')) score += 100;

                // Penalize OTC/pink sheets and foreign listings
                if (symbol.endsWith('.F')) score -= 50; // Frankfurt
                if (symbol.endsWith('.SW')) score -= 30; // Swiss
                if (exchange === 'PNK') score -= 100; // Pink sheets
                if (exchange === 'OTC') score -= 100; // OTC

                // Penalize derivatives and complex instruments
                if (name.toLowerCase().includes('etf')) score -= 50;
                if (name.toLowerCase().includes('bull 2x')) score -= 100;
                if (name.toLowerCase().includes('bear 2x')) score -= 100;
                if (name.toLowerCase().includes('leveraged')) score -= 100;
                if (name.toLowerCase().includes('yield')) score -= 50;
                if (name.toLowerCase().includes('option')) score -= 100;

                // Boost if company name contains query
                if (name.toLowerCase().includes(query.toLowerCase())) score += 50;

                return {
                    symbol: q.symbol,
                    name: q.longname || q.shortname || q.symbol,
                    type: q.quoteType,
                    exchange: q.exchange,
                    market: getMarketLabel(q.exchange, q.symbol),
                    _score: score
                };
            })
            .sort((a: any, b: any) => b._score - a._score) // Sort by score descending
            .slice(0, 5) // Limit to top 5
            .map(({ _score, ...rest }: any) => rest); // Remove internal score

        return scoredResults;
    } catch (error) {
        console.error("Stock search failed:", error);
        return [];
    }
}
