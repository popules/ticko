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
        
        // Define all time periods
        const oneDayAgo = new Date(now);
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        const fiveDaysAgo = new Date(now);
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

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
        
        // Get previous close for 1D calculation
        const previousClose = historical.length > 1 ? historical[historical.length - 2].close : null;

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

        const fiveDayPrice = findClosestPrice(fiveDaysAgo);
        const oneMonthPrice = findClosestPrice(oneMonthAgo);
        const threeMonthPrice = findClosestPrice(threeMonthsAgo);
        const sixMonthPrice = findClosestPrice(sixMonthsAgo);
        const ytdPrice = findClosestPrice(startOfYear);
        const oneYearPrice = findClosestPrice(oneYearAgo);
        const fiveYearPrice = historical[0]?.close || null;

        const calcChange = (oldPrice: number | null, newPrice: number) => {
            if (!oldPrice || oldPrice === 0) return null;
            return ((newPrice - oldPrice) / oldPrice) * 100;
        };

        return NextResponse.json({
            symbol,
            currentPrice,
            performance: {
                '1D': calcChange(previousClose, currentPrice),
                '5D': calcChange(fiveDayPrice, currentPrice),
                '1M': calcChange(oneMonthPrice, currentPrice),
                '3M': calcChange(threeMonthPrice, currentPrice),
                '6M': calcChange(sixMonthPrice, currentPrice),
                'YTD': calcChange(ytdPrice, currentPrice),
                '1Y': calcChange(oneYearPrice, currentPrice),
                '5Y': calcChange(fiveYearPrice, currentPrice),
            }
        });
    } catch (error) {
        console.error('Performance API error:', error);
        return NextResponse.json({ error: 'Failed to fetch performance data' }, { status: 500 });
    }
}
