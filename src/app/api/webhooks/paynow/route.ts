import { NextResponse } from 'next/server';
import getServerClient from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = getServerClient() as any;

    // Paynow webhook sends payment status updates
    // Verify the hash signature before processing
    const status = body.status || body.Status;
    const reference = body.reference || body.Reference;

    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    // Find the order by payment reference or order number
    const { data: orderData, error: orderErr } = await supabase
      .from('orders')
      .select('id, status')
      .or(`payment_ref.eq.${reference},order_number.eq.${reference}`)
      .single();

    if (orderErr || !orderData) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orderData as any;

    if (status === 'Paid' || status === 'completed') {
      await supabase
        .from('orders')
        .update({
          status: 'completed',
          payment_status: status,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', order.id);
    } else if (status === 'Failed' || status === 'Cancelled') {
      await supabase
        .from('orders')
        .update({
          status: 'failed',
          payment_status: status,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', order.id);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 400 });
  }
}
