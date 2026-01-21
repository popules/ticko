import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/settings/', '/bevakningslista/', '/alerts/'],
            },
        ],
        sitemap: 'https://tickomarkets.com/sitemap.xml',
    };
}
