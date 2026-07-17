import { NextResponse } from 'next/server';
import getServerClient from '@/lib/supabase/server';
import Paynow from 'paynow';
import { sendTicketConfirmation } from '@/lib/email/resend';

const paynow = new Paynow(
  process.env.PAYNOW_INTEGRATION_ID || '',
  process.env.PAYNOW_INTEGRATION_KEY || ''
);

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const params = new URLSearchParams(text);
    const body: Record<string, string> = {};
    params.forEach((value, key) => { body[key] = value; });

    const status = body.status || '';
    const reference = body.reference || '';

    if (!reference) {
      return new NextResponse('Missing reference', { status: 400 });
    }

    // Verify IPN hash
    try {
      const parsed = paynow.parseStatusUpdate(text);
      if (!parsed || (parsed as any).error) {
        return new NextResponse('Invalid signature', { status: 403 });
      }
    } catch {
      return new NextResponse('Invalid signature', { status: 403 });
    }

    const supabase = getServerClient() as any;

    const { data: orderData, error: orderErr } = await supabase
      .from('orders')
      .select('id, status')
      .or(`payment_ref.eq.${reference},order_number.eq.${reference}`)
      .single();

    if (orderErr || !orderData) {
      return new NextResponse('Order not found', { status: 404 });
    }

    const update: Record<string, any> = {
      payment_status: status,
      payment_ref: body.paynowreference || null,
      updated_at: new Date().toISOString(),
    };

    if (status.toLowerCase() === 'paid') {
      update.status = 'completed';
      update.paid_at = new Date().toISOString();
    } else if (['failed', 'cancelled'].includes(status.toLowerCase())) {
      update.status = 'failed';
    }

    await supabase.from('orders').update(update).eq('id', orderData.id);

    // Send confirmation email asynchronously (don't block webhook response)
    if (status.toLowerCase() === 'paid') {
      const { data: order } = await supabase
        .from('orders')
        .select('order_number, attendee_name, attendee_email, events(title, starts_at, venue_address), tickets(ticket_number)')
        .eq('id', orderData.id)
        .single();

      if (order) {
        const event = order.events as any;
        sendTicketConfirmation(order.attendee_email, {
          eventTitle: event.title,
          orderNumber: order.order_number,
          holderName: order.attendee_name,
          ticketCodes: (order.tickets as any[]).map((t: any) => t.ticket_number),
          eventDate: new Date(event.starts_at).toLocaleDateString('en-ZW', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          }),
          eventLocation: event.venue_address || 'Online',
        }).catch((err) => console.error('Failed to send confirmation email:', err));
      }
    }

    return new NextResponse('OK');
  } catch (e: any) {
    console.error('Paynow webhook error:', e);
    return new NextResponse('Error', { status: 500 });
  }
}
