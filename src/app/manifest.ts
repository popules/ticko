import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Ticko - Där investerare möts',
        short_name: 'Ticko',
        description: 'En modern social plattform för aktieinvesterare',
        start_url: '/',
        display: 'standalone',
        background_color: '#020617',
        theme_color: '#10B981',
        orientation: 'portrait',
        icons: [
            {
                src: '/icons/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icons/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
        ],
        categories: ['finance', 'social', 'business'],
        lang: 'sv',
        dir: 'ltr',
        scope: '/',
        shortcuts: [
            {
                name: 'Marknad',
                url: '/marknad',
                description: 'Se marknadsöversikt',
            },
            {
                name: 'Trendradar',
                url: '/upptack',
                description: 'Upptäck trendande aktier',
            },
        ],
    };
}
