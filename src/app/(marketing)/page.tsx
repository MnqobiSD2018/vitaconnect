'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Event } from '@/lib/constants/mockData';
import { listEvents } from '@/lib/eventStore';
import {
  Search,
  Calendar,
  MapPin,
  ArrowUpRight,
  Shield,
  Ticket,
  Clock,
  Music,
  Briefcase,
  Trophy,
  Utensils,
  GraduationCap,
  Moon,
  Users,
  Palette,
  ArrowRight,
} from 'lucide-react';
import SaveEventButton from '@/components/SaveEventButton';

function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.2 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (!inView) return;
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const CATEGORIES = [
  { name: 'Music', icon: Music },
  { name: 'Business', icon: Briefcase },
  { name: 'Sports', icon: Trophy },
  { name: 'Food & Drink', icon: Utensils },
  { name: 'Education', icon: GraduationCap },
  { name: 'Nightlife', icon: Moon },
  { name: 'Community', icon: Users },
  { name: 'Arts', icon: Palette },
];

export default function MarketingHomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    let cancelled = false;
    listEvents()
      .then((items) => { if (!cancelled) setEvents(items); })
      .catch(() => { if (!cancelled) setEvents([]); });
    return () => { cancelled = true; };
  }, []);

  const featuredEvents = events.slice(0, 3);

  return (
    <div className="flex flex-col">

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 pt-16 pb-12 sm:pt-24 sm:pb-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-widest text-teal-600 uppercase mb-4">
              Zimbabwe&apos;s Ticketing Platform
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.08]">
              Discover.<br />
              Book.<br />
              Experience.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg">
              Find unforgettable events near you, purchase tickets securely, and keep every event in one place.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/#events"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
              >
                Explore Events
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/sell"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                Become an Organizer
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 pb-16 sm:pb-24">
          <div className="relative overflow-hidden rounded-xl aspect-[21/9] bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=2400&q=80"
              alt="Live concert event with crowd and stage lights"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
          </div>
        </div>
      </section>

      {/* ─── Search + Featured Events ─── */}
      <section id="events" className="bg-slate-50/60 border-y border-slate-100 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Featured This Week
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Handpicked events happening near you.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-colors"
              />
            </div>
          </div>

          {featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.map((event) => {
                const prices = event.ticketTiers.map((t) => t.price).filter((p) => typeof p === 'number' && !isNaN(p));
                const minPrice = prices.length > 0 ? Math.min(...prices) : null;
                return (
                  <div
                    key={event.id}
                    className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-all duration-200 hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={event.image || undefined}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
                        }}
                      />
                      <div className="absolute top-3 right-3 z-10">
                        <SaveEventButton
                          eventId={event.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm border-0 hover:bg-white transition-colors shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{event.date}</span>
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 leading-snug">
                        <Link href={`/events/${event.slug}`} className="hover:text-teal-600 transition-colors">
                          {event.title}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="mt-auto pt-5 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">From</span>
                          <p className="text-lg font-bold text-slate-900 leading-tight">
                            {minPrice !== null ? (
                              <>{minPrice} <span className="text-xs font-medium text-slate-400">USD</span></>
                            ) : (
                              <span className="text-sm font-normal text-slate-400">TBA</span>
                            )}
                          </p>
                        </div>
                        <Link
                          href={`/events/${event.slug}`}
                          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
                        >
                          Book
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-lg bg-white">
              <p className="text-slate-400 text-sm">No events available yet.</p>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              href="/events"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              View All Events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Why VitaConnect ─── */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Why VitaConnect
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Everything you need for a seamless event experience.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-7 transition-colors hover:border-slate-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white mb-5">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Secure Ticketing</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Purchase tickets with confidence using secure digital delivery and encrypted payments.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-7 transition-colors hover:border-slate-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white mb-5">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Trusted Organizers</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Browse events hosted by verified organizers with proven track records.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-7 transition-colors hover:border-slate-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white mb-5">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Instant Access</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Your tickets are always available from your dashboard. No printing needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Browse by Category ─── */}
      <section id="categories" className="bg-slate-50/60 border-y border-slate-100 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Browse by Category
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Find events that match your interests.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
            {CATEGORIES.map(({ name, icon: Icon }) => (
              <Link
                key={name}
                href={`/events?category=${encodeURIComponent(name)}`}
                className="group flex flex-col items-center gap-3 rounded-lg border border-slate-200 bg-white p-6 text-center transition-all hover:border-slate-300 hover:shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-slate-600 transition-colors group-hover:bg-slate-900 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-slate-700">{name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── For Organizers ─── */}
      <section id="organizers" className="bg-white scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Create Events That<br />Stand Out
              </h2>
              <p className="mt-4 text-sm text-slate-500 leading-relaxed max-w-md">
                Publish events, manage attendees, monitor ticket sales, and grow your audience from one dashboard.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/sell"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                >
                  Start Organizing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-teal-600" />
                  <span>Digital tickets</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-teal-600" />
                  <span>Secure payments</span>
                </div>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 aspect-[4/3]">
              <div className="absolute inset-0 flex flex-col p-6">
                {/* Fake dashboard header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="h-4 w-32 rounded bg-slate-200" />
                  <div className="h-4 w-20 rounded bg-slate-200" />
                </div>
                {/* Fake stats row */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="rounded-lg bg-white border border-slate-200 p-4">
                    <div className="h-3 w-16 rounded bg-slate-200 mb-2" />
                    <div className="h-6 w-12 rounded bg-slate-900" />
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200 p-4">
                    <div className="h-3 w-16 rounded bg-slate-200 mb-2" />
                    <div className="h-6 w-12 rounded bg-slate-900" />
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200 p-4">
                    <div className="h-3 w-16 rounded bg-slate-200 mb-2" />
                    <div className="h-6 w-12 rounded bg-slate-900" />
                  </div>
                </div>
                {/* Fake chart area */}
                <div className="flex-1 rounded-lg bg-white border border-slate-200 p-4">
                  <div className="h-3 w-24 rounded bg-slate-200 mb-4" />
                  <div className="flex items-end gap-2 h-[calc(100%-20px)]">
                    {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 70].map((h, i) => (
                      <div key={i} className="flex-1 rounded bg-slate-900/10" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="bg-slate-900">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-white sm:text-4xl">
                <AnimatedNumber target={120} suffix="+" />
              </p>
              <p className="mt-2 text-sm text-slate-400">Events Hosted</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white sm:text-4xl">
                <AnimatedNumber target={15000} suffix="+" />
              </p>
              <p className="mt-2 text-sm text-slate-400">Tickets Sold</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white sm:text-4xl">
                <AnimatedNumber target={8500} suffix="+" />
              </p>
              <p className="mt-2 text-sm text-slate-400">Active Users</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white sm:text-4xl">
                <AnimatedNumber target={5} />
              </p>
              <p className="mt-2 text-sm text-slate-400">Cities Reached</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              What People Say
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <blockquote className="rounded-lg border border-slate-200 bg-white p-7">
              <p className="text-sm text-slate-600 leading-relaxed">
                &ldquo;Creating and managing events has never been easier. The dashboard gives me everything I need in one place.&rdquo;
              </p>
              <footer className="mt-5 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-200" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Tatenda M.</p>
                  <p className="text-xs text-slate-400">Event Organizer</p>
                </div>
              </footer>
            </blockquote>

            <blockquote className="rounded-lg border border-slate-200 bg-white p-7">
              <p className="text-sm text-slate-600 leading-relaxed">
                &ldquo;Buying tickets takes less than a minute. EcoCash payment made it so simple for me.&rdquo;
              </p>
              <footer className="mt-5 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-200" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Rumbidzai K.</p>
                  <p className="text-xs text-slate-400">Event Attendee</p>
                </div>
              </footer>
            </blockquote>

            <blockquote className="rounded-lg border border-slate-200 bg-white p-7">
              <p className="text-sm text-slate-600 leading-relaxed">
                &ldquo;The clean interface makes discovering events enjoyable. I find something new every week.&rdquo;
              </p>
              <footer className="mt-5 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-200" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Farai N.</p>
                  <p className="text-xs text-slate-400">Regular Attendee</p>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="bg-slate-50/60 border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Ready for Your Next Experience?
          </h2>
          <p className="mt-3 text-sm text-slate-500 max-w-md mx-auto">
            Discover events that inspire, connect, and entertain.
          </p>
          <div className="mt-8">
            <Link
              href="/events"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
            >
              Explore Events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
