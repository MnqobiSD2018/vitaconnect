import { NextResponse } from 'next/server';
import { createOrder } from '@/actions/tickets';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await createOrder(body);
    return NextResponse.json(result, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 400 });
  }
}
