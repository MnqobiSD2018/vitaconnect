import Link from 'next/link';
import { CheckCircle, TrendingUp, Users, Smartphone, Shield, HeadphonesIcon, BarChart3, TicketCheck, Zap } from 'lucide-react';

const stats = [
  { value: '10,000+', label: 'Tickets Sold' },
  { value: '500+', label: 'Events Hosted' },
  { value: '98%', label: 'Payout Success Rate' },
  { value: '5 min', label: 'Average Setup' },
];

const features = [
  {
    icon: Smartphone,
    title: 'Local Payments',
    description: 'Accept EcoCash, OneMoney, InnBucks, and international cards via Paynow & Stripe — no bank account required.',
  },
  {
    icon: TicketCheck,
    title: 'Smart Ticketing',
    description: 'QR-coded tickets with real-time validation, attendee management, and check-in via the VitaConnect Scanner app.',
  },
  {
    icon: BarChart3,
    title: 'Live Dashboard',
    description: 'Track sales, revenue, and attendance in real time from any device. Export reports for accounting.',
  },
  {
    icon: TrendingUp,
    title: 'Marketing Tools',
    description: 'Built-in event discovery, social sharing, and discount codes to help you reach more attendees across Zimbabwe.',
  },
  {
    icon: Shield,
    title: 'Fraud Protection',
    description: 'Every ticket is cryptographically signed. QR codes rotate per-event to prevent counterfeiting and duplication.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Local Support',
    description: 'WhatsApp and phone support in English, Shona, and Ndebele. We help you set up your first event for free.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Create Your Event',
    description: 'Set up your event page in minutes — add a description, upload a banner, set ticket tiers and pricing.',
  },
  {
    number: '02',
    title: 'Start Selling',
    description: 'Share your custom event link. Attendees buy tickets via EcoCash, card, or mobile money — you get paid instantly.',
  },
  {
    number: '03',
    title: 'Check In & Grow',
    description: 'Scan tickets at the gate with our free scanner app. Access sales reports and repeat with one click.',
  },
];

const faqs = [
  { q: 'How do I get paid?', a: 'Payouts are sent via EcoCash, bank transfer, or Paynow to your registered account within 2 business days after an event ends.' },
  { q: 'Is there a monthly fee?', a: 'No. VitaConnect charges a 5% service fee per ticket sold. Free to sign up, free to list events — you only pay when you sell.' },
  { q: 'Can I sell both USD and ZiG tickets?', a: 'Yes. Each ticket tier can be priced in USD or ZiG. Attendees see the total in their preferred currency at checkout.' },
  { q: 'Do I need a bank account?', a: 'No. You can receive payouts via EcoCash or OneMoney. A bank account is optional for larger payouts.' },
];

export default function SellPage() {
  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.05)_0%,_transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-teal-500/10 px-4 py-1.5 text-xs font-semibold text-teal-300 tracking-wide uppercase mb-6 border border-teal-500/20">
              Built for Zimbabwean Event Organizers
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Sell Tickets, Not Your Time.
            </h1>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              VitaConnect gives you everything you need to sell tickets, manage attendees, and get paid — including EcoCash and mobile money. Set up your first event in minutes.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register?role=organizer"
                className="inline-flex h-14 w-full sm:w-auto items-center justify-center rounded-xl bg-teal-500 px-10 text-base font-bold text-slate-950 shadow-lg hover:bg-teal-400 transition-all duration-200"
              >
                Start Selling Free
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex h-14 w-full sm:w-auto items-center justify-center rounded-xl border border-slate-500 px-10 text-base font-semibold text-slate-200 hover:bg-white/5 transition-all duration-200"
              >
                How It Works
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="bg-slate-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Get Selling in 3 Simple Steps</h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              From event creation to getting paid — we make it effortless.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <span className="text-5xl font-black text-teal-600/15 absolute top-4 right-6 select-none">
                  {step.number}
                </span>
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white text-lg font-bold mb-6">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why VitaConnect ── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Everything You Need to Sell Tickets</h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              Purpose-built for the Zimbabwean market — from Harare to Bulawayo.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600 mb-5">
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="bg-slate-900 py-20 sm:py-28 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block rounded-full bg-teal-500/10 px-4 py-1.5 text-xs font-semibold text-teal-300 tracking-wide uppercase mb-6 border border-teal-500/20">
            Simple Pricing
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl">5% Per Ticket. Nothing Else.</h2>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            No monthly fees, no setup costs, no hidden charges. You only pay when you sell tickets.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 text-left max-w-3xl mx-auto">
            {[
              { title: 'Free to Join', desc: 'Create an account and list your first event at no cost.' },
              { title: 'Free to List', desc: 'No upfront listing fees. Create unlimited events.' },
              { title: '5% Per Sale', desc: 'Only pay when you sell. Includes payment processing.' },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
                <CheckCircle className="h-5 w-5 text-teal-400 mb-3" />
                <h3 className="font-bold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link
              href="/register?role=organizer"
              className="inline-flex h-14 items-center justify-center rounded-xl bg-teal-500 px-10 text-base font-bold text-slate-950 shadow-lg hover:bg-teal-400 transition-all duration-200"
            >
              Start Selling Free
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group rounded-2xl border border-slate-200 bg-white p-5 open:shadow-sm transition-shadow">
                <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-bold text-slate-900">
                  {faq.q}
                  <Zap className="h-4 w-4 text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-4" />
                </summary>
                <p className="mt-3 text-sm text-slate-500 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-500 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to Sell Tickets?</h2>
          <p className="mt-4 text-lg text-teal-50 max-w-xl mx-auto">
            Join hundreds of Zimbabwean event organizers using VitaConnect. Set up your event in 5 minutes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register?role=organizer"
              className="inline-flex h-14 w-full sm:w-auto items-center justify-center rounded-xl bg-white px-10 text-base font-bold text-teal-700 shadow-lg hover:bg-teal-50 transition-all duration-200"
            >
              Get Started Free
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-14 w-full sm:w-auto items-center justify-center rounded-xl border border-white/30 px-10 text-base font-semibold text-white hover:bg-white/10 transition-all duration-200"
            >
              Talk to Our Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
