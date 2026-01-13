import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fetchStockData } from '@/lib/stocks-api';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        console.log('[Watchlist API GET] Auth check:', {
            hasUser: !!user,
            userId: user?.id?.slice(0, 8),
            authError: authError?.message,
        });

        if (!user) {
            // Return empty array, not 401 - this is expected for logged out users
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

        // Debug: Log what we're getting from auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        console.log('[Watchlist API] Auth check:', {
            hasUser: !!user,
            userId: user?.id?.slice(0, 8),
            authError: authError?.message,
        });

        if (!user) {
            console.error('[Watchlist API] No user found - auth failed');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log(`Watchlist POST: User ${user.id} toggling ${ticker}`);

        // IMPORTANT: Ensure profile exists before watchlist operations
        // The watchlists table has a foreign key to profiles, so we need to create 
        // the profile first if it doesn't exist
        const { data: existingProfile } = await (supabase as any)
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();

        if (!existingProfile) {
            console.log(`[Watchlist API] Creating missing profile for user ${user.id}`);
            const { error: profileError } = await (supabase as any)
                .from('profiles')
                .insert({
                    id: user.id,
                    username: user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
                });
            if (profileError) {
                console.error('[Watchlist API] Failed to create profile:', profileError);
                // Don't continue if profile creation failed - the FK will still fail
                return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
            }
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
