import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | VitaConnect',
  description: 'VitaConnect terms of service — rules and guidelines for using our platform.',
};

export default function TermsPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: July 2026</p>

        <div className="mt-12 space-y-8 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Acceptance of Terms</h2>
            <p>By using VitaConnect, you agree to these Terms of Service. If you do not agree, do not use the platform. We reserve the right to update these terms at any time; continued use constitutes acceptance of changes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You must be at least 18 years old to create an organizer account. Attendees under 18 may use the platform with parental supervision.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Ticket Purchases</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>All ticket sales are final unless the event is cancelled by the organizer</li>
              <li>Refunds for cancelled events are processed within 14 business days</li>
              <li>Tickets are non-transferable unless transfer is enabled by the organizer</li>
              <li>QR codes are your proof of entry — do not share them publicly</li>
              <li>Fraudulent use of tickets will result in denial of entry without refund</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Organizer Obligations</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Organizers must provide accurate event information including date, time, venue, and pricing</li>
              <li>Organizers are responsible for event delivery, including venue access, timing services, and attendee experience</li>
              <li>Payouts are processed within 3 business days after event completion</li>
              <li>VitaConnect charges a 5% service fee on all ticket sales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Prohibited Uses</h2>
            <p>You may not use VitaConnect to sell tickets for illegal events, counterfeit goods, or services that violate Zimbabwean law. Violation will result in account termination and forfeiture of funds.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Limitation of Liability</h2>
            <p>VitaConnect acts as a platform connecting organizers and attendees. We are not responsible for event cancellation, changes, or quality. Our liability is limited to the total fees paid to VitaConnect for the specific transaction in question.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Governing Law</h2>
            <p>These terms are governed by the laws of Zimbabwe. Any disputes shall be resolved in the courts of Harare, Zimbabwe.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Contact</h2>
            <p>For questions about these terms, contact admin@vitaconnect.co.zw.</p>
          </section>
        </div>
      </div>
    </div>
  );
}