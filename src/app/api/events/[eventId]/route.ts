import { NextResponse } from 'next/server';
import getServerClient from '@/lib/supabase/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const supabase = getServerClient() as any;

  let { data, error } = await supabase
    .from('events')
    .select('*, ticket_tiers(*)')
    .eq('slug', eventId)
    .limit(1)
    .single();

  if (error || !data) {
    const result = await supabase
      .from('events')
      .select('*, ticket_tiers(*)')
      .eq('id', eventId)
      .limit(1)
      .single();
    data = result.data;
    error = result.error;
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const e = data as any;
  const ticketTiers = e.ticket_tiers || [];
  return NextResponse.json({ ...e, ticketTiers });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  try {
    const body = await req.json();
    const supabase = getServerClient() as any;

    const update = { ...body };
    delete update.ticketTiers;

    const { error } = await supabase
      .from('events')
      .update({ ...update, updated_at: new Date().toISOString() } as any)
      .eq('id', eventId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (Array.isArray(body.ticketTiers)) {
      await supabase.from('ticket_tiers').delete().eq('event_id', eventId);
      const tiers = body.ticketTiers.map((t: any) => ({
        event_id: eventId,
        name: t.name,
        description: t.description ?? null,
        price: t.price ?? 0,
        currency: t.currency ?? 'USD',
        quantity: t.quantity ?? t.available ?? 0,
      }));
      const { error: tierErr } = await supabase.from('ticket_tiers').insert(tiers);
      if (tierErr) console.error('tier insert error', tierErr.message || tierErr);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const supabase = getServerClient() as any;
  const { error } = await supabase.from('events').delete().eq('id', eventId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
