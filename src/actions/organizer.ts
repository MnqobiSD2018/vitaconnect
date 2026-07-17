'use server';

import { createClient } from '@/lib/supabase/server';

export async function getOrganizerProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('organizer_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return data;
}

export async function createOrganizerProfile(
  userId: string,
  input: {
    organization_name: string;
    bio?: string;
    website?: string;
    logo_url?: string;
    paynow_email?: string;
    bank_name?: string;
    bank_account?: string;
  }
) {
  const supabase = await createClient();

  // Check if profile already exists
  const { data: existing } = await supabase
    .from('organizer_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) throw new Error('Organizer profile already exists');

  const { data, error } = await supabase
    .from('organizer_profiles')
    .insert({
      user_id: userId,
      organization_name: input.organization_name,
      bio: input.bio || null,
      website: input.website || null,
      logo_url: input.logo_url || null,
      paynow_email: input.paynow_email || null,
      bank_name: input.bank_name || null,
      bank_account: input.bank_account || null,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  // Update user role to organizer
  await supabase
    .from('profiles')
    .update({ role: 'organizer', updated_at: new Date().toISOString() })
    .eq('id', userId);

  return data.id;
}

export async function updateOrganizerProfile(
  userId: string,
  updates: Partial<{
    organization_name: string;
    bio: string;
    website: string;
    logo_url: string;
    cover_url: string;
    phone: string;
    city: string;
    paynow_email: string;
    paynow_integration_key: string;
    bank_name: string;
    bank_account: string;
    account_name: string;
    branch: string;
    mobile_money: string;
  }>
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('organizer_profiles')
    .update(updates)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
}

export async function getOrganizerStats(organizerId: string) {
  const supabase = await createClient();

  const [eventsResult, ordersResult, ticketsResult] = await Promise.all([
    supabase
      .from('events')
      .select('id, status, total_sold, total_revenue')
      .eq('organizer_id', organizerId),
    supabase
      .from('orders')
      .select('id, total, status')
      .in('event_id', (
        await supabase.from('events').select('id').eq('organizer_id', organizerId)
      ).data?.map((e) => e.id) || []),
    supabase
      .from('tickets')
      .select('id, is_checked_in')
      .in('event_id', (
        await supabase.from('events').select('id').eq('organizer_id', organizerId)
      ).data?.map((e) => e.id) || []),
  ]);

  const events = eventsResult.data || [];
  const orders = ordersResult.data || [];
  const tickets = ticketsResult.data || [];

  const totalRevenue = events.reduce((sum, e) => sum + Number(e.total_revenue || 0), 0);
  const totalTicketsSold = events.reduce((sum, e) => sum + (e.total_sold || 0), 0);
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const checkedInTickets = tickets.filter((t) => t.is_checked_in);

  return {
    totalEvents: events.length,
    publishedEvents: events.filter((e) => e.status === 'published').length,
    draftEvents: events.filter((e) => e.status === 'draft').length,
    pendingEvents: events.filter((e) => e.status === 'pending_approval').length,
    totalRevenue,
    totalTicketsSold,
    totalOrders: completedOrders.length,
    checkInRate: tickets.length > 0 ? Math.round((checkedInTickets.length / tickets.length) * 100) : 0,
  };
}

export async function getMyOrganizerProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('organizer_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getEventTickets(eventId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tickets')
    .select('*, orders!inner(attendee_name, attendee_email, order_number), ticket_tiers(name)')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getEventTicketTiers(eventId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('ticket_tiers')
    .select('*')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getOrganizerPayouts(organizerId: string, page = 1, limit = 20) {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { count } = await supabase
    .from('payouts')
    .select('id', { count: 'exact', head: true })
    .eq('organizer_id', organizerId);

  const { data, error } = await supabase
    .from('payouts')
    .select('*')
    .eq('organizer_id', organizerId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { payouts: data || [], total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) };
}
