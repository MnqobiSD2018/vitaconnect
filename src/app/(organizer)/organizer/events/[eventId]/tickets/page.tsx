"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getEventById } from "@/actions/events";
import { getEventTicketTiers } from "@/actions/organizer";
import { ArrowLeft, Plus, Minus } from "lucide-react";

export default function TicketsPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [event, setEvent] = useState<any>(null);
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    Promise.all([
      getEventById(eventId),
      getEventTicketTiers(eventId),
    ]).then(([ev, t]) => {
      setEvent(ev);
      setTiers(t);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <div className="h-32 flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" /></div>;
  if (!event) return <div className="text-center py-16 text-slate-500">Event not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/organizer/events/${eventId}`} className="text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Ticket Tiers</h2>
          <p className="text-sm text-slate-500">{event.title}</p>
        </div>
      </div>

      {tiers.length === 0 ? (
        <div className="text-center py-16 text-sm text-slate-400">
          No ticket tiers configured. <Link href={`/organizer/events/${eventId}`} className="text-teal-600 hover:underline">Edit event</Link> to add tiers.
        </div>
      ) : (
        <div className="grid gap-4">
          {tiers.map((tier: any) => (
            <div key={tier.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{tier.name}</h3>
                  {tier.description && <p className="text-sm text-slate-500 mt-1">{tier.description}</p>}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900">${Number(tier.price).toFixed(2)}</div>
                  <div className="text-xs text-slate-400">{tier.currency}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Sold: <strong className="text-slate-900">{tier.quantity_sold || 0}</strong> / {tier.quantity}
                </span>
                <div className="flex items-center gap-3">
                  {tier.is_visible !== false && (
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Active</span>
                  )}
                  <span className="text-xs text-slate-400">Max {tier.max_per_order} per order</span>
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-teal-500 transition-all"
                  style={{ width: `${tier.quantity > 0 ? ((tier.quantity_sold || 0) / tier.quantity) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
