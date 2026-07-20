"use client"

import React, { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { createOrder, initiatePaymentAction, type CheckoutInput } from "@/actions/tickets"

import { TicketTierSelector } from "@/components/checkout/ticket-tier-selector"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { PaymentMethod } from "@/components/checkout/payment-method"
import { OrderSummary } from "@/components/checkout/order-summary"

import { useNotification } from "@/components/ui/notifications"
import { ChevronLeft, LockKeyhole, UserCircle2, Loader2, CheckCircle2 } from "lucide-react"

interface CheckoutEvent {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  starts_at: string;
  venue_address: string | null;
  ticketTiers: Array<{
    id: string;
    name: string;
    price: number | string;
    currency: string;
    description: string;
    quantity: number;
    quantity_sold: number;
  }>;
}

export default function CheckoutPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const notify = useNotification();

  const [event, setEvent] = useState<CheckoutEvent | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventError, setEventError] = useState(false);

  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<"paynow" | "stripe">("paynow");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${eventId}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => setEvent(data))
      .catch(() => setEventError(true))
      .finally(() => setEventLoading(false));
  }, [eventId]);

  const handleQuantityChange = (tierId: string, delta: number) => {
    setSelectedTickets(prev => {
      const currentQty = prev[tierId] || 0;
      const nextQty = Math.max(0, currentQty + delta);
      if (nextQty === 0) {
        const copy = { ...prev };
        delete copy[tierId];
        return copy;
      }
      return { ...prev, [tierId]: nextQty };
    });
  };

  const handleFormChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleCheckoutSubmit = async () => {
    if (!user || !event) return;

    if (!formData.fullName || !formData.email || !formData.phone) {
      notify.error("Please fill in all required attendee details.");
      return;
    }

    const items = Object.entries(selectedTickets)
      .filter(([, qty]) => qty > 0)
      .map(([tierId, quantity]) => ({ tierId, quantity }));

    if (items.length === 0) {
      notify.error("Please select at least one ticket.");
      return;
    }

    setIsProcessing(true);

    try {
      const input: CheckoutInput = {
        eventId: event.id,
        userId: user.id,
        items,
        attendeeName: formData.fullName,
        attendeeEmail: formData.email,
        attendeePhone: formData.phone,
      };

      const result = await createOrder(input);

      // Initiate Paynow payment and redirect
      const payment = await initiatePaymentAction(result.orderId);
      window.location.href = payment.redirectUrl;
    } catch (err: any) {
      notify.error(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const hasSelectedTickets = Object.values(selectedTickets).reduce((a, b) => a + b, 0) > 0;

  if (eventLoading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Event not found.</p>
        <Link href="/events" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
          Browse Events
        </Link>
      </div>
    );
  }

  const tiersWithAvailable = event.ticketTiers.map((t) => ({
    ...t,
    price: Number(t.price),
    currency: t.currency as "USD" | "ZiG",
    available: Math.max(0, t.quantity - (t.quantity_sold || 0)),
  }));

  const eventDateStr = new Date(event.starts_at).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to {event.title}
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mt-4">Secure Checkout</h1>
          <p className="text-sm text-slate-500 mt-1">{eventDateStr} &middot; {event.venue_address || "Online"}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-7 xl:col-span-8 space-y-10">
            <section>
              <TicketTierSelector
                tiers={tiersWithAvailable}
                selectedTickets={selectedTickets}
                onQuantityChange={handleQuantityChange}
              />
            </section>

            <section className="relative">
              {!user && (
                <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-white/40 rounded-3xl flex items-center justify-center p-6">
                  <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md text-center transform -translate-y-4">
                    <div className="mx-auto h-16 w-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-4">
                      <LockKeyhole className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Save Your Tickets</h3>
                    <p className="text-sm text-slate-500 mb-6">
                      Sign in to securely purchase and manage your tickets in your VitaConnect dashboard.
                    </p>
                    <div className="flex flex-col gap-3">
                      <Link
                        href={`/login?redirect=/checkout/${event.slug}`}
                        className={`w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors flex items-center justify-center ${!hasSelectedTickets ? "opacity-50 pointer-events-none" : ""}`}
                      >
                        Sign In
                      </Link>
                      <Link
                        href={`/register?redirect=/checkout/${event.slug}`}
                        className={`w-full h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-xl font-semibold transition-colors flex items-center justify-center ${!hasSelectedTickets ? "opacity-50 pointer-events-none" : ""}`}
                      >
                        Create an Account
                      </Link>
                    </div>
                    {!hasSelectedTickets && (
                      <p className="text-xs text-rose-500 font-medium mt-4">
                        Please select your tickets above first.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className={`space-y-10 ${!user ? "opacity-30 pointer-events-none select-none" : ""}`}>
                {user && (
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center gap-3">
                    <UserCircle2 className="h-6 w-6 text-teal-600" />
                    <div>
                      <div className="text-sm font-bold text-teal-900">Signed in as {user.email}</div>
                      <div className="text-xs text-teal-700">Tickets will be saved to your dashboard after purchase.</div>
                    </div>
                  </div>
                )}

                <CheckoutForm
                  formData={formData}
                  customFields={[]}
                  onChange={handleFormChange}
                />
                <PaymentMethod
                  selectedMethod={paymentMethod}
                  onChange={setPaymentMethod}
                />
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 xl:col-span-4">
            <OrderSummary
              tiers={tiersWithAvailable}
              selectedTickets={selectedTickets}
              platformFeePercent={5}
              onCheckout={handleCheckoutSubmit}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
