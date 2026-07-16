import { NextResponse } from 'next/server';
import getServerClient from '@/lib/supabase/server';

export async function GET() {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from('events')
    .select('*, ticket_tiers(*)')
    .order('starts_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const events = (data || []).map((r: any) => {
    const { ticket_tiers, ...rest } = r;
    return { ...rest, ticketTiers: ticket_tiers || [] };
  });

  return NextResponse.json(events);
}
