"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getEventById } from "@/actions/events";
import { getEventTickets } from "@/actions/organizer";
import { ArrowLeft, Search } from "lucide-react";

export default function AttendeesPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [event, setEvent] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    Promise.all([
      getEventById(eventId),
      getEventTickets(eventId),
    ]).then(([ev, t]) => {
      setEvent(ev);
      setTickets(t);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <div className="h-32 flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" /></div>;
  if (!event) return <div className="text-center py-16 text-slate-500">Event not found.</div>;

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    return (t.holder_name || t.orders?.attendee_name || '').toLowerCase().includes(q)
      || (t.holder_email || t.orders?.attendee_email || '').toLowerCase().includes(q)
      || (t.ticket_number || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/organizer/events/${eventId}`} className="text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Attendees</h2>
          <p className="text-sm text-slate-500">{event.title} &bull; {tickets.length} tickets</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email, or ticket..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-400"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-sm text-slate-400">
          {tickets.length === 0 ? 'No tickets sold yet.' : 'No matches found.'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 font-medium text-slate-600">Email</th>
                <th className="px-4 py-3 font-medium text-slate-600">Tier</th>
                <th className="px-4 py-3 font-medium text-slate-600">Ticket #</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t: any) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{t.holder_name || t.orders?.attendee_name || '-'}</td>
                  <td className="px-4 py-3 text-slate-500">{t.holder_email || t.orders?.attendee_email || '-'}</td>
                  <td className="px-4 py-3 text-slate-700">{t.ticket_tiers?.name || '-'}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{t.ticket_number || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      t.is_checked_in ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {t.is_checked_in ? 'Checked In' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
