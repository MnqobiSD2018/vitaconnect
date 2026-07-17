'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Loader2, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import { getNotifications, markNotificationRead, markAllRead } from '@/actions/notifications';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
  data: Record<string, any> | null;
}

const typeIcons: Record<string, string> = {
  ticket_purchased: '🎟️',
  payment_received: '💰',
  event_approved: '✅',
  event_rejected: '❌',
  payout_processed: '🏦',
  event_reminder: '📅',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications().then((data) => {
      setNotifications(data as Notification[]);
    }).finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success('All notifications marked as read');
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
          <p className="text-sm text-slate-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <Inbox className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">No notifications yet</h3>
          <p className="text-sm text-slate-500 mt-1">We&apos;ll notify you about ticket purchases, event updates, and more.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.is_read && handleMarkRead(n.id)}
              className={`w-full text-left rounded-2xl border p-5 transition-colors ${
                n.is_read
                  ? 'bg-white border-slate-200'
                  : 'bg-teal-50/50 border-teal-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{typeIcons[n.type] || '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm ${n.is_read ? 'font-medium text-slate-900' : 'font-bold text-slate-900'}`}>
                      {n.title}
                    </span>
                    <span className="text-xs text-slate-400 shrink-0">
                      {new Date(n.created_at).toLocaleDateString('en-ZW', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {n.body && (
                    <p className="text-sm text-slate-600 mt-1">{n.body}</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}