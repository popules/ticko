import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://tickomarkets.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 1,
        },
        {
            url: `${BASE_URL}/discover`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/market`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/leaderboard`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/terms`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
    ];

    // Popular tickers baseline (always indexed)
    const popularTickers = [
        // Swedish / Nordic
        'VOLV-B', 'ERIC-B', 'ASSA-B', 'SAND', 'ATCO-A', 'SEB-A', 'SWED-A', 'HM-B',
        'AZN', 'INVE-B', 'ESSITY-B', 'TELIA', 'KINV-B', 'SCA-B', 'SKF-B', 'ABB',
        'NDA-SE', 'HEXA-B', 'ELUX-B', 'BOL', 'SINCH', 'EVO', 'NIBE-B', 'ALFA',
        // US Large Cap
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK-B',
        'UNH', 'JNJ', 'V', 'JPM', 'PG', 'MA', 'HD', 'CVX', 'MRK', 'ABBV',
        'PEP', 'KO', 'COST', 'AVGO', 'TMO', 'MCD', 'WMT', 'CSCO', 'ACN',
        'ADBE', 'CRM', 'AMD', 'NFLX', 'INTC', 'ORCL', 'NKE', 'DIS', 'PYPL',
    ];

    // Dynamic stock pages - fetch tickers from posts + popular baseline
    let stockPages: MetadataRoute.Sitemap = [];

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        let dbTickers: string[] = [];

        if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey);

            // Get unique tickers from posts (most discussed)
            const { data: posts } = await supabase
                .from('posts')
                .select('ticker_symbol')
                .not('ticker_symbol', 'is', null)
                .order('created_at', { ascending: false })
                .limit(500);

            if (posts) {
                dbTickers = posts.map(p => p.ticker_symbol).filter(Boolean);
            }
        }

        // Merge popular + DB tickers, dedupe
        const allTickers = [...new Set([...popularTickers, ...dbTickers])];

        stockPages = allTickers.map(ticker => ({
            url: `${BASE_URL}/stock/${ticker}`,
            lastModified: new Date(),
            changeFrequency: 'hourly' as const,
            priority: 0.8,
        }));
    } catch (error) {
        console.error('Sitemap: Failed to fetch stock pages:', error);

        // Fallback to just popular tickers
        stockPages = popularTickers.map(ticker => ({
            url: `${BASE_URL}/stock/${ticker}`,
            lastModified: new Date(),
            changeFrequency: 'hourly' as const,
            priority: 0.8,
        }));
    }

    return [...staticPages, ...stockPages];
}
