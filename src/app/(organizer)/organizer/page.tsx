"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import {
  getMyOrganizerProfile,
  getOrganizerStats,
} from "@/actions/organizer";
import { getOrganizerEvents } from "@/actions/events";

export default function OrganizerHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    getMyOrganizerProfile()
      .then((profile) => Promise.all([
        getOrganizerStats(profile.id),
        getOrganizerEvents(profile.id),
      ]))
      .then(([s, e]) => {
        if (mounted) {
          setStats(s);
          setEvents(e.events || []);
        }
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [user]);

  if (loading) return <div className="h-32 flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500">Overview of your events and recent activity</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/organizer/events/new"
            className="inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white shadow-sm hover:opacity-95"
            style={{ background: 'linear-gradient(90deg, rgb(15 23 42) 0%, rgb(51 65 85) 55%, rgb(30 41 59) 100%)' }}
          >
            Create Event
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-500">Events</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{stats?.totalEvents ?? 0}</div>
          <div className="text-xs text-slate-400 mt-1">{stats?.publishedEvents ?? 0} published</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-500">Tickets Sold</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{stats?.totalTicketsSold ?? 0}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-500">Revenue</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">${Number(stats?.totalRevenue ?? 0).toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-500">Check-in Rate</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{stats?.checkInRate ?? 0}%</div>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Your Events</h3>
          <Link href="/organizer/events" className="text-sm text-slate-500 hover:text-slate-900">View all</Link>
        </div>
        {events.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No events yet. Create your first event to get started.</p>
        ) : (
          <div className="grid gap-3">
            {events.slice(0, 5).map((ev: any) => (
              <div key={ev.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{ev.title}</div>
                  <div className="text-xs text-slate-500">
                    {ev.starts_at ? new Date(ev.starts_at).toLocaleDateString() : 'No date'} &bull; {ev.venue_address || 'Online'}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    ev.status === 'published' ? 'bg-emerald-50 text-emerald-700' :
                    ev.status === 'draft' ? 'bg-slate-100 text-slate-600' :
                    'bg-amber-50 text-amber-700'
                  }`}>{ev.status}</span>
                  <Link href={`/organizer/events/${ev.id}`} className="text-sm text-slate-600 hover:underline">Manage</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
