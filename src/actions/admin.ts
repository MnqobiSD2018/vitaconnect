'use server';

import { createClient } from '@/lib/supabase/server';

export async function getAdminStats() {
  const supabase = await createClient();

  const [usersResult, organizersResult, eventsResult, ordersResult, pendingEventsResult, pendingPayoutsResult] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('organizer_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('events').select('id, status, total_revenue'),
    supabase.from('orders').select('id, total, status'),
    supabase.from('events').select('id, title, starts_at, organizer_profiles(organization_name)').eq('status', 'pending_approval'),
    supabase.from('payouts').select('id').eq('status', 'pending'),
  ]);

  const totalRevenue = (eventsResult.data || []).reduce((sum: number, e: any) => sum + Number(e.total_revenue || 0), 0);

  return {
    totalUsers: usersResult.count || 0,
    totalOrganizers: organizersResult.count || 0,
    totalRevenue,
    pendingActions: (pendingEventsResult.data?.length || 0) + (pendingPayoutsResult.data?.length || 0),
    pendingEventsCount: pendingEventsResult.data?.length || 0,
    pendingPayoutsCount: pendingPayoutsResult.data?.length || 0,
    pendingEvents: (pendingEventsResult.data || []) as any[],
  };
}

export async function getAllUsers(search?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('profiles')
    .select('*, organizer_profiles(organization_name)')
    .order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let users = (data || []) as any[];
  if (search) {
    const q = search.toLowerCase();
    users = users.filter(
      (u) =>
        (u.full_name || '').toLowerCase().includes(q) ||
        (u.username || '').toLowerCase().includes(q)
    );
  }
  return users;
}

export async function getAllEvents(status?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('events')
    .select('id, title, starts_at, venue_address, status, cover_image_url, organizer_profiles(organization_name), categories(name), ticket_tiers(price, currency)')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as any[];
}

export async function approveEvent(eventId: string, adminId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('events')
    .update({
      status: 'published',
      approved_by: adminId,
      approved_at: new Date().toISOString(),
    })
    .eq('id', eventId);
  if (error) throw new Error(error.message);
}

export async function rejectEvent(eventId: string, note?: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('events')
    .update({
      status: 'draft',
      rejection_note: note || 'Rejected by admin',
    })
    .eq('id', eventId);
  if (error) throw new Error(error.message);
}

export async function getAllPayouts(status?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('payouts')
    .select('*, organizer_profiles(organization_name, paynow_email, bank_name, bank_account)')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as any[];
}

export async function processPayout(payoutId: string, adminId: string, reference?: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('payouts')
    .update({
      status: 'completed',
      processed_by: adminId,
      processed_at: new Date().toISOString(),
      reference: reference || null,
    })
    .eq('id', payoutId);
  if (error) throw new Error(error.message);
}

export async function getPlatformSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('platform_settings').select('*');
  if (error) throw new Error(error.message);
  const settings: Record<string, any> = {};
  (data || []).forEach((row: any) => {
    settings[row.key] = row.value;
  });
  return settings;
}

export async function updatePlatformSettings(settings: Record<string, any>) {
  const supabase = await createClient();
  const updates = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from('platform_settings').upsert(updates);
  if (error) throw new Error(error.message);
}
