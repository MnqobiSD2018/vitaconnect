'use server';

import { createClient } from '@/lib/supabase/server';

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateProfile(
  userId: string,
  updates: { full_name?: string; username?: string; phone?: string; avatar_url?: string }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw new Error(error.message);
}

export async function getDashboardStats(userId: string) {
  const supabase = await createClient();

  const [ticketsResult, savedResult, ordersResult] = await Promise.all([
    supabase
      .from('tickets')
      .select('id, is_checked_in, events(id, title, slug, starts_at, venue_address, cover_image_url, status), ticket_tiers(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('event_saves')
      .select('event_id')
      .eq('user_id', userId),
    supabase
      .from('orders')
      .select('id, order_number, status, total, created_at, event_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ]);

  const tickets = (ticketsResult.data || []) as any[];
  const now = new Date();
  const upcomingTickets = tickets.filter((t: any) => {
    const eventDate = t.events?.starts_at ? new Date(t.events.starts_at) : null;
    return eventDate && eventDate > now && !t.is_checked_in;
  });
  const pastTickets = tickets.filter((t: any) => {
    const eventDate = t.events?.starts_at ? new Date(t.events.starts_at) : null;
    return !eventDate || eventDate <= now || t.is_checked_in;
  });

  return {
    upcomingTickets,
    pastTickets,
    savedCount: (savedResult.data || []).length,
    orders: (ordersResult.data || []) || [],
    totalTickets: tickets.length,
  };
}

export async function saveEvent(userId: string, eventId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('event_saves').upsert(
    { user_id: userId, event_id: eventId, saved_at: new Date().toISOString() },
    { onConflict: 'user_id, event_id' }
  );
  if (error) throw new Error(error.message);
}

export async function getSavedEvents(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('event_saves')
    .select('event_id, saved_at, events(id, title, slug, description, starts_at, venue_address, cover_image_url, category_id, status, ticket_tiers(price, currency))')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as any[];
}

export async function removeSavedEvent(userId: string, eventId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('event_saves')
    .delete()
    .eq('user_id', userId)
    .eq('event_id', eventId);

  if (error) throw new Error(error.message);
}

export async function getOrderDetail(orderId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*, tickets(*, ticket_tiers(name)), events(title, slug, starts_at, venue_address, cover_image_url)')
    .eq('id', orderId)
    .single();

  if (error) throw new Error(error.message);
  return data as any;
}
