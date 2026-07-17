import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | VitaConnect',
  description: 'VitaConnect privacy policy — how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: July 2026</p>

        <div className="mt-12 space-y-8 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Information We Collect</h2>
            <p>We collect information you provide when creating an account, purchasing tickets, or registering for events. This includes your name, email address, phone number, and payment information processed through our payment partners.</p>
            <p className="mt-2">If you are an organizer, we additionally collect business details, banking information for payouts, and event-related content you upload.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To process ticket purchases and deliver digital tickets</li>
              <li>To send order confirmations, event reminders, and support communications</li>
              <li>To process payouts to event organizers</li>
              <li>To improve our platform and personalize your experience</li>
              <li>To comply with legal obligations and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Data Sharing</h2>
            <p>We share your information only with:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Event organizers</strong> — your name and ticket details for check-in purposes</li>
              <li><strong>Payment processors</strong> — Paynow and Stripe for transaction processing</li>
              <li><strong>Service providers</strong> — Resend (email delivery), Supabase (database hosting)</li>
            </ul>
            <p className="mt-2">We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Data Security</h2>
            <p>We implement industry-standard security measures including encryption in transit (TLS), encrypted QR codes for ticket verification, and strict access controls on our database. Payment data is handled directly by Paynow and Stripe — we never store full card details.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. You can update your profile information in your account dashboard. For account deletion, please contact us at admin@vitaconnect.co.zw.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Contact</h2>
            <p>For privacy-related inquiries, contact us at admin@vitaconnect.co.zw or visit our Contact page.</p>
          </section>
        </div>
      </div>
    </div>
  );
}