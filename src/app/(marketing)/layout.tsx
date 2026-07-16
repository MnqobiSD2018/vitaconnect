'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, X, Phone, Mail, MapPin, CheckSquare } from 'lucide-react';
import logoBlack from '@/app/media/mainvc.svg';
import logoWhite from '@/app/media/vc-white.svg';
import { useAuth } from '@/hooks/use-auth';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  const getDashboardPath = () => {
    if (!profile) return '/dashboard';
    switch (profile.role) {
      case 'admin': return '/admin';
      case 'organizer': return '/organizer';
      default: return '/dashboard';
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-850 selection:bg-slate-200 selection:text-slate-800">
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 p-2 shadow-sm transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={logoWhite}
                  alt="VitaConnect Logo"
                  width={24}
                  height={24}
                />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  Vita<span className="text-teal-600">Connect</span>
                </span>
                <p className="text-[10px] text-slate-500 font-medium -mt-1 leading-none">
                  Zimbabwe's Ticketing Platform
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#events" className="text-sm font-semibold text-slate-650 hover:text-slate-950 transition-colors">
              Browse Events
            </Link>
            <Link href="/#results" className="text-sm font-semibold text-slate-650 hover:text-slate-950 transition-colors">
              Timing Results
            </Link>
            <Link href="/#features" className="text-sm font-semibold text-slate-650 hover:text-slate-950 transition-colors">
              Timing Chips
            </Link>
            <Link href="/contact" className="text-sm font-semibold text-slate-650 hover:text-slate-950 transition-colors">
              Contact Support
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? null : user ? (
              <Link 
                href={getDashboardPath()}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 px-5 text-sm font-semibold text-white shadow-sm hover:opacity-95 transition-all duration-200 active:scale-[0.98]"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/#events"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 px-5 text-sm font-semibold text-white shadow-sm hover:opacity-95 transition-all duration-200 active:scale-[0.98]"
                >
                  Buy Tickets
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden border border-slate-200"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="border-b border-slate-200 bg-white px-4 py-4 md:hidden animate-in fade-in slide-in-from-top-5 duration-200">
            <nav className="flex flex-col gap-4">
              <Link
                href="/#events"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-750 hover:text-slate-950"
              >
                Browse Events
              </Link>
              <Link
                href="/#results"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-750 hover:text-slate-950"
              >
                Timing Results
              </Link>
              <Link
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-750 hover:text-slate-950"
              >
                Timing Chips
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-750 hover:text-slate-950"
              >
                Contact Support
              </Link>
              <hr className="border-slate-100 my-1" />
              <div className="flex flex-col gap-3">
                {user ? (
                  <Link
                    href={getDashboardPath()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 text-sm font-semibold text-white hover:opacity-95"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex h-11 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/#events"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 text-sm font-semibold text-white hover:opacity-95"
                    >
                      Buy Tickets
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-900 py-12 sm:py-16 text-slate-350">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 p-2">
                  <Image
                    src={logoWhite}
                    alt="Logo"
                    width={20}
                    height={20}
                  />
                </div>
                <span className="text-lg font-bold tracking-tight text-white">
                  Vita<span className="text-teal-400">Connect</span>
                </span>
              </Link>
              <p className="max-w-md text-sm leading-relaxed text-slate-400">
                VitaConnect is Zimbabwe's leading next-generation event management, ticketing, and live timing solution. We power marathons, festivals, and business events nationwide with RFID technology and instant local payments.
              </p>
              <div className="space-y-2 text-sm text-slate-350">
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-teal-450 shrink-0" />
                  <span>+263 777 980 062 / +263 719 591 300</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-teal-450 shrink-0" />
                  <span>admin@vitaconnect.co.zw</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-teal-450 shrink-0" />
                  <span>Harare Sports Club Premises, Harare, Zimbabwe</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase">Upcoming Events</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href="/events/harare-city-marathon-2026" className="text-slate-400 hover:text-white transition-colors">
                    Harare City Marathon
                  </Link>
                </li>
                <li>
                  <Link href="/events/victoria-falls-carnival-2026" className="text-slate-400 hover:text-white transition-colors">
                    Victoria Falls Carnival
                  </Link>
                </li>
                <li>
                  <Link href="/events/zimbabwe-tech-summit-2026" className="text-slate-400 hover:text-white transition-colors">
                    Zim Tech Summit
                  </Link>
                </li>
              </ul>
            </div>

            {/* Platform info */}
            <div>
              <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase">Features</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li className="flex items-center gap-2 text-slate-400">
                  <CheckSquare className="h-4 w-4 text-teal-450 shrink-0" />
                  <span>RFID Timing Chips</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <CheckSquare className="h-4 w-4 text-teal-450 shrink-0" />
                  <span>Paynow EcoCash & Swipe</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <CheckSquare className="h-4 w-4 text-teal-450 shrink-0" />
                  <span>Interactive Live Timing</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <CheckSquare className="h-4 w-4 text-teal-450 shrink-0" />
                  <span>PDF Tickets & QR Codes</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} VitaConnect Ltd. All rights reserved. Timing services licensed under VitaTiming systems.
            </p>
            <div className="flex gap-6 text-xs text-slate-500">
              <a href="#" className="hover:text-slate-400">Privacy Policy</a>
              <a href="#" className="hover:text-slate-400">Terms of Service</a>
              <a href="#" className="hover:text-slate-400">Indemnity Waiver</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
