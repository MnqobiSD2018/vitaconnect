import React from 'react';

interface TicketConfirmationProps {
  eventTitle: string;
  orderNumber: string;
  holderName: string;
  ticketCodes: string[];
  eventDate: string;
  eventLocation: string;
}

export default function TicketConfirmationEmail({
  eventTitle,
  orderNumber,
  holderName,
  ticketCodes,
  eventDate,
  eventLocation,
}: TicketConfirmationProps) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Vita<span style={{ color: '#0d9488' }}>Connect</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Your Ticket Confirmation</p>
      </div>

      <div style={{ background: '#f8fafc', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>&#x2705;</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>Payment Confirmed!</h2>
          <p style={{ color: '#64748b', fontSize: 14 }}>Order #{orderNumber}</p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 4px' }}>Event</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0 }}>{eventTitle}</p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 4px' }}>Ticket Holder</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0 }}>{holderName}</p>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 4px' }}>Date</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>{eventDate}</p>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 4px' }}>Venue</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>{eventLocation}</p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: '0 0 8px' }}>Ticket Codes</p>
          {ticketCodes.map((code) => (
            <div key={code} style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '8px 12px',
              marginBottom: 6,
              fontFamily: 'monospace',
              fontSize: 13,
              color: '#0f172a',
            }}>
              {code}
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, color: '#94a3b8', fontSize: 12 }}>
        <p>Present your ticket QR code at the venue for entry.</p>
        <p>VitaConnect &mdash; Zimbabwe&apos;s Ticketing Platform</p>
      </div>
    </div>
  );
}
