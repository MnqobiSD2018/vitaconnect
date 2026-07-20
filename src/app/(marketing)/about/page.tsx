import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Ticket, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About | VitaConnect',
  description: 'Zimbabwe\'s leading event management and ticketing platform.',
};

const values = [
  { icon: Ticket, title: 'Seamless Ticketing', desc: 'Instant digital tickets with QR codes, Paynow and EcoCash payments, and real-time availability.' },
  { icon: Shield, title: 'Trust & Security', desc: 'Secure payments, encrypted QR codes, and fraud protection for organizers and attendees.' },
  { icon: Users, title: 'Community First', desc: 'Built for Zimbabwe — supporting local payment methods and serving organizers nationwide.' },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">About VitaConnect</h1>
        <p className="mt-4 text-lg text-slate-600">
          VitaConnect is Zimbabwe&#39;s next-generation event technology platform. We provide organizers with the tools to
          sell tickets, manage attendees, process local payments, and handle registrations — all in one place.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-slate-200 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <v.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{v.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            To empower Zimbabwean event organizers with world-class technology — from the Victoria Falls Marathon to
            local community festivals — by removing payment barriers, automating operations, and providing real-time
            engagement for participants and audiences.
          </p>
        </div>

        <div className="mt-12 rounded-2xl bg-slate-50 border border-slate-200 p-8 text-center">
          <h2 className="text-xl font-bold text-slate-900">Ready to get started?</h2>
          <p className="mt-2 text-sm text-slate-600">Create your event and start selling tickets in minutes.</p>
          <Link
            href="/sell"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-teal-600 px-8 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
          >
            Start Selling Tickets
          </Link>
        </div>
      </div>
    </div>
  );
}