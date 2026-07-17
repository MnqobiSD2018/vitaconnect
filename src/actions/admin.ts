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

export async function getAllUsers(page = 1, limit = 20, search?: string) {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true });

  let query = supabase
    .from('profiles')
    .select('*, organizer_profiles(organization_name)')
    .order('created_at', { ascending: false })
    .range(from, to);

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
  return { users, total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) };
}

export async function getAllEvents(page = 1, limit = 20, statusFilter?: string) {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let countQuery = supabase.from('events').select('id', { count: 'exact', head: true });
  let dataQuery = supabase
    .from('events')
    .select('id, title, starts_at, venue_address, status, cover_image_url, organizer_profiles(organization_name), categories(name), ticket_tiers(price, currency)')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (statusFilter) {
    countQuery = countQuery.eq('status', statusFilter) as any;
    dataQuery = dataQuery.eq('status', statusFilter) as any;
  }

  const [countResult, { data, error }] = await Promise.all([
    countQuery,
    dataQuery,
  ]);

  if (error) throw new Error(error.message);
  return { events: (data || []) as any[], total: countResult.count || 0, page, limit, totalPages: Math.ceil((countResult.count || 0) / limit) };
}

export async function approveEvent(eventId: string, adminId: string) {
  const supabase = await createClient();

  // Get event title and organizer for notification
  const { data: event } = await supabase
    .from('events')
    .select('title, organizer_id')
    .eq('id', eventId)
    .single();

  const { error } = await supabase
    .from('events')
    .update({
      status: 'published',
      approved_by: adminId,
      approved_at: new Date().toISOString(),
    })
    .eq('id', eventId);
  if (error) throw new Error(error.message);

  if (event) {
    const { createNotification } = await import('@/actions/notifications');
    await createNotification(event.organizer_id, 'event_approved', 'Event Approved', `Your event "${event.title}" has been approved and is now live.`);
  }
}

export async function rejectEvent(eventId: string, note?: string) {
  const supabase = await createClient();

  const { data: event } = await supabase
    .from('events')
    .select('title, organizer_id')
    .eq('id', eventId)
    .single();

  const { error } = await supabase
    .from('events')
    .update({
      status: 'draft',
      rejection_note: note || 'Rejected by admin',
    })
    .eq('id', eventId);
  if (error) throw new Error(error.message);

  if (event) {
    const { createNotification } = await import('@/actions/notifications');
    await createNotification(event.organizer_id, 'event_rejected', 'Event Rejected', `Your event "${event.title}" was not approved. Reason: ${note || 'Rejected by admin'}.`);
  }
}

export async function getAllPayouts(page = 1, limit = 20, statusFilter?: string) {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let countQuery = supabase.from('payouts').select('id', { count: 'exact', head: true });
  let dataQuery = supabase
    .from('payouts')
    .select('*, organizer_profiles(organization_name, paynow_email, bank_name, bank_account)')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (statusFilter) {
    countQuery = countQuery.eq('status', statusFilter) as any;
    dataQuery = dataQuery.eq('status', statusFilter) as any;
  }

  const [countResult, { data, error }] = await Promise.all([
    countQuery,
    dataQuery,
  ]);

  if (error) throw new Error(error.message);
  return { payouts: (data || []) as any[], total: countResult.count || 0, page, limit, totalPages: Math.ceil((countResult.count || 0) / limit) };
}

export async function processPayout(payoutId: string, adminId: string, reference?: string) {
  const supabase = await createClient();

  // Get payout details for notification + email
  const { data: payout } = await supabase
    .from('payouts')
    .select('amount, currency, organizer_id, organizer_profiles!inner(organization_name, user_id)')
    .eq('id', payoutId)
    .single();

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

  if (payout) {
    const org = payout.organizer_profiles as any;
    const { createNotification } = await import('@/actions/notifications');

    // Notify organizer in-app
    await createNotification(
      org.user_id,
      'payout_processed',
      'Payout Processed',
      `$${Number(payout.amount).toFixed(2)} has been paid out to your account.`,
    );

    // Send email
    const { sendOrganizerPayout } = await import('@/lib/email/resend');
    const { data: profile } = await supabase.from('profiles').select('email').eq('id', org.user_id).single();
    if (profile) {
      sendOrganizerPayout(profile.email, {
        organizationName: org.organization_name || 'Your Organization',
        amount: Number(payout.amount),
        payoutMethod: 'Bank Transfer',
        payoutDate: new Date().toLocaleDateString('en-ZW', { year: 'numeric', month: 'long', day: 'numeric' }),
        eventTitle: 'VitaConnect Payout',
      }).catch((err) => console.error('Failed to send payout email:', err));
    }
  }
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
