import { NextResponse } from 'next/server';
import { verifyTicket } from '@/actions/tickets';

export async function POST(req: Request) {
  try {
    const { qrCode, checkInBy, device } = await req.json();
    if (!qrCode || !checkInBy) {
      return NextResponse.json({ error: 'qrCode and checkInBy required' }, { status: 400 });
    }
    const result = await verifyTicket(qrCode, checkInBy, device);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 400 });
  }
}
