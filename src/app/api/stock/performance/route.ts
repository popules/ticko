import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

export const dynamic = 'force-dynamic';

const yf = new YahooFinance();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
    }

    try {
        // Get historical data for performance calculations
        const now = new Date();
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const startOfYear = new Date(now.getFullYear(), 0, 1);

        const fiveYearsAgo = new Date(now);
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

        // Fetch historical data
        const historical = await yf.historical(symbol, {
            period1: fiveYearsAgo,
            period2: now,
            interval: '1d'
        });

        if (!historical || historical.length === 0) {
            return NextResponse.json({ error: 'No historical data available' }, { status: 404 });
        }

        // Get current price (most recent close)
        const currentPrice = historical[historical.length - 1].close;

        // Calculate performance for different periods
        const findClosestPrice = (targetDate: Date) => {
            const targetTime = targetDate.getTime();
            let closest = historical[0];
            for (const entry of historical) {
                if (entry.date.getTime() <= targetTime) {
                    closest = entry;
                } else {
                    break;
                }
            }
            return closest?.close || null;
        };

        const oneYearPrice = findClosestPrice(oneYearAgo);
        const ytdPrice = findClosestPrice(startOfYear);
        const fiveYearPrice = historical[0]?.close || null;

        const calcChange = (oldPrice: number | null, newPrice: number) => {
            if (!oldPrice || oldPrice === 0) return null;
            return ((newPrice - oldPrice) / oldPrice) * 100;
        };

        return NextResponse.json({
            symbol,
            currentPrice,
            performance: {
                '1Y': calcChange(oneYearPrice, currentPrice),
                'YTD': calcChange(ytdPrice, currentPrice),
                '5Y': calcChange(fiveYearPrice, currentPrice),
            }
        });
    } catch (error) {
        console.error('Performance API error:', error);
        return NextResponse.json({ error: 'Failed to fetch performance data' }, { status: 500 });
    }
}
