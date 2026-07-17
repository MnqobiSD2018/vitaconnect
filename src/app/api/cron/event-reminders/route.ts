import { NextResponse } from 'next/server';
import getServerClient from '@/lib/supabase/server';
import { sendEventReminder } from '@/lib/email/resend';

export async function GET(req: Request) {
  // Simple auth check
  const authHeader = req.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET;
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServerClient() as any;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startOfDay = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0).toISOString();
  const endOfDay = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59).toISOString();

  // Find events starting tomorrow
  const { data: events } = await supabase
    .from('events')
    .select('id, title, starts_at, venue_address')
    .gte('starts_at', startOfDay)
    .lte('starts_at', endOfDay)
    .eq('status', 'published');

  if (!events || events.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No events starting tomorrow' });
  }

  let totalSent = 0;

  for (const event of events) {
    // Get all tickets for this event with user info
    const { data: tickets } = await supabase
      .from('tickets')
      .select('ticket_number, user_id, holder_email, profiles(email, full_name)')
      .eq('event_id', event.id);

    if (!tickets) continue;

    for (const ticket of tickets) {
      const email = ticket.holder_email || ticket.profiles?.email;
      if (!email) continue;

      const eventDate = new Date(event.starts_at);
      const eventTime = eventDate.toLocaleTimeString('en-ZW', { hour: '2-digit', minute: '2-digit' });
      const eventDateStr = eventDate.toLocaleDateString('en-ZW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      await sendEventReminder(email, {
        eventTitle: event.title,
        eventDate: eventDateStr,
        eventTime,
        eventLocation: event.venue_address || 'Online',
        ticketCode: ticket.ticket_number,
      }).catch(() => {});

      totalSent++;
    }

    // Create in-app notifications
    const userIds = [...new Set(tickets.map((t: any) => t.user_id))];
    for (const userId of userIds) {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'event_reminder',
        title: `Reminder: ${event.title} is Tomorrow!`,
        body: `Don't forget! ${event.title} starts tomorrow at ${event.starts_at}.`,
      });
    }
  }

  return NextResponse.json({ sent: totalSent });
}