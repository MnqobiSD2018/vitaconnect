'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MOCK_TIMING_RESULTS, Event, TimingResult } from '@/lib/constants/mockData';
import { listEvents } from '@/lib/eventStore';
import { Search, Calendar, MapPin, Trophy, Activity, ArrowRight, Clock, User, Award, ArrowUpRight, Zap, Shield, Smartphone } from 'lucide-react';
import logoWhite from '@/app/media/vc-white.svg';

export default function MarketingHomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [events, setEvents] = useState<Event[]>([]);
  
  // Timing Search States
  const [timingSearch, setTimingSearch] = useState<string>('');
  const [timingResult, setTimingResult] = useState<TimingResult | null>(null);
  const [timingError, setTimingError] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    listEvents()
      .then((items) => {
        if (!cancelled) setEvents(items);
      })
      .catch(() => {
        if (!cancelled) setEvents([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Filter events based on category and title search
  const filteredEvents = events.filter((event) => {
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle live timing search
  const handleTimingSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setTimingResult(null);
    setTimingError('');

    if (!timingSearch.trim()) {
      setTimingError('Please enter a Bib number or runner name.');
      return;
    }

    const query = timingSearch.trim().toLowerCase();
    
    // Find runner by bib number or name match
    const result = MOCK_TIMING_RESULTS.find(
      (runner) => runner.bib === query || runner.name.toLowerCase().includes(query)
    );

    if (result) {
      setTimingResult(result);
    } else {
      setTimingError('No timing record found. Try Bib "1042" or Name "Tendai".');
    }
  };

  return (
    <div className="flex flex-col gap-16 pb-20 bg-slate-50/30">
      
      {/* Hero Section - Matching login sidebar style */}
      <section
        className="relative overflow-hidden text-white py-16 md:py-24"
        style={{ background: 'linear-gradient(135deg, rgb(15 23 42) 0%, rgb(30 41 59) 55%, rgb(51 65 85) 100%)' }}
      >
        {/* Background logo watermark */}
        <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-5 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={(logoWhite as any).src || logoWhite}
            alt=""
            width={500}
            style={{ height: 'auto' }}
          />
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            {/* Banner badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-slate-200 backdrop-blur-md mb-6 hover:bg-white/20 transition-all duration-300">
              <Zap className="h-3.5 w-3.5 text-teal-400" />
              <span>Zimbabwe's Premier Ticketing Platform</span>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-white leading-tight">
              Your Gateway to <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, rgb(45 212 191) 0%, rgb(45 212 191) 45%, rgb(248 250 252) 100%)' }}
              >
                Great Local Events
              </span>
            </h1>
            
            <p className="mt-6 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
              Discover concerts, conferences, marathons and community festivals across Zimbabwe. Secure your timing-linked tickets in seconds with EcoCash, OneMoney, or Card.
            </p>

            {/* Event Search Box */}
            <div className="mt-10 max-w-xl">
              <div className="relative flex items-center rounded-2xl border border-white/10 bg-white/10 p-1.5 shadow-2xl backdrop-blur-md">
                <Search className="ml-3 h-5 w-5 text-slate-300 shrink-0" />
                <input
                  type="text"
                  placeholder="Search events by name, city, or venue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent py-2.5 px-3 text-sm text-white placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Directory Section */}
      <section id="events" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Upcoming Events</h2>
            <p className="mt-1.5 text-sm text-slate-500">Select an event below to purchase tickets and register</p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Sports', 'Music', 'Business'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-4 py-2 text-xs font-bold tracking-wide transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-sm scale-[1.01]'
                    : 'bg-slate-100 text-slate-600 border border-slate-200/40 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              // Find starting price
              const minPrice = Math.min(...event.ticketTiers.map((t) => t.price));
              return (
                <div 
                  key={event.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  {/* Image Aspect Box */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    <img
                      src={event.image || undefined}
                      alt={event.title}
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-103"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'; }}
                    />
                    <div
                      className="absolute inset-0 opacity-80"
                      style={{ background: 'linear-gradient(0deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0) 100%)' }}
                    />
                    
                    {/* Category Tag */}
                    <span className={`absolute top-4 left-4 rounded-full px-2.5 py-0.5 text-xxs font-bold uppercase tracking-wider ${
                      event.category === 'Sports' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      event.category === 'Music' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                      'bg-sky-50 text-sky-700 border border-sky-100'
                    }`}>
                      {event.category}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-bold text-slate-950 group-hover:text-teal-650 transition-colors duration-200">
                      <Link href={`/events/${event.slug}`}>
                        {event.title}
                      </Link>
                    </h3>
                    
                    <p className="mt-2 line-clamp-2 text-xs text-slate-500 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="mt-5 space-y-2 text-xs text-slate-650 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-700">{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="truncate text-slate-700">{event.location}</span>
                      </div>
                    </div>

                    {/* Footer Row */}
                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Tickets from</span>
                        <p className="text-lg font-bold text-slate-900">
                          ${minPrice} <span className="text-xs font-semibold text-slate-500">USD</span>
                        </p>
                      </div>
                      <Link
                        href={`/events/${event.slug}`}
                        className="inline-flex h-9 items-center justify-center gap-1 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 text-xs font-bold text-white transition-all duration-200 shadow-sm"
                      >
                        <span>Buy Tickets</span>
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 text-center py-16 border border-dashed border-slate-300 rounded-2xl bg-white">
            <p className="text-slate-500 text-sm">No events found matching your filter criteria.</p>
            <button 
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="mt-3 text-xs text-teal-650 font-bold hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* Live Timing Results Widget (Hypenation Specialty) */}
      <section id="results" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-10 shadow-sm relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start relative z-10">
            {/* Intro text */}
            <div className="lg:col-span-2 space-y-4">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 border border-teal-100">
                <Activity className="h-3.5 w-3.5 text-teal-650" />
                <span>VitaTiming Live Results</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Race Timing & Results Look-up
              </h2>
              <p className="text-sm text-slate-555 leading-relaxed">
                Enter your **Bib Number** or **Last Name** below to instantly load race results, overall ranking, category placement, and split checkpoint times.
              </p>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
                <span className="font-bold text-slate-800 block mb-1">Quick Demo Data:</span>
                Search bib <strong className="text-teal-600 font-bold">1042</strong> (Chipo Moyo - Half Marathon) or <strong className="text-teal-600 font-bold">2055</strong> (Tendai Mashingaidze - Full Marathon Winner).
              </div>
            </div>

            {/* Look-up Form & Results Pane */}
            <div className="lg:col-span-3 space-y-6">
              <form onSubmit={handleTimingSearch} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Enter Bib (e.g. 1042) or Runner Name..."
                  value={timingSearch}
                  onChange={(e) => setTimingSearch(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 text-slate-950 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-400 placeholder-slate-400"
                />
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl px-6 py-3 transition-colors duration-200 shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Search className="h-4.5 w-4.5" />
                  <span>Search Results</span>
                </button>
              </form>

              {/* Error messages */}
              {timingError && (
                <p className="text-xs text-rose-500 font-semibold pl-1">{timingError}</p>
              )}

              {/* Timing Result Pane */}
              {timingResult && (
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 md:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Runner Info Header */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-teal-650 uppercase tracking-wider">Bib #{timingResult.bib}</span>
                        <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xxs font-bold ${
                          timingResult.status === 'Finished' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          timingResult.status === 'Running' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {timingResult.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{timingResult.name}</h3>
                      <div className="flex gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-slate-400" /> {timingResult.gender}, Age {timingResult.age}</span>
                        <span className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5 text-slate-400" /> {timingResult.category}</span>
                      </div>
                    </div>
                    
                    {/* Big Finish Time */}
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Official Time</span>
                      <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{timingResult.finishTime}</p>
                      <span className="text-xs text-slate-500 font-mono">Pace: {timingResult.pace}</span>
                    </div>
                  </div>

                  {/* Rank boxes */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1 font-semibold">Overall Rank</span>
                      <div className="flex items-center justify-center gap-1 text-slate-900">
                        <Award className={`h-4 w-4 ${timingResult.overallRank === 1 ? 'text-amber-500' : 'text-slate-400'}`} />
                        <span className="text-base font-bold">{timingResult.overallRank || '-'}</span>
                        <span className="text-xs text-slate-400 font-medium">/{timingResult.totalRunners}</span>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1 font-semibold">Gender Rank</span>
                      <div className="flex items-center justify-center gap-1 text-slate-900">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="text-base font-bold">{timingResult.genderRank || '-'}</span>
                        <span className="text-xs text-slate-400 font-medium">/{timingResult.totalGenderRunners}</span>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1 font-semibold">Status</span>
                      <p className="text-base font-bold text-slate-800">{timingResult.status}</p>
                    </div>
                  </div>

                  {/* Split Checkpoints */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Checkpoint Splits</h4>
                    <div className="border border-slate-200 rounded-xl divide-y divide-slate-200 bg-white overflow-hidden">
                      {timingResult.splits.map((split, i) => (
                        <div key={i} className="flex justify-between px-4 py-2.5 text-xs">
                          <span className="text-slate-500 font-medium">{split.name}</span>
                          <span className="font-mono text-slate-850 font-semibold">{split.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section id="features" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Professional Timing & Ticketing Solutions</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            We provide everything needed to host a successful mass-participation sporting event, corporate conference, or concert in Zimbabwe.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Feature 1 */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 hover:border-slate-350 hover:shadow-sm transition-all duration-200">
            <div className="bg-teal-50 border border-teal-100 text-teal-650 p-3 rounded-xl w-fit">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-950">RFID timing chip Sync</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every athletic participant ticket automatically reserves a pre-assigned RFID bib timing chip for precise lap and finish timing.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 hover:border-slate-350 hover:shadow-sm transition-all duration-200">
            <div className="bg-teal-50 border border-teal-100 text-teal-650 p-3 rounded-xl w-fit">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-950">Instant Local Payments</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Integrated with Paynow for seamless EcoCash, OneMoney, Visa, and Mastercard purchases in USD and local currencies.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 hover:border-slate-350 hover:shadow-sm transition-all duration-200">
            <div className="bg-teal-50 border border-teal-100 text-teal-650 p-3 rounded-xl w-fit">
              <Smartphone className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-950">Instant QR Code Tickets</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Receive your print-ready digital ticket with a unique verification QR code via email or PDF immediately upon payment clearance.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 hover:border-slate-350 hover:shadow-sm transition-all duration-200">
            <div className="bg-teal-50 border border-teal-100 text-teal-650 p-3 rounded-xl w-fit">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-950">Organizer Security</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              High-speed gates check-in scanning app prevents ticket counterfeiting and duplication. Dedicated organizer dash for analytics.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
