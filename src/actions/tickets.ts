'use server';

import { createClient } from '@/lib/supabase/server';
import { generateOrderNumber, generateTicketCode } from '@/lib/utils/slug';
import crypto from 'crypto';

type TicketTierRow = {
  id: string;
  event_id: string;
  name: string;
  price: number | string;
  currency: string;
  quantity: number;
  quantity_sold: number;
  max_per_order: number;
  min_per_order: number;
  sale_starts_at: string | null;
  sale_ends_at: string | null;
};

export type CheckoutInput = {
  eventId: string;
  userId: string;
  items: Array<{ tierId: string; quantity: number }>;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
};

export async function createOrder(input: CheckoutInput) {
  const supabase = await createClient();

  // Fetch tiers and validate availability
  const tierIds = input.items.map((i) => i.tierId);
  const { data: tiers, error: tierErr } = await supabase
    .from('ticket_tiers')
    .select('*')
    .in('id', tierIds);

  if (tierErr || !tiers || tiers.length === 0) {
    throw new Error('Ticket tiers not found');
  }

  const tierMap = new Map<string, TicketTierRow>();
  tiers.forEach((t) => tierMap.set(t.id, t as TicketTierRow));

  let subtotal = 0;
  const orderItems: Array<{ tier: TicketTierRow; quantity: number; lineTotal: number }> = [];

  for (const item of input.items) {
    const tier = tierMap.get(item.tierId);
    if (!tier) throw new Error(`Tier ${item.tierId} not found`);

    const available = tier.quantity - (tier.quantity_sold || 0);
    if (item.quantity > available) {
      throw new Error(`Insufficient tickets for "${tier.name}". Available: ${available}`);
    }
    if (item.quantity < tier.min_per_order) {
      throw new Error(`Minimum ${tier.min_per_order} tickets for "${tier.name}"`);
    }
    if (item.quantity > tier.max_per_order) {
      throw new Error(`Maximum ${tier.max_per_order} tickets for "${tier.name}"`);
    }

    const price = Number(tier.price);
    const lineTotal = price * item.quantity;
    subtotal += lineTotal;
    orderItems.push({ tier, quantity: item.quantity, lineTotal });
  }

  // Calculate service fee (5%)
  const serviceFee = Math.round(subtotal * 0.05 * 100) / 100;
  const total = Math.round((subtotal + serviceFee) * 100) / 100;
  const orderNumber = generateOrderNumber();

  // Create order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: input.userId,
      event_id: input.eventId,
      subtotal,
      service_fee: serviceFee,
      total,
      currency: 'USD',
      attendee_name: input.attendeeName,
      attendee_email: input.attendeeEmail,
      attendee_phone: input.attendeePhone || null,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    })
    .select('id')
    .single();

  if (orderErr) throw new Error(orderErr.message);

  // Create tickets (sold counts updated by DB trigger on order completion)
  const ticketInserts: Array<Record<string, unknown>> = [];

  for (const item of orderItems) {
    const ticketsForTier: Array<Record<string, unknown>> = [];
    for (let i = 0; i < item.quantity; i++) {
      const ticketNumber = generateTicketCode(orderNumber);
      const qrSecret = crypto.randomBytes(16).toString('hex');
      const qrCode = `${order.id}-${ticketNumber}`;

      ticketsForTier.push({
        order_id: order.id,
        tier_id: item.tier.id,
        event_id: input.eventId,
        user_id: input.userId,
        ticket_number: ticketNumber,
        qr_code: qrCode,
        qr_secret: qrSecret,
        holder_name: input.attendeeName,
        holder_email: input.attendeeEmail,
        price_paid: Number(item.tier.price),
        currency: item.tier.currency,
      });
    }
    ticketInserts.push(...ticketsForTier);
  }

  const { error: ticketErr } = await supabase.from('tickets').insert(ticketInserts);
  if (ticketErr) throw new Error(ticketErr.message);

  return { orderId: order.id, orderNumber, total };
}

export async function getUserOrders(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*, events(title, slug, cover_image_url, starts_at, venue_address)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getOrderWithTickets(orderId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*, tickets(*, ticket_tiers(name, description)), events(title, slug, cover_image_url, starts_at, venue_address)')
    .eq('id', orderId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getUserTickets(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tickets')
    .select('*, events(title, slug, cover_image_url, starts_at, venue_address), ticket_tiers(name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function verifyTicket(qrCode: string, checkInBy: string, device?: string) {
  const supabase = await createClient();

  const { data: ticket, error: ticketErr } = await supabase
    .from('tickets')
    .select('*, events(id, status)')
    .eq('qr_code', qrCode)
    .single();

  if (ticketErr || !ticket) {
    return { valid: false, error: 'Ticket not found' };
  }

  if (ticket.is_checked_in) {
    return { valid: false, error: 'Already checked in', ticket };
  }

  if (ticket.events?.status !== 'published') {
    return { valid: false, error: 'Event not active', ticket };
  }

  const { error: updateErr } = await supabase
    .from('tickets')
    .update({
      is_checked_in: true,
      checked_in_at: new Date().toISOString(),
      checked_in_by: checkInBy,
      check_in_device: device || null,
    })
    .eq('id', ticket.id);

  if (updateErr) throw new Error(updateErr.message);

  return { valid: true, ticket: { ...ticket, is_checked_in: true } };
}

export async function getOrderByReference(reference: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, total, status, payment_status, events(title, slug, starts_at, cover_image_url)')
    .or(`order_number.eq.${reference},payment_ref.eq.${reference}`)
    .single();

  if (error || !data) return null;
  return data;
}

export async function cancelOrder(orderId: string) {
  const supabase = await createClient();

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*, tickets(tier_id, is_checked_in), events(title, organizer_id)')
    .eq('id', orderId)
    .single();

  if (orderErr || !order) throw new Error('Order not found');

  if (order.status === 'completed') {
    // Restore ticket tier counts
    const tierCounts = new Map<string, number>();
    (order.tickets || []).forEach((t: { tier_id: string }) => {
      tierCounts.set(t.tier_id, (tierCounts.get(t.tier_id) || 0) + 1);
    });
    for (const [tierId, count] of tierCounts) {
      await supabase.rpc('decrement_tier_quantity', { p_tier_id: tierId, p_count: count });
    }

    // Soft-cancel tickets instead of deleting
    await supabase.from('tickets').update({ is_cancelled: true }).eq('order_id', orderId);

    // Notify user
    const { createNotification } = await import('@/actions/notifications');
    await createNotification(order.user_id, 'order_cancelled', 'Order Cancelled', `Order #${order.order_number} has been cancelled. A manual refund must be processed.`);
  } else {
    // Non-completed orders: tickets never counted, just delete
    await supabase.from('tickets').delete().eq('order_id', orderId);
  }

  await supabase.from('orders').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', orderId);

  return { success: true, requiresManualRefund: order.status === 'completed' };
}

export async function initiatePaymentAction(orderId: string) {
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select('id, order_number, attendee_email, total, events(title)')
    .eq('id', orderId)
    .single();

  if (error || !order) throw new Error('Order not found');

  const { initiatePayment } = await import('@/lib/payments/paynow');
  const result = await initiatePayment({
    id: order.id,
    order_number: order.order_number,
    attendee_email: order.attendee_email,
    total: Number(order.total),
    event: { title: (order.events as any).title },
  });

  return result;
}
