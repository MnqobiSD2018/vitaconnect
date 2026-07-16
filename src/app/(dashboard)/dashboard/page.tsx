'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, ArrowRight, QrCode, Ticket, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getDashboardStats } from '@/actions/profile';

export default function BuyerDashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getDashboardStats(user.id)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  const displayName = profile?.full_name || user?.email || 'there';
  const firstName = displayName.split(' ')[0];
  const nextTicket = stats?.upcomingTickets?.[0];
  const nextEvent = nextTicket?.events;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome back, {firstName}</h2>
          <p className="text-sm text-slate-500 mt-1">Here is what is happening with your tickets and events.</p>
        </div>
        <Link
          href="/events"
          className="inline-flex h-10 items-center justify-center rounded-xl px-5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
          style={{ background: 'linear-gradient(90deg, rgb(15 23 42) 0%, rgb(51 65 85) 55%, rgb(30 41 59) 100%)' }}
        >
          Find More Events
        </Link>
      </div>

      {/* Highlighted Upcoming Event */}
      {nextEvent && (
        <section>
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Up Next</h3>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row">
            <div
              className="md:w-2/5 h-48 md:h-auto bg-slate-200 bg-cover bg-center"
              style={{ backgroundImage: `url(${nextEvent.cover_image_url || ''})` }}
            />
            <div className="p-6 md:w-3/5 flex flex-col justify-center">
              <div className="inline-flex items-center rounded-full border border-teal-100 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800 mb-3 w-max">
                {nextTicket?.ticket_tiers?.name || 'Ticket'}
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">{nextEvent.title}</h4>
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-slate-600">
                  <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                  {new Date(nextEvent.starts_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <MapPin className="mr-2 h-4 w-4 text-slate-400" />
                  {nextEvent.venue_address || 'TBA'}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-auto">
                <Link
                  href={`/dashboard/tickets/${nextTicket?.order_id || ''}`}
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  View Ticket
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Stats & Links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between">
          <div className="text-sm font-medium text-slate-500">Active Tickets</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{stats?.upcomingTickets?.length || 0}</div>
          <Link href="/dashboard/tickets" className="mt-4 text-sm text-teal-600 font-medium hover:underline flex items-center">
            View all <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between">
          <div className="text-sm font-medium text-slate-500">Saved Events</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{stats?.savedCount || 0}</div>
          <Link href="/dashboard/saved" className="mt-4 text-sm text-teal-600 font-medium hover:underline flex items-center">
            View wishlist <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between">
          <div className="text-sm font-medium text-slate-500">Total Orders</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{stats?.orders?.length || 0}</div>
          <Link href="/dashboard/tickets" className="mt-4 text-sm text-teal-600 font-medium hover:underline flex items-center">
            View orders <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      {stats?.orders?.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Recent Orders</h3>
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            {stats.orders.slice(0, 5).map((order: any) => (
              <Link
                key={order.id}
                href={`/dashboard/tickets/${order.id}`}
                className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">{order.order_number}</div>
                  <div className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900">${Number(order.total).toFixed(2)}</div>
                  <span className={`text-xs font-medium ${order.status === 'completed' ? 'text-teal-600' : 'text-slate-500'}`}>
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
