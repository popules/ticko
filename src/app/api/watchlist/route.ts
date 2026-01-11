import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { fetchStockData } from '@/lib/stocks-api';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ stocks: [] });
        }

        const { data: watchlistData, error } = await (supabase as any)
            .from('watchlists')
            .select('ticker_symbol')
            .eq('user_id', user.id);

        if (error) throw error;

        const symbols = (watchlistData as any[]).map(item => item.ticker_symbol);

        const stocks = await Promise.all(
            symbols.map(symbol => fetchStockData(symbol))
        );

        return NextResponse.json({ stocks: stocks.filter(s => s !== null) });
    } catch (error) {
        console.error('Watchlist GET failed:', error);
        return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { ticker } = await request.json();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: existing } = await (supabase as any)
            .from('watchlists')
            .select('id')
            .eq('user_id', user.id)
            .eq('ticker_symbol', ticker)
            .maybeSingle();

        if (existing) {
            const { error: deleteError } = await (supabase as any)
                .from('watchlists')
                .delete()
                .eq('id', existing.id);
            if (deleteError) throw deleteError;
            return NextResponse.json({ status: 'removed' });
        } else {
            const { error: insertError } = await (supabase as any)
                .from('watchlists')
                .insert({ user_id: user.id, ticker_symbol: ticker });
            if (insertError) throw insertError;
            return NextResponse.json({ status: 'added' });
        }
    } catch (error) {
        console.error('Watchlist POST failed:', error);
        return NextResponse.json({ error: 'Failed to update watchlist' }, { status: 500 });
    }
}
