'use client';

import React from 'react';
import Link from 'next/link';
import { Event } from '@/lib/constants/mockData';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  ChevronRight, 
  Ticket 
} from 'lucide-react';
import ReviewsSection from './ReviewsSection';
import SaveEventButton from './SaveEventButton';

interface EventDetailProps {
  event: Event;
}

export default function EventDetail({ event }: EventDetailProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-slate-800">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          href="/#events" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 group transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to events</span>
        </Link>
        <SaveEventButton eventId={event.id} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 transition-colors" />
      </div>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT/MID COLUMN: Event Info & Ticket Tiers */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Event Header Card */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="relative aspect-video w-full max-h-72 overflow-hidden bg-slate-100">
              <img
                src={event.image || undefined}
                alt={event.title}
                className="h-full w-full object-cover object-center"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 rounded-full bg-teal-50 px-3 py-0.5 text-xxs font-bold uppercase tracking-wider text-teal-700 border border-teal-100">
                {event.category}
              </span>
            </div>

            <div className="p-6 md:p-8 space-y-4">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                {event.title}
              </h1>
              
              <p className="text-sm text-slate-500 leading-relaxed">
                {event.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900">Date</p>
                    <p className="text-slate-500 mt-0.5">{event.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900">Time</p>
                    <p className="text-slate-500 mt-0.5">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900">Venue</p>
                    <p className="text-slate-500 mt-0.5 truncate max-w-[180px]">{event.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Tiers Preview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 space-y-6 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Available Tickets</h2>
              <p className="text-xs text-slate-500 mt-1">Select your tickets on the checkout page.</p>
            </div>

            <div className="divide-y divide-slate-100">
              {event.ticketTiers.map((tier) => (
                <div key={tier.id} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-md">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-base font-bold text-slate-900">{tier.name}</h3>
                      <span className="text-xs text-slate-400 font-medium">({tier.available} left)</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{tier.description}</p>
                  </div>

                  <div className="flex items-center gap-5 shrink-0">
                    <span className="text-lg font-bold text-slate-900">
                      ${tier.price} <span className="text-xxs font-semibold text-slate-400">USD</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href={`/checkout/${event.slug}`}
              className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 text-sm font-semibold text-white hover:opacity-95 transition-all duration-200"
            >
              <Ticket className="h-4.5 w-4.5" />
              <span>Get Tickets</span>
              <ChevronRight className="h-4.5 w-4.5" />
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Info Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">Event Summary</h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-450 uppercase tracking-wider block">Date</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{event.date}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-450 uppercase tracking-wider block">Time</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{event.time}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-450 uppercase tracking-wider block">Venue</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{event.location || 'TBA'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-450 uppercase tracking-wider block">Category</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{event.category}</span>
              </div>
            </div>

            {event.ticketTiers.length > 0 && (
              <div className="border-t border-slate-100 pt-4">
                <span className="text-[10px] text-slate-450 uppercase tracking-wider block mb-3">Pricing</span>
                <div className="space-y-2">
                  {event.ticketTiers.map((tier) => (
                    <div key={tier.id} className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-700">{tier.name}</span>
                      <span className="font-bold text-slate-900">${tier.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link
              href={`/checkout/${event.slug}`}
              className="w-full inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 text-sm font-semibold text-white hover:opacity-95 transition-all duration-200"
            >
              <span>Get Tickets</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <ReviewsSection eventId={event.id} />
    </div>
  );
}
