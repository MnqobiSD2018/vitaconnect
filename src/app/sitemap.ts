import { MetadataRoute } from 'next';
import getServerClient from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vitaconnect.co.zw';

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/events`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/sell`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
    const supabase = getServerClient() as any;
    const { data: events } = await supabase
      .from('events')
      .select('slug, updated_at')
      .eq('status', 'published');

    if (events) {
      const eventPages = events.map((e: any) => ({
        url: `${baseUrl}/events/${e.slug}`,
        lastModified: new Date(e.updated_at || new Date()),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }));
      return [...staticPages, ...eventPages];
    }
  } catch {}

  return staticPages;
}