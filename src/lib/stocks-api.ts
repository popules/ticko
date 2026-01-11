import YahooFinance from 'yahoo-finance2';
import OpenAI from "openai";

// Create a singleton instance for our app
const yf = new (YahooFinance as any)();

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
        // Use trending symbols to find interesting stocks
        const trending = await yf.trendingSymbols('SE'); // Start with Swedish trending
        const symbols = trending.quotes.map((q: any) => q.symbol);

        // Curated list of high-profile stocks to ensure the app feels "full"
        const curated = [
            'VOLV-B.ST', 'AZN.ST', 'SEB-A.ST', 'ERIC-B.ST', 'HM-B.ST', 'ABB.ST', 'TELIA.ST', 'INVE-B.ST', 'SAND.ST', // SE
            'TSLA', 'NVDA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'NFLX', 'AMD', 'PLTR', 'COST', 'V', 'UBER' // US
        ];

        // Combine and limit
        const allSymbols = Array.from(new Set([...symbols, ...curated]));

        // Pick 12 random symbols from the pool to keep discovery fresh
        const selectedSymbols = [...allSymbols]
            .sort(() => 0.5 - Math.random())
            .slice(0, 12);

        const stocks = await Promise.all(
            selectedSymbols.map(symbol => fetchStockData(symbol as string))
        );

        const validStocks = stocks.filter((s): s is StockData => s !== null);

        // Enhance with AI Discovery Hooks
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const enhancedStocks = await Promise.all(validStocks.map(async (stock) => {
            try {
                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [{
                        role: "system",
                        content: "Du är en trendspanare på börsen. Skriv EN kort, spännande mening (max 60 tecken) om varför denna aktie är intressant just nu. Svara på svenska."
                    }, {
                        role: "user",
                        content: `Aktie: ${stock.name} (${stock.symbol}), Pris: ${stock.price} ${stock.currency}`
                    }],
                    max_tokens: 50
                });
                return {
                    ...stock,
                    discoveryHook: completion.choices[0]?.message?.content?.replace(/"/g, '') || "Hög aktivitet i aktien just nu.",
                    bullishPercent: Math.floor(Math.random() * (95 - 45 + 1) + 45), // Random sentiment between 45-95%
                    performanceCue: Math.random() > 0.5 ? "Hög träffsäkerhet i communityn" : "Trendar starkt",
                };
            } catch (error) {
                console.error("AI Hook failed for", stock.symbol, error);
                return { ...stock, discoveryHook: "Hög aktivitet i aktien just nu." };
            }
        }));

        return enhancedStocks;
    } catch (error) {
        console.error("Discovery failed:", error);
        return [];
    }
}
