'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Calendar, MapPin, Ticket } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getDashboardStats } from '@/actions/profile';

export default function MyTicketsPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getDashboardStats(user.id)
      .then((stats) => {
        setTickets([
          ...stats.upcomingTickets.map((t: any) => ({ ...t, tab: 'upcoming' })),
          ...stats.pastTickets.map((t: any) => ({ ...t, tab: 'past' })),
        ]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const filteredTickets = tickets.filter(
    (t) =>
      t.tab === activeTab &&
      (t.events?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Tickets</h2>
          <p className="text-sm text-slate-500 mt-1">Manage and download your event tickets.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {(['upcoming', 'past'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {tab} Events
            </button>
          ))}
        </nav>
      </div>

      {/* Ticket List */}
      {filteredTickets.length > 0 ? (
        <div className="grid gap-4">
          {filteredTickets.map((ticket) => {
            const event = ticket.events;
            const tier = ticket.ticket_tiers;
            const eventDate = event?.starts_at ? new Date(event.starts_at) : null;
            return (
              <div key={ticket.id} className="flex flex-col sm:flex-row bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-slate-50 border-b sm:border-b-0 sm:border-r border-slate-200 border-dashed p-6 sm:w-48 flex flex-col justify-center items-center text-center">
                  <Ticket className="h-8 w-8 text-slate-400 mb-2" />
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ticket</div>
                  <div className="text-sm font-semibold text-slate-900 truncate w-full">{ticket.ticket_number}</div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className="text-lg font-bold text-slate-900 leading-tight">{event?.title || 'Event'}</h4>
                      {tier?.name && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 whitespace-nowrap">
                          {tier.name}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5 mt-4">
                      {eventDate && (
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="mr-2 h-4 w-4 text-slate-400 flex-shrink-0" />
                          {eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                      {event?.venue_address && (
                        <div className="flex items-center text-sm text-slate-600">
                          <MapPin className="mr-2 h-4 w-4 text-slate-400 flex-shrink-0" />
                          {event.venue_address}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-end gap-4">
                    {ticket.is_checked_in && (
                      <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">Checked In</span>
                    )}
                    <Link
                      href={`/dashboard/tickets/${ticket.order_id}`}
                      className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline"
                    >
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white border border-slate-200 rounded-2xl border-dashed">
          <Ticket className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No {activeTab} tickets found</h3>
          <p className="text-slate-500 mt-1 mb-6">Looks like you don&apos;t have any tickets in this category.</p>
          {activeTab === 'upcoming' && (
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
            >
              Browse Events
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
