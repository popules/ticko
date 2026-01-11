import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { searchStocks } from '@/lib/stocks-api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
        return NextResponse.json({ users: [], stocks: [] });
    }

    try {
        // Parallel execution
        const [usersRes, stocks] = await Promise.all([
            (supabase as any)
                .from('profiles')
                .select('id, username, avatar_url, reputation_score')
                .ilike('username', `%${query}%`)
                .limit(5),
            searchStocks(query)
        ]);

        return NextResponse.json({
            users: usersRes.data || [],
            stocks: stocks || []
        });

    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
