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
        sitemap: 'https://www.ticko.se/sitemap.xml',
    };
}
