#!/usr/bin/env node
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const key = serviceKey || anonKey;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const seedPath = resolve(__dirname, '../src/lib/constants/seed-events.json');

if (!url || !key) {
  console.error('Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or PUBLISHABLE_KEY) or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!serviceKey) {
  console.warn('Warning: running importer without SUPABASE_SERVICE_ROLE_KEY may fail if RLS is enabled.');
}

const supabase = createClient(url, key);

async function findOrCreateOrganizer() {
  const organizerEmail = 'organizer@vitaconnect.local';
  const organizerPassword = 'ChangeMe123!';

  const { data: users } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existingUser = users.users.find((user) => user.email === organizerEmail);

  let userId = existingUser?.id;
  if (!userId) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: organizerEmail,
      password: organizerPassword,
      email_confirm: true,
      user_metadata: { full_name: 'VitaConnect Organizer' },
    });
    if (error) throw error;
    userId = data.user.id;
  }

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    full_name: 'VitaConnect Organizer',
    role: 'organizer',
    is_verified: true,
  });
  if (profileError) throw profileError;

  const { data: newOp, error } = await supabase.from('organizer_profiles').upsert({
    user_id: userId,
    organization_name: 'VitaConnect Events',
    bio: 'Official event organizer profile used to seed the application with live data.',
    is_approved: true,
  }).select('*').single();
  if (error) throw error;
  return newOp;
}

async function buildCategoryMap() {
  const { data } = await supabase.from('categories').select('*');
  const map = new Map();
  (data || []).forEach((c) => map.set((c.name || '').toLowerCase(), c.id));
  return map;
}

async function run() {
  console.log('Starting import into live events tables...');
  const organizer = await findOrCreateOrganizer();
  console.log('Using organizer id:', organizer.id);

  const catMap = await buildCategoryMap();
  const seedEvents = JSON.parse(await readFile(seedPath, 'utf8'));

  let created = 0;
  for (const payload of seedEvents) {
    const categoryName = (payload.category || '').toLowerCase();
    const category_id = catMap.get(categoryName) ?? catMap.get('other') ?? null;
    const starts_at = payload.startsAt ? new Date(payload.startsAt).toISOString() : new Date().toISOString();
    const ends_at = payload.endsAt ? new Date(payload.endsAt).toISOString() : new Date(Date.parse(starts_at) + 1000 * 60 * 60 * 4).toISOString();

    const { data: existing } = await supabase.from('events').select('id').eq('slug', payload.slug).maybeSingle();
    let eventId = existing?.id;

    const eventRow = {
      organizer_id: organizer.id,
      category_id,
      venue_id: null,
      title: payload.title,
      slug: payload.slug,
      description: payload.description || '',
      content: {
        original: payload,
        customFields: payload.customFields || [],
      },
      cover_image_url: payload.image || null,
      gallery_urls: [],
      starts_at,
      ends_at,
      doors_open_at: null,
      timezone: 'Africa/Harare',
      is_online: false,
      online_url: null,
      venue_address: payload.location || null,
      status: 'published',
      is_featured: false,
      max_attendees: null,
      tags: [],
      meta_title: null,
      meta_description: null
    };

    if (existing?.id) {
      const { error: updateError } = await supabase.from('events').update(eventRow).eq('id', existing.id);
      if (updateError) {
        console.error('Failed to update event', payload.title, updateError.message || updateError);
        continue;
      }
      await supabase.from('ticket_tiers').delete().eq('event_id', existing.id);
      eventId = existing.id;
    } else {
      const { data: ins, error: insErr } = await supabase.from('events').insert([eventRow]).select('id').single();
      if (insErr) {
        console.error('Failed to insert event', payload.title, insErr.message || insErr);
        continue;
      }
      eventId = ins.id;
    }

    // insert ticket tiers
    const tiers = payload.ticketTiers || [];
    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i];
      const tierRow = {
        event_id: eventId,
        name: t.name || 'General',
        description: t.description || null,
        price: (t.price ?? t.price_paid ?? t.amount) || 0,
        currency: t.currency || 'USD',
        quantity: t.available ?? t.quantity ?? 0,
        quantity_sold: 0,
        max_per_order: t.max_per_order ?? 10,
        min_per_order: t.min_per_order ?? 1,
        sale_starts_at: null,
        sale_ends_at: null,
        is_visible: true,
        sort_order: i
      };
      const { error: tierErr } = await supabase.from('ticket_tiers').insert([tierRow]);
      if (tierErr) console.error('Failed to create tier for', payload.title, tierErr.message || tierErr);
    }

    created++;
    console.log('Imported event:', payload.title, '->', eventId);
  }

  console.log(`Import complete. ${created} events created or updated.`);
}

run().catch((err) => {
  console.error('Import failed:', err.message || err);
  process.exit(1);
});
