import React from 'react';

interface OrganizerPayoutProps {
  organizationName: string;
  amount: number;
  payoutMethod: string;
  payoutDate: string;
  eventTitle: string;
}

export default function OrganizerPayoutEmail({
  organizationName,
  amount,
  payoutMethod,
  payoutDate,
  eventTitle,
}: OrganizerPayoutProps) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Vita<span style={{ color: '#0d9488' }}>Connect</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Payout Notification</p>
      </div>

      <div style={{ background: '#f0fdf4', borderRadius: 16, padding: 24, border: '1px solid #bbf7d0' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>&#x1f4b0;</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>Payout Processed</h2>
        </div>

        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 4px' }}>Organization</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0 }}>{organizationName}</p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 4px' }}>Event</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0 }}>{eventTitle}</p>
        </div>

        <div style={{ background: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 14, color: '#64748b' }}>Amount</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>${amount.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 14, color: '#64748b' }}>Method</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{payoutMethod}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, color: '#64748b' }}>Date</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{payoutDate}</span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, color: '#94a3b8', fontSize: 12 }}>
        <p>Payouts are processed within 2 business days after an event ends.</p>
        <p>VitaConnect &mdash; Zimbabwe&apos;s Ticketing Platform</p>
      </div>
    </div>
  );
}
