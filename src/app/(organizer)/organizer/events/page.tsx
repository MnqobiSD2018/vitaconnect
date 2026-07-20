"use client"

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getMyOrganizerProfile } from "@/actions/organizer";
import { getOrganizerEvents, deleteEvent } from "@/actions/events";
import { useNotification } from "@/components/ui/notifications";

export default function OrganizerEventsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const notify = useNotification();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    if (!user) return;
    try {
      const profile = await getMyOrganizerProfile();
      const data = await getOrganizerEvents(profile.id);
      setEvents(data.events || []);
    } catch {} finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  async function handleDelete(id: string) {
    const confirmed = await notify.confirm({
      title: 'Delete Event',
      description: 'This action cannot be undone. Are you sure you want to delete this event?',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (!confirmed) return;
    try {
      await deleteEvent(id);
      notify.success('Event deleted');
      setEvents((s) => s.filter((e) => e.id !== id));
    } catch {}
  }

  if (loading) return <div className="h-32 flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Your Events</h2>
        <Link href="/organizer/events/new" className="text-sm font-semibold text-teal-600 hover:text-teal-700">+ Create new</Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16 text-sm text-slate-400">
          No events yet. <Link href="/organizer/events/new" className="text-teal-600 hover:underline">Create your first event</Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {events.map((ev: any) => (
            <div key={ev.id} className="rounded-lg border border-slate-100 bg-white p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                {ev.cover_image_url && (
                  <img src={ev.cover_image_url} alt="" className="h-12 w-20 rounded-lg object-cover hidden sm:block" />
                )}
                <div>
                  <div className="font-semibold text-slate-900">{ev.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {ev.starts_at ? new Date(ev.starts_at).toLocaleDateString() : 'No date'} &bull; {ev.venue_address || 'Online'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  ev.status === 'published' ? 'bg-emerald-50 text-emerald-700' :
                  ev.status === 'draft' ? 'bg-slate-100 text-slate-600' :
                  'bg-amber-50 text-amber-700'
                }`}>{ev.status}</span>
                <Link href={`/organizer/events/${ev.id}`} className="text-sm text-slate-600 hover:underline">Manage</Link>
                <button onClick={() => handleDelete(ev.id)} className="text-sm text-rose-600 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
