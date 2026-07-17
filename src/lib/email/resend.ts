import { Resend } from 'resend';
import TicketConfirmationEmail from './templates/ticket-confirmation';
import OrganizerPayoutEmail from './templates/organizer-payout';
import EventReminderEmail from './templates/event-reminder';
import { createElement } from 'react';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = 'VitaConnect <noreply@vitaconnect.co.zw>';

function renderComponent(Component: React.ComponentType<any>, props: any): string {
  const { renderToString } = require('react-dom/server');
  return renderToString(createElement(Component, props));
}

export async function sendTicketConfirmation(
  email: string,
  props: {
    eventTitle: string;
    orderNumber: string;
    holderName: string;
    ticketCodes: string[];
    eventDate: string;
    eventLocation: string;
  }
) {
  if (!resend) return { error: 'Resend not configured' };

  const html = renderComponent(TicketConfirmationEmail, props);

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Your Tickets for ${props.eventTitle} — Order #${props.orderNumber}`,
    html,
  });

  return { error: error?.message || null };
}

export async function sendOrganizerPayout(
  email: string,
  props: {
    organizationName: string;
    amount: number;
    payoutMethod: string;
    payoutDate: string;
    eventTitle: string;
  }
) {
  if (!resend) return { error: 'Resend not configured' };

  const html = renderComponent(OrganizerPayoutEmail, props);

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Payout Processed — ${props.organizationName}`,
    html,
  });

  return { error: error?.message || null };
}

export async function sendEventReminder(
  email: string,
  props: {
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    ticketCode: string;
  }
) {
  if (!resend) return { error: 'Resend not configured' };

  const html = renderComponent(EventReminderEmail, props);

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Reminder: ${props.eventTitle} is Coming Up!`,
    html,
  });

  return { error: error?.message || null };
}
