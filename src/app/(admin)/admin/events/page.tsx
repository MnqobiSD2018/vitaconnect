'use client';

import React, { useEffect, useState } from 'react';
import { Search, CheckCircle2, XCircle, Eye, Calendar, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getAllEvents, approveEvent, rejectEvent } from '@/actions/admin';

export default function AdminEventsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending_approval' | 'published' | 'draft'>('pending_approval');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    getAllEvents()
      .then((res) => setEvents(res.events || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = events.filter((e) => e.status === activeTab);

  const handleApprove = async (eventId: string) => {
    if (!user) return;
    setActionLoading(eventId);
    try {
      await approveEvent(eventId, user.id);
      setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, status: 'published' } : e)));
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
      setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, status: 'draft' } : e)));
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Event Approvals</h2>
        <p className="text-sm text-slate-500 mt-1">Review and approve events submitted by organizers to ensure quality.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {([
            { key: 'pending_approval', label: 'Requires Approval' },
            { key: 'published', label: 'Published' },
            { key: 'draft', label: 'Drafts' },
          ] as const).map(({ key, label }) => {
            const count = events.filter((e) => e.status === key).length;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                  activeTab === key ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:border-slate-300'
                }`}
              >
                {label}
                {key === 'pending_approval' && count > 0 && (
                  <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-600">{count}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Event List */}
      <div className="grid gap-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div key={event.id} className="flex flex-col sm:flex-row bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow gap-4 sm:items-center">
              <div className="h-20 w-20 rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden">
                {event.cover_image_url ? (
                  <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${event.cover_image_url})` }} />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        {event.categories?.name || 'Uncategorized'}
                      </span>
                      <span className="text-xs font-medium text-slate-500">By {event.organizer_profiles?.organization_name || 'Unknown'}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{event.title}</h3>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
                  {event.starts_at && (
                    <div className="flex items-center">
                      <Calendar className="mr-1.5 h-4 w-4 text-slate-400" />
                      {new Date(event.starts_at).toLocaleDateString()}
                    </div>
                  )}
                  {event.venue_address && (
                    <div className="flex items-center">
                      <MapPin className="mr-1.5 h-4 w-4 text-slate-400" />
                      {event.venue_address}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 sm:border-l sm:border-slate-100 sm:pl-4">
                {event.status === 'pending_approval' && (
                  <>
                    <button
                      onClick={() => handleApprove(event.id)}
                      disabled={actionLoading === event.id}
                      className="flex items-center justify-center h-10 w-10 rounded-xl bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors disabled:opacity-50"
                      title="Approve"
                    >
                      {actionLoading === event.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => handleReject(event.id)}
                      disabled={actionLoading === event.id}
                      className="flex items-center justify-center h-10 w-10 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors disabled:opacity-50"
                      title="Reject"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 px-4 bg-white border border-slate-200 rounded-2xl border-dashed">
            <CheckCircle2 className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">All caught up!</h3>
            <p className="text-slate-500 mt-1">There are no {activeTab.replace('_', ' ')} events at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
