import { NextResponse } from 'next/server';
import getServerClient from '@/lib/supabase/server';

export async function GET() {
  const supabase = getServerClient();
  const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}
