"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { getEventById, updateEvent, deleteEvent } from "@/actions/events";
import { useNotification } from "@/components/ui/notifications";

export default function OrganizerEventPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const router = useRouter();
  const notify = useNotification();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  type Tier = { id?: string; name: string; description: string; price: string; quantity: string; currency: string };
  const [tiers, setTiers] = useState<Tier[]>([]);

  useEffect(() => {
    if (!eventId) return;
    getEventById(eventId)
      .then((e) => {
        setEvent(e);
        if (e?.ticket_tiers?.length) {
          setTiers(e.ticket_tiers.map((t: any) => ({
            id: t.id,
            name: t.name,
            description: t.description || '',
            price: String(t.price ?? ''),
            quantity: String(t.quantity ?? ''),
            currency: t.currency || 'USD',
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId]);

  function updateTier(index: number, field: keyof Tier, value: string) {
    setTiers(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
  }
  function addTier() {
    setTiers(prev => [...prev, { name: '', description: '', price: '', quantity: '', currency: 'USD' }]);
  }
  function removeTier(index: number) {
    setTiers(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!event) return;
    setSaving(true);
    try {
      const savedTiers = tiers
        .filter(t => t.name && t.price !== '' && t.quantity !== '')
        .map(t => {
          const tier: Record<string, any> = {
            name: t.name,
            description: t.description || null,
            price: parseFloat(t.price) || 0,
            quantity: parseInt(t.quantity) || 0,
            currency: t.currency,
          };
          if (t.id) tier.id = t.id;
          return tier;
        });
      await updateEvent(event.id, {
        title: event.title,
        description: event.description,
        starts_at: event.starts_at,
        ends_at: event.ends_at,
        venue_address: event.venue_address,
        max_attendees: event.max_attendees,
      }, savedTiers);
      notify.success('Saved');
    } catch (err: any) {
      notify.error(err?.message || 'Failed to save');
    }
    setSaving(false);
  }

  async function handleDelete() {
    const confirmed = await notify.confirm({
      title: 'Delete Event',
      description: 'This action cannot be undone. Are you sure you want to delete this event?',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (!confirmed) return;
    try {
      await deleteEvent(eventId);
      notify.success('Event deleted');
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
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Ticket Tiers</h3>
          <button type="button" onClick={addTier} className="text-xs font-semibold text-teal-600 hover:text-teal-700">+ Add Tier</button>
        </div>
        {tiers.length === 0 ? (
          <p className="text-xs text-slate-400">No ticket tiers yet. Click "+ Add Tier" to create one.</p>
        ) : (
          <div className="space-y-4">
            {tiers.map((tier, i) => (
              <div key={tier.id || i} className="rounded-lg border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Tier {i + 1}</span>
                  <button type="button" onClick={() => removeTier(i)} className="text-xs text-rose-500 hover:text-rose-600 font-semibold">Remove</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
                    <input value={tier.name} onChange={(e) => updateTier(i, 'name', e.target.value)} placeholder="e.g. Early Bird" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                    <input value={tier.description} onChange={(e) => updateTier(i, 'description', e.target.value)} placeholder="Optional" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Price *</label>
                    <input type="number" min="0" step="0.01" value={tier.price} onChange={(e) => updateTier(i, 'price', e.target.value)} placeholder="0.00" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Quantity *</label>
                    <input type="number" min="1" value={tier.quantity} onChange={(e) => updateTier(i, 'quantity', e.target.value)} placeholder="100" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Currency</label>
                    <select value={tier.currency} onChange={(e) => updateTier(i, 'currency', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                      <option value="USD">USD</option>
                      <option value="ZiG">ZiG</option>
                    </select>
                  </div>
                </div>
                {tier.id && (
                  <div className="text-xs text-slate-400">{tier.quantity ? `${parseInt(tier.quantity) || 0} total` : '0 total'}</div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
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
    </div>
  );
}
