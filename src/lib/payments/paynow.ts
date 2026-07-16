
// src/lib/payments/paynow.ts
import Paynow from 'paynow';

export interface Order {
  id: string;
  order_number: string;
  attendee_email: string;
  total: number;
  event: {
    title: string;
  };
}

async function updateOrderPaymentRef(orderId: string, pollUrl: string) {
  // Mock updating database with the poll URL
  console.log(`Updated order ${orderId} with poll URL ${pollUrl}`);
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
    // Save poll URL to order for status polling
    await updateOrderPaymentRef(order.id, response.pollUrl);
    return { redirectUrl: response.redirectUrl };
  }
  
  throw new Error(response.error || 'Payment initiation failed');
}

// Verify IPN webhook from Paynow
export async function verifyWebhook(body: Record<string, string>) {
  const hash = body.hash;
  const status = body.status;
  const reference = body.reference;
  
  // Paynow sends MD5 hash of fields + integration key
  const expectedHash = paynow.generateHash(body);
  
  if (hash !== expectedHash) {
    throw new Error('Invalid webhook signature');
  }
  
  return { reference, status, paid: status.toLowerCase() === 'paid' };
}