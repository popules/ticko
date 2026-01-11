import { NextResponse } from 'next/server';
import { fetchDiscoveryStocks } from '@/lib/stocks-api';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
    try {
        const stocks = await fetchDiscoveryStocks();
        // Limit to 6 stocks for the sidebar to keep it clean
        return NextResponse.json({ stocks: stocks.slice(0, 6) });
    } catch (error) {
        console.error('Trending stocks API failed:', error);
        return NextResponse.json({ error: 'Failed to fetch trending stocks' }, { status: 500 });
    }
}
