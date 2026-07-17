import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vitaconnect.co.zw';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/events', '/sell', '/about', '/contact', '/privacy', '/terms'],
        disallow: ['/api/', '/dashboard/', '/organizer/', '/admin/', '/onboarding/', '/checkout/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}