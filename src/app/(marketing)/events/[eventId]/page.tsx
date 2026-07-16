// app/(marketing)/events/[eventId]/page.tsx
import { MOCK_EVENTS } from '@/lib/constants/mockData';
import EventDetail from '@/components/EventDetail';
import { notFound } from 'next/navigation';

// Use this if you want to keep the URL slug-friendly but the parameter named eventId
interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EventPage({ params }: PageProps) {
  const { eventId } = await params;
  
  // Find event by slug or id
  const event = MOCK_EVENTS.find(e => e.slug === eventId || e.id === eventId);
  
  if (!event) {
    notFound();
  }

  return <EventDetail event={event} />;
}
