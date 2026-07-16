'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Heart, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getSavedEvents, removeSavedEvent } from '@/actions/profile';

export default function SavedEventsPage() {
  const { user, loading: authLoading } = useAuth();
  const [savedEvents, setSavedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getSavedEvents(user.id)
      .then(setSavedEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleRemove = async (eventId: string) => {
    if (!user) return;
    setSavedEvents((prev) => prev.filter((e) => e.event_id !== eventId));
    try {
      await removeSavedEvent(user.id, eventId);
    } catch {
      // Revert on error - refetch
      if (user) {
        getSavedEvents(user.id).then(setSavedEvents);
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Saved Events</h2>
        <p className="text-sm text-slate-500 mt-1">Events you have bookmarked for later.</p>
      </div>

      {savedEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {savedEvents.map((saved) => {
            const event = saved.events;
            if (!event) return null;
            const eventDate = event.starts_at ? new Date(event.starts_at) : null;
            const lowestPrice = event.ticket_tiers?.length
              ? Math.min(...event.ticket_tiers.map((t: any) => Number(t.price)))
              : null;

            return (
              <div key={saved.event_id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
                <div className="relative h-48 w-full overflow-hidden bg-slate-200">
                  {event.cover_image_url && (
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${event.cover_image_url})` }}
                    />
                  )}
                  <button
                    onClick={() => handleRemove(saved.event_id)}
                    className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-rose-500 hover:bg-rose-50 transition-colors shadow-sm"
                    title="Remove from saved"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 group-hover:text-teal-600 transition-colors">
                    <Link href={`/events/${event.slug}`}>
                      <span className="absolute inset-0" />
                      {event.title}
                    </Link>
                  </h3>
                  <div className="space-y-1.5 mb-4">
                    {eventDate && (
                      <div className="flex items-center text-sm text-slate-600">
                        <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                        {eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                    {event.venue_address && (
                      <div className="flex items-center text-sm text-slate-600">
                        <MapPin className="mr-2 h-4 w-4 text-slate-400" />
                        {event.venue_address}
                      </div>
                    )}
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="text-sm font-semibold text-slate-900">
                      {lowestPrice !== null ? `$${lowestPrice.toFixed(2)}` : 'Free'}
                    </div>
                    <div className="text-sm font-medium text-teal-600 flex items-center">
                      View Details <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white border border-slate-200 rounded-2xl border-dashed">
          <Heart className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No saved events</h3>
          <p className="text-slate-500 mt-1 mb-6">When you find an event you like, click the heart icon to save it here.</p>
          <Link
            href="/events"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            Browse Events
          </Link>
        </div>
      )}
    </div>
  );
}
