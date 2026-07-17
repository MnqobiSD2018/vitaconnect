"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { getEventById, updateEvent, deleteEvent } from "@/actions/events";

export default function OrganizerEventPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    getEventById(eventId)
      .then((e) => setEvent(e))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId]);

  async function handleSave() {
    if (!event) return;
    setSaving(true);
    try {
      await updateEvent(event.id, {
        title: event.title,
        description: event.description,
        starts_at: event.starts_at,
        venue_address: event.venue_address,
        max_attendees: event.max_attendees,
      });
      alert('Saved');
    } catch {}
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm('Delete this event?')) return;
    try {
      await deleteEvent(eventId);
      router.push('/organizer/events');
    } catch {}
  }

  if (loading) return <div className="h-32 flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" /></div>;
  if (!event) return <div className="text-center py-16 text-slate-500">Event not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{event.title}</h2>
          <p className="text-sm text-slate-500">Manage event details, ticketing, and attendees</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/organizer/events/${eventId}/analytics`} className="text-sm text-slate-600 hover:underline border border-slate-200 rounded-lg px-3 py-1.5">Analytics</Link>
          <Link href={`/organizer/events/${eventId}/attendees`} className="text-sm text-slate-600 hover:underline border border-slate-200 rounded-lg px-3 py-1.5">Attendees</Link>
          <Link href={`/organizer/events/${eventId}/tickets`} className="text-sm text-slate-600 hover:underline border border-slate-200 rounded-lg px-3 py-1.5">Tickets</Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={event.title} onChange={(e) => setEvent({ ...event, title: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none" rows={4} value={event.description || ''} onChange={(e) => setEvent({ ...event, description: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input type="datetime-local" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={event.starts_at ? new Date(event.starts_at).toISOString().slice(0, 16) : ''}
              onChange={(e) => setEvent({ ...event, starts_at: new Date(e.target.value).toISOString() })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
            <input type="datetime-local" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={event.ends_at ? new Date(event.ends_at).toISOString().slice(0, 16) : ''}
              onChange={(e) => setEvent({ ...event, ends_at: new Date(e.target.value).toISOString() })} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Venue / Location</label>
            <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={event.venue_address || ''} onChange={(e) => setEvent({ ...event, venue_address: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Max Attendees</label>
            <input type="number" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={event.max_attendees || ''} onChange={(e) => setEvent({ ...event, max_attendees: parseInt(e.target.value) || 0 })} />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleSave} disabled={saving}
            className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={handleDelete}
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Delete Event
          </button>
        </div>
      </div>

      {event.ticket_tiers && event.ticket_tiers.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Ticket Tiers</h3>
          <div className="grid gap-2">
            {event.ticket_tiers.map((tier: any) => (
              <div key={tier.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 text-sm">
                <div>
                  <span className="font-medium text-slate-900">{tier.name}</span>
                  <span className="text-slate-400 ml-2">${tier.price} {tier.currency}</span>
                </div>
                <span className="text-slate-500">{tier.quantity_sold || 0} / {tier.quantity} sold</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
