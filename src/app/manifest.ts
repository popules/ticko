import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Ticko - Where investors meet',
        short_name: 'Ticko',
        description: 'A modern social platform for stock investors',
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
        lang: 'en',
        dir: 'ltr',
        scope: '/',
        shortcuts: [
            {
                name: 'Market',
                url: '/market',
                description: 'View market overview',
            },
            {
                name: 'Discover',
                url: '/discover',
                description: 'Discover trending stocks',
            },
        ],
    };
}
