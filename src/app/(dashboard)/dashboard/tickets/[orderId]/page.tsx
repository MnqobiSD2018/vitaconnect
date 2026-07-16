'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Calendar, MapPin, User, CreditCard, QrCode, Info, Loader2 } from 'lucide-react';
import { getOrderDetail } from '@/actions/profile';

export default function OrderDetailsPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getOrderDetail(orderId)
      .then(setOrder)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">{error || 'Order not found'}</p>
        <Link href="/dashboard/tickets" className="mt-4 inline-flex items-center text-sm text-teal-600 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Tickets
        </Link>
      </div>
    );
  }

  const event = order.events;
  const tickets = order.tickets || [];
  const eventDate = event?.starts_at ? new Date(event.starts_at) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/tickets"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Tickets
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">{order.order_number}</h2>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${
              order.status === 'completed'
                ? 'bg-teal-50 text-teal-700 border-teal-200'
                : order.status === 'pending'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {order.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* LEFT COLUMN: Event & Order Summary */}
        <div className="space-y-6 lg:col-span-1">
          {event && (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              {event.cover_image_url && (
                <div
                  className="h-32 bg-slate-200 bg-cover bg-center"
                  style={{ backgroundImage: `url(${event.cover_image_url})` }}
                />
              )}
              <div className="p-5 space-y-4">
                <h3 className="font-bold text-slate-900 leading-tight">{event.title}</h3>
                <div className="space-y-2">
                  {eventDate && (
                    <div className="flex items-center text-sm text-slate-600">
                      <Calendar className="mr-3 h-4 w-4 text-slate-400 flex-shrink-0" />
                      {eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                  {event.venue_address && (
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="mr-3 h-4 w-4 text-slate-400 flex-shrink-0" />
                      {event.venue_address}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Date</span>
                <span className="font-medium text-slate-900">{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment</span>
                <span className="font-medium text-slate-900">{order.payment_provider || 'N/A'}</span>
              </div>
            </div>
            <hr className="border-slate-100" />
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900">${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Fees</span>
                <span className="font-medium text-slate-900">${Number(order.service_fee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 flex items-start gap-3">
            <Info className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600">
              Need help with this order? Contact the organizer or reach out to VitaConnect support.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: The Tickets */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Your Tickets ({tickets.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {tickets.map((ticket: any) => (
              <div key={ticket.id} className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
                <div className="h-2 w-full bg-teal-500" />
                <div className="p-5 text-center bg-white z-10">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                    {ticket.ticket_tiers?.name || 'Ticket'}
                  </span>
                  <h4 className="font-bold text-slate-900 line-clamp-1">{event?.title}</h4>
                </div>
                <div className="relative flex items-center justify-between bg-white z-0">
                  <div className="absolute -left-3 h-6 w-6 rounded-full border border-slate-200 bg-slate-50" />
                  <div className="w-full border-t-2 border-dashed border-slate-200" />
                  <div className="absolute -right-3 h-6 w-6 rounded-full border border-slate-200 bg-slate-50" />
                </div>
                <div className="p-6 flex flex-col items-center justify-center bg-white z-10">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm mb-4">
                    <QrCode className="h-32 w-32 text-slate-800" strokeWidth={1.2} />
                  </div>
                  <div className="text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">
                    {ticket.ticket_number}
                  </div>
                </div>
                <div className="p-5 bg-slate-50 border-t border-slate-100 text-sm space-y-3 z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-slate-600">
                      <User className="mr-2 h-4 w-4 text-slate-400" />
                      Holder
                    </div>
                    <div className="font-semibold text-slate-900">{ticket.holder_name || 'N/A'}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-slate-600">
                      <CreditCard className="mr-2 h-4 w-4 text-slate-400" />
                      Price
                    </div>
                    <div className="font-semibold text-slate-900">${Number(ticket.price_paid).toFixed(2)}</div>
                  </div>
                  {ticket.is_checked_in && (
                    <div className="text-center">
                      <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">Checked In</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
