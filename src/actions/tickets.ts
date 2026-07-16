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

  // Create tickets and update tier sold counts
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

    // Update quantity_sold
    await supabase
      .from('ticket_tiers')
      .update({ quantity_sold: (item.tier.quantity_sold || 0) + item.quantity })
      .eq('id', item.tier.id);
  }

  const { error: ticketErr } = await supabase.from('tickets').insert(ticketInserts);
  if (ticketErr) throw new Error(ticketErr.message);

  // Update event total_sold and total_revenue
  const totalQty = input.items.reduce((sum, i) => sum + i.quantity, 0);
  const { data: eventData } = await supabase.from('events').select('total_sold, total_revenue').eq('id', input.eventId).single();
  if (eventData) {
    await supabase.from('events').update({
      total_sold: (eventData.total_sold || 0) + totalQty,
      total_revenue: Number(eventData.total_revenue || 0) + subtotal,
    }).eq('id', input.eventId);
  }

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

export async function cancelOrder(orderId: string) {
  const supabase = await createClient();

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*, tickets(tier_id)')
    .eq('id', orderId)
    .single();

  if (orderErr || !order) throw new Error('Order not found');
  if (order.status === 'completed') throw new Error('Cannot cancel completed order');

    // Restore ticket tier quantities
    const tierCounts = new Map<string, number>();
    (order.tickets || []).forEach((t: { tier_id: string }) => {
      tierCounts.set(t.tier_id, (tierCounts.get(t.tier_id) || 0) + 1);
    });

    for (const [tierId, count] of tierCounts) {
      const { data: tierData } = await supabase.from('ticket_tiers').select('quantity_sold').eq('id', tierId).single();
      if (tierData) {
        await supabase.from('ticket_tiers').update({ quantity_sold: Math.max(0, (tierData.quantity_sold || 0) - count) }).eq('id', tierId);
      }
    }

  // Delete tickets
  await supabase.from('tickets').delete().eq('order_id', orderId);

  // Update order status
  await supabase.from('orders').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', orderId);

  return { success: true };
}
