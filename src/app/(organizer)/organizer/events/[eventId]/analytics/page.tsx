"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getEventById } from "@/actions/events";
import { getEventTickets } from "@/actions/organizer";
import { ArrowLeft } from "lucide-react";

export default function AnalyticsPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [event, setEvent] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
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

  const totalTickets = tickets.length;
  const checkedIn = tickets.filter((t) => t.is_checked_in).length;
  const pending = totalTickets - checkedIn;
  const ticketTiers = event.ticket_tiers || [];
  const totalCapacity = ticketTiers.reduce((s: number, t: any) => s + t.quantity, 0);
  const totalSold = ticketTiers.reduce((s: number, t: any) => s + (t.quantity_sold || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/organizer/events/${eventId}`} className="text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Analytics</h2>
          <p className="text-sm text-slate-500">{event.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-500">Total Tickets</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totalTickets}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-500">Checked In</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{checkedIn}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-500">Pending</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">{pending}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-500">Check-in Rate</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totalTickets > 0 ? Math.round((checkedIn / totalTickets) * 100) : 0}%</div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Ticket Tier Breakdown</h3>
        <div className="space-y-3">
          {ticketTiers.map((tier: any) => (
            <div key={tier.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-900">{tier.name}</span>
                <span className="text-slate-500">{tier.quantity_sold || 0} / {tier.quantity}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-teal-500 transition-all"
                  style={{ width: `${tier.quantity > 0 ? ((tier.quantity_sold || 0) / tier.quantity) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
          {ticketTiers.length === 0 && <p className="text-sm text-slate-400">No ticket tiers configured.</p>}
        </div>
      </div>
    </div>
  );
}
