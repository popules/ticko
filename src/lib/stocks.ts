export interface Stock {
    symbol: string;
    name: string;
    price: number;
    change: number;
    volume: string;
    marketCap: string;
    pe: number;
    sentiment?: number; // 0-100 bullish percentage
}

// Fallback stocks if API fails or for initial UI
export const STOCKS: Record<string, Stock> = {
    TSLA: {
        symbol: "TSLA",
        name: "Tesla, Inc.",
        price: 245.50,
        change: 3.42,
        volume: "98.2M",
        marketCap: "$780.5B",
        pe: 68.4,
        sentiment: 72,
    },
    AAPL: {
        symbol: "AAPL",
        name: "Apple Inc.",
        price: 178.25,
        change: 0.89,
        volume: "52.1M",
        marketCap: "$2.8T",
        pe: 28.5,
        sentiment: 65,
    },
    MSFT: {
        symbol: "MSFT",
        name: "Microsoft Corporation",
        price: 385.45,
        change: 1.25,
        volume: "24.5M",
        marketCap: "$2.9T",
        pe: 34.2,
        sentiment: 78,
    },
    NVDA: {
        symbol: "NVDA",
        name: "NVIDIA Corporation",
        price: 495.00,
        change: 5.67,
        volume: "45.3M",
        marketCap: "$1.2T",
        pe: 65.2,
        sentiment: 85,
    },
    "VOLV-B": {
        symbol: "VOLV-B",
        name: "Volvo AB",
        price: 265.40,
        change: -1.23,
        volume: "3.2M",
        marketCap: "540 Mdr SEK",
        pe: 12.3,
        sentiment: 45,
    }
};

export function getStock(ticker: string): Stock {
    const upperTicker = ticker.toUpperCase();
    return STOCKS[upperTicker] || {
        symbol: upperTicker,
        name: upperTicker,
        price: 0,
        change: 0,
        volume: "N/A",
        marketCap: "N/A",
        pe: 0,
        sentiment: 50,
    };
}

export function getTrendingStocks(): Stock[] {
    return Object.values(STOCKS);
}

export function getCompanyLogo(ticker: string): string {
    // Basic helper to get a logo based on ticker
    // In a real app, this might come from an API or a local mapping
    return `https://logo.clearbit.com/${ticker.toLowerCase().split('.')[0]}.com`;
}
