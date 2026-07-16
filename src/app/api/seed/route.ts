import { NextResponse } from 'next/server';
import getServerClient from '@/lib/supabase/server';
import seedEvents from '@/lib/constants/seed-events.json';

async function ensureOrganizer(supabase: any) {
  const organizerEmail = 'organizer@vitaconnect.local';
  const organizerPassword = 'ChangeMe123!';

  const { data: users } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existingUser = users.users.find((user: any) => user.email === organizerEmail);

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
  } as any);
  if (profileError) throw profileError;

  const { data: organizerProfile, error: organizerError } = await supabase
    .from('organizer_profiles')
    .upsert({
      user_id: userId,
      organization_name: 'VitaConnect Events',
      bio: 'Official event organizer profile used to seed the application with live data.',
      is_approved: true,
    } as any)
    .select('id')
    .single();

  if (organizerError) throw organizerError;
  return (organizerProfile as any).id;
}

export async function POST() {
  const supabase = getServerClient() as any;
  try {
    const organizerId = await ensureOrganizer(supabase);
    const { data: categories } = await supabase.from('categories').select('id, name');
    const categoryMap = new Map<string, number>();
    (categories || []).forEach((category: any) => categoryMap.set(String(category.name).toLowerCase(), category.id));

    let inserted = 0;
    for (const event of seedEvents as any[]) {
      const categoryId = categoryMap.get(String(event.category || '').toLowerCase()) ?? categoryMap.get('other') ?? null;
      const startsAt = event.startsAt ? new Date(event.startsAt).toISOString() : new Date().toISOString();
      const endsAt = event.endsAt ? new Date(event.endsAt).toISOString() : new Date(Date.parse(startsAt) + 1000 * 60 * 60 * 4).toISOString();

      const existing = await supabase.from('events').select('id').eq('slug', event.slug).maybeSingle();
      let eventId = (existing.data as any)?.id;

      const eventRow = {
        organizer_id: organizerId,
        category_id: categoryId,
        venue_id: null,
        title: event.title,
        slug: event.slug,
        description: event.description,
        content: { original: event, customFields: event.customFields || [] },
        cover_image_url: event.image,
        gallery_urls: [],
        starts_at: startsAt,
        ends_at: endsAt,
        doors_open_at: null,
        timezone: 'Africa/Harare',
        is_online: false,
        online_url: null,
        venue_address: event.location,
        status: 'published',
        is_featured: false,
        max_attendees: null,
        tags: [],
        meta_title: null,
        meta_description: null,
      };

      if (existing.error) return NextResponse.json({ error: existing.error.message }, { status: 500 });

      if (eventId) {
        const { error: updateError } = await supabase.from('events').update(eventRow as any).eq('id', eventId);
        if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
        await supabase.from('ticket_tiers').delete().eq('event_id', eventId);
      } else {
        const { data: created, error } = await supabase.from('events').insert([eventRow] as any).select('id').single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        eventId = (created as any).id;
      }

      const tiers = (event.ticketTiers || []).map((tier: any, index: number) => ({
        event_id: eventId,
        name: tier.name,
        description: tier.description ?? null,
        price: tier.price ?? 0,
        currency: tier.currency ?? 'USD',
        quantity: tier.available ?? tier.quantity ?? 0,
        quantity_sold: 0,
        max_per_order: tier.max_per_order ?? 10,
        min_per_order: tier.min_per_order ?? 1,
        sale_starts_at: null,
        sale_ends_at: null,
        is_visible: true,
        sort_order: index,
      }));

      if (tiers.length) {
        const { error: tierError } = await supabase.from('ticket_tiers').insert(tiers);
        if (tierError) return NextResponse.json({ error: tierError.message }, { status: 500 });
      }

      inserted++;
    }

    return NextResponse.json({ inserted });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}
