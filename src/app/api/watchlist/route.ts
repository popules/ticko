import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fetchStockData } from '@/lib/stocks-api';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ stocks: [], symbols: [] });
        }

        const { data: watchlistData, error } = await (supabase as any)
            .from('watchlists')
            .select('ticker_symbol')
            .eq('user_id', user.id);

        if (error) throw error;

        const symbols = (watchlistData || []).map((item: any) => item.ticker_symbol);

        const stocks = await Promise.all(
            symbols.map(async (symbol: string) => {
                try {
                    return await fetchStockData(symbol);
                } catch (e) {
                    console.error(`Failed to fetch data for ${symbol}`, e);
                    return null;
                }
            })
        );

        return NextResponse.json({
            stocks: stocks.filter(s => s !== null),
            symbols: symbols
        });
    } catch (error) {
        console.error('Watchlist GET failed:', error);
        return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { ticker } = await request.json();
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.error('Watchlist POST: No user found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log(`Watchlist POST: User ${user.id} toggling ${ticker}`);

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
            if (deleteError) {
                console.error('Watchlist DELETE error:', deleteError);
                throw deleteError;
            }
            console.log(`Watchlist: Removed ${ticker} for user ${user.id}`);
            return NextResponse.json({ status: 'removed' });
        } else {
            const { error: insertError } = await (supabase as any)
                .from('watchlists')
                .insert({ user_id: user.id, ticker_symbol: ticker });
            if (insertError) {
                console.error('Watchlist INSERT error:', insertError);
                throw insertError;
            }
            console.log(`Watchlist: Added ${ticker} for user ${user.id}`);
            return NextResponse.json({ status: 'added' });
        }
    } catch (error) {
        console.error('Watchlist POST failed:', error);
        return NextResponse.json({ error: 'Failed to update watchlist' }, { status: 500 });
    }
}
