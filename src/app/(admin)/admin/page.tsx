'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Ticket, AlertCircle, DollarSign, ArrowRight, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getAdminStats, approveEvent, rejectEvent } from '@/actions/admin';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (eventId: string) => {
    if (!user) return;
    setActionLoading(eventId);
    try {
      await approveEvent(eventId, user.id);
      setStats((prev: any) => ({
        ...prev,
        pendingEvents: prev.pendingEvents.filter((e: any) => e.id !== eventId),
        pendingEventsCount: prev.pendingEventsCount - 1,
        pendingActions: prev.pendingActions - 1,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (eventId: string) => {
    setActionLoading(eventId);
    try {
      await rejectEvent(eventId);
      setStats((prev: any) => ({
        ...prev,
        pendingEvents: prev.pendingEvents.filter((e: any) => e.id !== eventId),
        pendingEventsCount: prev.pendingEventsCount - 1,
        pendingActions: prev.pendingActions - 1,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
        <p className="text-sm text-slate-500 mt-1">Platform analytics and action items requiring your attention.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-slate-500">Total Users</div>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{stats?.totalUsers || 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-slate-500">Active Organizers</div>
            <Ticket className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{stats?.totalOrganizers || 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-slate-500">Platform Revenue (5%)</div>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900">${(stats?.totalRevenue || 0).toLocaleString()}</div>
          <div className="mt-2 text-xs text-slate-500 font-medium">All time</div>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-rose-800">Pending Actions</div>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-3xl font-bold text-rose-900">{stats?.pendingActions || 0}</div>
          <div className="mt-2 text-xs text-rose-700 font-medium">{stats?.pendingEventsCount || 0} Events &bull; {stats?.pendingPayoutsCount || 0} Payouts</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Events Requiring Approval */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 p-5 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-semibold text-slate-900">Events Requiring Approval</h3>
            <Link href="/admin/events" className="text-sm text-teal-600 font-medium hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {(stats?.pendingEvents || []).length > 0 ? (
              stats.pendingEvents.map((event: any) => (
                <div key={event.id} className="p-5 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900">{event.title}</h4>
                    <p className="text-sm text-slate-500 mt-0.5">By {event.organizer_profiles?.organization_name || 'Unknown'} &bull; {event.starts_at ? new Date(event.starts_at).toLocaleDateString() : 'TBD'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(event.id)}
                      disabled={actionLoading === event.id}
                      className="p-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors disabled:opacity-50"
                      title="Approve"
                    >
                      {actionLoading === event.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                    </button>
                    <button
                      onClick={() => handleReject(event.id)}
                      disabled={actionLoading === event.id}
                      className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors disabled:opacity-50"
                      title="Reject"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">No pending events</div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/admin/payouts" className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors">
              <div>
                <div className="font-medium text-slate-900">Process Organizer Payouts</div>
                <div className="text-sm text-slate-500">{stats?.pendingPayoutsCount || 0} pending withdrawal requests</div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </Link>
            <Link href="/admin/users" className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors">
              <div>
                <div className="font-medium text-slate-900">Manage Users</div>
                <div className="text-sm text-slate-500">{stats?.totalUsers || 0} registered users</div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </Link>
            <Link href="/admin/settings" className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors">
              <div>
                <div className="font-medium text-slate-900">Adjust Platform Fees</div>
                <div className="text-sm text-slate-500">Currently set to 5% per transaction</div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
