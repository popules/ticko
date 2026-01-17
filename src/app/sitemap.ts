import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://www.ticko.se';

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
            url: `${BASE_URL}/upptack`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/marknad`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/topplistan`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/leaderboard`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/om-oss`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/kontakt`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/integritet`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/villkor`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
    ];

    // Dynamic stock pages - fetch popular tickers from posts
    let stockPages: MetadataRoute.Sitemap = [];

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
                const uniqueTickers = [...new Set(posts.map(p => p.ticker_symbol).filter(Boolean))];

                stockPages = uniqueTickers.map(ticker => ({
                    url: `${BASE_URL}/aktie/${ticker}`,
                    lastModified: new Date(),
                    changeFrequency: 'hourly' as const,
                    priority: 0.8,
                }));
            }
        }
    } catch (error) {
        console.error('Sitemap: Failed to fetch stock pages:', error);
    }

    return [...staticPages, ...stockPages];
}
