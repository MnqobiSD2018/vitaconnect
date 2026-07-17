import { Metadata } from 'next';
import getServerClient from '@/lib/supabase/server';
import EventDetail from '@/components/EventDetail';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { eventId } = await params;
  const supabase = getServerClient() as any;

  let { data: event } = await supabase
    .from('events')
    .select('title, description, slug, cover_image_url')
    .eq('slug', eventId)
    .single();

  if (!event) {
    const r = await supabase.from('events').select('title, description, slug, cover_image_url').eq('id', eventId).single();
    event = r.data;
  }

  if (!event) return { title: 'Event | VitaConnect' };

  return {
    title: `${event.title} | VitaConnect`,
    description: event.description?.slice(0, 160) || 'Event details and ticket purchasing.',
    openGraph: event.cover_image_url ? { images: [event.cover_image_url] } : undefined,
  };
}

export default async function EventPage({ params }: PageProps) {
  const { eventId } = await params;
  const supabase = getServerClient() as any;

  // Try slug first, then UUID
  let { data: event } = await supabase
    .from('events')
    .select('*, ticket_tiers(*), categories(name)')
    .eq('slug', eventId)
    .single();

  if (!event) {
    const result = await supabase
      .from('events')
      .select('*, ticket_tiers(*), categories(name)')
      .eq('id', eventId)
      .single();
    event = result.data;
  }

  if (!event) {
    notFound();
  }

  const category = event.categories?.name || 'Other';
  const startsAt = new Date(event.starts_at);

  const mappedEvent = {
    id: event.id,
    title: event.title,
    slug: event.slug,
    description: event.description || '',
    date: startsAt.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    time: startsAt.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    location: event.venue_address || '',
    category,
    image: event.cover_image_url || '',
    ticketTiers: (event.ticket_tiers || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      price: Number(t.price),
      currency: t.currency || 'USD',
      description: t.description || '',
      available: Math.max(0, t.quantity - (t.quantity_sold || 0)),
    })),
    customFields: [],
  };

  return <EventDetail event={mappedEvent as any} />;
}
