import { NextResponse } from 'next/server';
import getServerClient, { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils/slug';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '9', 10)));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = getServerClient();

  // Get total count for pagination
  const { count } = await supabase
    .from('events')
    .select('id', { count: 'exact', head: true });

  const { data, error } = await supabase
    .from('events')
    .select('*, ticket_tiers(*)')
    .order('starts_at', { ascending: false })
    .range(from, to);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const events = (data || []).map((r: any) => {
    const { ticket_tiers, ...rest } = r;
    return { ...rest, ticketTiers: ticket_tiers || [] };
  });

  return NextResponse.json({
    events,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = getServerClient();

    const authClient = await createClient();
    const { data: { user }, error: authErr } = await authClient.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: profile, error: profileErr } = await supabase
      .from('organizer_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: 'Organizer profile not found' }, { status: 400 });
    }

    const slug = body.slug || slugify(body.title);

    const ticketTiers = Array.isArray(body.ticketTiers) ? body.ticketTiers : [];
    delete body.ticketTiers;

    const { data: event, error: eventErr } = await supabase
      .from('events')
      .insert({ ...body, slug, organizer_id: profile.id })
      .select('id')
      .single();

    if (eventErr) {
      return NextResponse.json({ error: eventErr.message }, { status: 500 });
    }

    if (ticketTiers.length > 0) {
      const tiers = ticketTiers.map((t: any) => ({
        event_id: event.id,
        name: t.name,
        description: t.description ?? null,
        price: t.price ?? 0,
        currency: t.currency ?? 'USD',
        quantity: t.quantity ?? 0,
        max_per_order: t.maxPerOrder ?? 10,
        min_per_order: t.minPerOrder ?? 1,
      }));
      const { error: tierErr } = await supabase.from('ticket_tiers').insert(tiers);
      if (tierErr) {
        return NextResponse.json({ error: tierErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({ id: event.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 400 });
  }
}
