import React from 'react';

interface EventReminderProps {
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  ticketCode: string;
}

export default function EventReminderEmail({
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  ticketCode,
}: EventReminderProps) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Vita<span style={{ color: '#0d9488' }}>Connect</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Event Reminder</p>
      </div>

      <div style={{ background: '#fff7ed', borderRadius: 16, padding: 24, border: '1px solid #fed7aa' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>&#x23f0;</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {eventTitle} is Coming Up!
          </h2>
        </div>

        <div style={{ background: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 14, color: '#64748b' }}>Date</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{eventDate}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 14, color: '#64748b' }}>Time</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{eventTime}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 14, color: '#64748b' }}>Venue</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{eventLocation}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, color: '#64748b' }}>Ticket</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>{ticketCode}</span>
          </div>
        </div>

        <div style={{ background: '#fef2f2', borderRadius: 8, padding: 12, fontSize: 13, color: '#991b1b' }}>
          Don&apos;t forget to bring your ticket QR code (printed or on your phone) for scanning at the entrance.
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, color: '#94a3b8', fontSize: 12 }}>
        <p>Have a great time at the event!</p>
        <p>VitaConnect &mdash; Zimbabwe&apos;s Ticketing Platform</p>
      </div>
    </div>
  );
}
