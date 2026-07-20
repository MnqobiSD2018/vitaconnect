'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import logoWhite from '@/app/media/vc-white.svg';
import { useAuth } from '@/hooks/use-auth';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, loading, signOut } = useAuth();

  const getDashboardPath = () => {
    if (!profile) return '/dashboard';
    switch (profile.role) {
      case 'admin': return '/admin';
      case 'organizer': return '/organizer';
      default: return '/dashboard';
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 p-1.5 transition-transform duration-200 group-hover:scale-105">
              <Image
                src={logoWhite}
                alt="VitaConnect"
                width={20}
                height={20}
              />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              Vita<span className="text-teal-600">Connect</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7">
            <Link href="/#events" className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
              Events
            </Link>
            <Link href="/#categories" className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
              Categories
            </Link>
            <Link href="/#organizers" className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
              For Organizers
            </Link>
            <Link href="/about" className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
              About
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? null : user ? (
              <Link
                href={getDashboardPath()}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-4 text-[13px] font-medium text-white hover:bg-slate-800 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[13px] font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-4 text-[13px] font-medium text-white hover:bg-slate-800 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white px-5 py-5 md:hidden">
            <nav className="flex flex-col gap-1">
              <Link
                href="/#events"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                Events
              </Link>
              <Link
                href="/#categories"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                Categories
              </Link>
              <Link
                href="/#organizers"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                For Organizers
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                About
              </Link>
              <div className="my-2 border-t border-slate-100" />
              {user ? (
                <Link
                  href={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-10 items-center justify-center rounded-lg bg-slate-900 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-10 items-center justify-center rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-10 items-center justify-center rounded-lg bg-slate-900 text-sm font-medium text-white hover:bg-slate-800 mt-2"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 p-1.5">
                  <Image
                    src={logoWhite}
                    alt="Logo"
                    width={16}
                    height={16}
                  />
                </div>
                <span className="text-sm font-bold tracking-tight text-slate-900">
                  Vita<span className="text-teal-600">Connect</span>
                </span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-slate-500 max-w-xs">
                Zimbabwe&apos;s event ticketing platform. Discover, book, and experience events.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-xs font-semibold tracking-wider text-slate-900 uppercase">Product</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li><Link href="/#events" className="text-slate-500 hover:text-slate-900 transition-colors">Browse Events</Link></li>
                <li><Link href="/#categories" className="text-slate-500 hover:text-slate-900 transition-colors">Categories</Link></li>
                <li><Link href="/sell" className="text-slate-500 hover:text-slate-900 transition-colors">Sell Tickets</Link></li>
                <li><Link href="/#organizers" className="text-slate-500 hover:text-slate-900 transition-colors">For Organizers</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-xs font-semibold tracking-wider text-slate-900 uppercase">Company</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li><Link href="/about" className="text-slate-500 hover:text-slate-900 transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-slate-500 hover:text-slate-900 transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="text-slate-500 hover:text-slate-900 transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="text-slate-500 hover:text-slate-900 transition-colors">Terms</Link></li>
              </ul>
            </div>

            {/* Get the app */}
            <div>
              <h3 className="text-xs font-semibold tracking-wider text-slate-900 uppercase">Get the app</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li><span className="text-slate-400">iOS coming soon</span></li>
                <li><span className="text-slate-400">Android coming soon</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} VitaConnect. All rights reserved.
            </p>
            <p className="text-xs text-slate-400">
              Harare, Zimbabwe
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
