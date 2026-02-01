import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fetchStockData } from '@/lib/stocks-api';
import { isUserPro } from '@/lib/ai-metering';

export const dynamic = 'force-dynamic';

const FREE_WATCHLIST_LIMIT = 10;
const PRO_WATCHLIST_LIMIT = 50;

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

        console.log('[Watchlist API GET] DB query result:', {
            count: watchlistData?.length || 0,
            symbols: watchlistData?.map((i: any) => i.ticker_symbol),
            error: error?.message,
        });

        if (error) throw error;

        const symbols = (watchlistData || []).map((item: any) => item.ticker_symbol);

        // Fetch stock data with timeout and better error handling
        const stocks = await Promise.all(
            symbols.map(async (symbol: string) => {
                try {
                    const stockData = await Promise.race([
                        fetchStockData(symbol),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('Timeout')), 8000)
                        )
                    ]);
                    return stockData;
                } catch (e) {
                    console.error(`Failed to fetch data for ${symbol}`, e);
                    // Return minimal data so watchlist doesn't disappear
                    return {
                        symbol,
                        name: symbol,
                        price: null,
                        changePercent: null,
                        currencySymbol: '',
                    };
                }
            })
        );

        console.log('[Watchlist API GET] Final response:', {
            symbolCount: symbols.length,
            stockCount: stocks.length,
        });

        return NextResponse.json({
            stocks: stocks,
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
            // Check watchlist limit before adding
            const { count: currentCount } = await (supabase as any)
                .from('watchlists')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            // Get user's Pro status
            const { data: profile } = await (supabase as any)
                .from('profiles')
                .select('is_pro, pro_expires_at')
                .eq('id', user.id)
                .single();

            const isPro = profile ? isUserPro(profile) : false;
            const limit = isPro ? PRO_WATCHLIST_LIMIT : FREE_WATCHLIST_LIMIT;

            if ((currentCount || 0) >= limit) {
                return NextResponse.json({
                    error: 'watchlist_limit_reached',
                    message: isPro 
                        ? `You've reached the Pro watchlist limit of ${PRO_WATCHLIST_LIMIT} stocks.`
                        : `You've reached the free watchlist limit of ${FREE_WATCHLIST_LIMIT} stocks. Upgrade to Pro for ${PRO_WATCHLIST_LIMIT}+ slots.`,
                    limit,
                    current: currentCount,
                    isPro,
                    upgrade_url: '/pro'
                }, { status: 402 });
            }

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
