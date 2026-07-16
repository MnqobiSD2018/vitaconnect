// hooks/use-event-availability.ts
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface TierAvailability {
  id: string;
  name: string;
  price: number;
  available: number;
  capacity: number;
}

export function useEventAvailability(eventId: string) {
  const [tiers, setTiers] = useState<TierAvailability[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    fetchAvailability();

    // Subscribe to real-time changes on ticket_tiers and seat_holds
    const channel = supabase
      .channel(`event-availability:${eventId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'seat_holds',
      }, () => fetchAvailability())
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'ticket_tiers',
        filter: `event_id=eq.${eventId}`,
      }, (payload: any) => {
        setTiers(prev => prev.map(t =>
          t.id === payload.new.id ? { ...t, ...payload.new } : t
        ));
      })
      .subscribe();


    return () => { supabase.removeChannel(channel); };
  }, [eventId]);

  async function fetchAvailability() {
    const { data } = await supabase
      .rpc('get_event_availability', { p_event_id: eventId });
    setTiers(data ?? []);
  }

  return tiers;
}