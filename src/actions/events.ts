'use server';

import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils/slug';

export type EventWithTiers = Record<string, any> & { ticket_tiers: Record<string, any>[] };

export async function getPublishedEvents(options?: { limit?: number; categoryId?: number }): Promise<EventWithTiers[]> {
  const supabase = await createClient();
  let query = supabase
    .from('events')
    .select('*, ticket_tiers(*)')
    .eq('status', 'published')
    .order('starts_at', { ascending: true });

  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as EventWithTiers[];
}

export async function getEventById(id: string): Promise<EventWithTiers | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('events')
    .select('*, ticket_tiers(*)')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as EventWithTiers;
}

export async function getEventBySlug(slug: string): Promise<EventWithTiers | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('events')
    .select('*, ticket_tiers(*)')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data as EventWithTiers;
}

export async function getOrganizerEvents(organizerId: string): Promise<EventWithTiers[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('events')
    .select('*, ticket_tiers(*)')
    .eq('organizer_id', organizerId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as EventWithTiers[];
}

export async function createEvent(
  input: Record<string, any>,
  tiers?: Record<string, any>[]
) {
  const supabase = await createClient();
  const slug = input.slug || slugify(input.title);

  const { data: event, error: eventErr } = await supabase
    .from('events')
    .insert({ ...input, slug })
    .select('id')
    .single();

  if (eventErr) throw new Error(eventErr.message);

  if (tiers && tiers.length > 0) {
    const { error: tierErr } = await supabase
      .from('ticket_tiers')
      .insert(tiers.map((t) => ({ ...t, event_id: event.id })));
    if (tierErr) throw new Error(tierErr.message);
  }

  return event.id;
}

export async function updateEvent(
  id: string,
  updates: Record<string, any>,
  tiers?: Record<string, any>[]
) {
  const supabase = await createClient();

  const { error: updateErr } = await supabase
    .from('events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (updateErr) throw new Error(updateErr.message);

  if (tiers) {
    await supabase.from('ticket_tiers').delete().eq('event_id', id);
    if (tiers.length > 0) {
      const { error: tierErr } = await supabase
        .from('ticket_tiers')
        .insert(tiers.map((t) => ({ ...t, event_id: id })));
      if (tierErr) throw new Error(tierErr.message);
    }
  }
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function approveEvent(id: string, approvedBy: string, note?: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('events')
    .update({
      status: 'published',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      rejection_note: note || null,
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function rejectEvent(id: string, note: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('events')
    .update({
      status: 'draft',
      rejection_note: note,
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
}
