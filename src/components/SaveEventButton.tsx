'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { saveEvent, removeSavedEvent, getSavedEvents } from '@/actions/profile';
import { useNotification } from '@/components/ui/notifications';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function SaveEventButton({ eventId, className }: { eventId: string; className?: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const notify = useNotification();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !UUID_RE.test(eventId)) return;
    getSavedEvents(user.id).then((events) => {
      setSaved(events.some((e: any) => e.event_id === eventId));
    }).catch(() => {});
  }, [user, eventId]);

  const handleToggle = async () => {
    if (!user) {
      router.push(`/login?redirect=/events/${eventId}`);
      return;
    }

    if (!UUID_RE.test(eventId)) {
      notify.error('This event cannot be saved. Please browse live events instead.');
      return;
    }

    setLoading(true);
    try {
      if (saved) {
        await removeSavedEvent(user.id, eventId);
        setSaved(false);
      } else {
        await saveEvent(user.id, eventId);
        setSaved(true);
      }
    } catch {
      notify.error(saved ? 'Failed to remove event.' : 'Failed to save event. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={className || 'inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors'}
      title={saved ? 'Remove from saved' : 'Save event'}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 ${saved ? 'fill-rose-500 text-rose-500' : ''}`} />
      )}
    </button>
  );
}