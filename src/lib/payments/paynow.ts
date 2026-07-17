import Paynow from 'paynow';
import { createClient } from '@/lib/supabase/server';

export interface Order {
  id: string;
  order_number: string;
  attendee_email: string;
  total: number;
  event: {
    title: string;
  };
}

async function updateOrderPaymentRef(orderId: string, pollUrl: string, paymentRef?: string) {
  const supabase = await createClient();
  const update: Record<string, any> = {
    poll_url: pollUrl,
    updated_at: new Date().toISOString(),
  };
  if (paymentRef) {
    update.payment_ref = paymentRef;
  }
  await supabase.from('orders').update(update).eq('id', orderId);
}

const paynow = new Paynow(
  process.env.PAYNOW_INTEGRATION_ID || 'dummy-id',
  process.env.PAYNOW_INTEGRATION_KEY || 'dummy-key'
);

paynow.resultUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/paynow`;
paynow.returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`;

export async function initiatePayment(order: Order) {
  const payment = paynow.createPayment(
    order.order_number,
    order.attendee_email
  );

  payment.add(`VitaConnect Tickets - ${order.event.title}`, order.total);

  const response = await paynow.send(payment);

  if (response.success) {
    await updateOrderPaymentRef(order.id, response.pollUrl, order.order_number);
    return { redirectUrl: response.redirectUrl };
  }

  throw new Error((response as any).error || 'Payment initiation failed');
}

export async function verifyWebhook(body: Record<string, string>) {
  const status = body.status;
  const reference = body.reference;

  const hash = body.hash;
  const expectedHash = paynow.generateHash(body, process.env.PAYNOW_INTEGRATION_KEY || '');

  if (hash !== expectedHash) {
    throw new Error('Invalid webhook signature');
  }

  return { reference, status, paid: status.toLowerCase() === 'paid' };
}
