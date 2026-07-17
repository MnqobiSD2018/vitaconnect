import { NextResponse } from 'next/server';
import getServerClient from '@/lib/supabase/server';

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
