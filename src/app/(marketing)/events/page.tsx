"use client"

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Calendar, MapPin, ArrowUpRight, Filter, Loader2 } from "lucide-react";
import SaveEventButton from "@/components/SaveEventButton";

interface ApiEvent {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  starts_at: string;
  venue_address: string | null;
  category?: string;
  ticketTiers: Array<{
    id: string;
    name: string;
    price: number | string;
    quantity: number;
    quantity_sold: number;
    currency: string;
  }>;
}

export default function BrowseEventsPage() {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchEvents = async (pageNum: number, append: boolean) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);
    try {
      const r = await fetch(`/api/events?page=${pageNum}&limit=9`);
      const data = await r.json();
      if (data.events) {
        setEvents(append ? (prev) => [...prev, ...data.events] : data.events);
        setTotalPages(data.totalPages || 1);
      }
    } catch {}
    finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchEvents(1, false);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEvents(nextPage, true);
  };

  const categories = ["All", "Sports", "Music", "Business", "Comedy"];

  const filteredEvents = events.filter((event) => {
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.venue_address || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-slate-900 py-16 text-white text-center px-4">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Discover Events</h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Find the best concerts, marathons, and conferences happening across Zimbabwe.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-4 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by event name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            <Filter className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-24">
            <Loader2 className="mx-auto h-8 w-8 text-slate-400 animate-spin mb-4" />
            <p className="text-slate-500">Loading events...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => {
                const minPrice = event.ticketTiers.length > 0
                  ? Math.min(...event.ticketTiers.map((t) => Number(t.price)))
                  : 0;
                const dateStr = new Date(event.starts_at).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                return (
                  <div key={event.id} className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="relative h-56 w-full overflow-hidden bg-slate-200">
                      <img
                        src={event.cover_image_url || undefined}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"; }}
                      />
                      {event.category && (
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900 uppercase tracking-wider">
                          {event.category}
                        </div>
                      )}
                      <div className="absolute top-4 right-4 z-10">
                        <SaveEventButton eventId={event.id} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm border-0 hover:bg-white transition-colors shadow-sm" />
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors line-clamp-2">
                        <Link href={`/events/${event.slug}`}>
                          {event.title}
                          <span className="absolute inset-0" />
                        </Link>
                      </h3>

                      <div className="space-y-2 mb-6">
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                          {dateStr}
                        </div>
                        {event.venue_address && (
                          <div className="flex items-center text-sm text-slate-600">
                            <MapPin className="mr-2 h-4 w-4 text-slate-400" />
                            {event.venue_address}
                          </div>
                        )}
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                        <div>
                          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">From</div>
                          <div className="text-lg font-bold text-slate-900">${minPrice}</div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                          <ArrowUpRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {page < totalPages && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-8 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Load More Events
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
            <Search className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-900">No events found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your filters or search term.</p>
            <button
              onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
              className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
