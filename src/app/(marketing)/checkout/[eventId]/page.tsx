"use client"

import React, { use, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MOCK_EVENTS } from "@/lib/constants/mockData"

import { TicketTierSelector } from "@/components/checkout/ticket-tier-selector"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { PaymentMethod } from "@/components/checkout/payment-method"
import { OrderSummary } from "@/components/checkout/order-summary"

import { ChevronLeft, LockKeyhole, UserCircle2 } from "lucide-react"

export default function CheckoutPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const router = useRouter();
  const event = MOCK_EVENTS.find(e => e.id === eventId || e.slug === eventId) || MOCK_EVENTS[0];

  // 1. MOCK AUTH STATE (For offline testing)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 2. MASTER STATE
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<"paynow" | "stripe">("paynow");
  const [isProcessing, setIsProcessing] = useState(false);

  // 3. STATE HANDLERS
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

  const handleCheckoutSubmit = () => {
    // Hard check to ensure they are authenticated
    if (!isLoggedIn) {
      alert("Please log in or create an account to secure your tickets.");
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone) {
      alert("Please fill in all required attendee details.");
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      console.log("Order Payload:", {
        eventId: event.id,
        tickets: selectedTickets,
        attendee: formData,
        payment: paymentMethod
      });
      
      setIsProcessing(false);
      alert("Order successful! Redirecting to your dashboard...");
      router.push("/dashboard/tickets");
    }, 1500);
  };

  // Calculate if any tickets are selected to enable/disable the auth prompt
  const hasSelectedTickets = Object.values(selectedTickets).reduce((a, b) => a + b, 0) > 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-8">
      
      {/* DEVELOPMENT ONLY: Quick toggle to test states offline */}
      <div className="fixed bottom-4 left-4 z-50 bg-white p-3 rounded-xl shadow-lg border border-slate-200 text-xs flex items-center gap-3">
        <span className="font-bold text-slate-700">Dev Auth Status:</span>
        <button 
          onClick={() => setIsLoggedIn(!isLoggedIn)}
          className={`px-3 py-1.5 rounded-lg font-bold text-white transition-colors ${isLoggedIn ? 'bg-rose-500 hover:bg-rose-600' : 'bg-teal-500 hover:bg-teal-600'}`}
        >
          {isLoggedIn ? "Log Out" : "Simulate Login"}
        </button>
      </div>

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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          <div className="lg:col-span-7 xl:col-span-8 space-y-10">
            {/* Step 1: Select Tickets (Always visible) */}
            <section>
              <TicketTierSelector 
                tiers={event.ticketTiers} 
                selectedTickets={selectedTickets} 
                onQuantityChange={handleQuantityChange} 
              />
            </section>

            {/* Step 2: Auth Gate & Forms */}
            <section className="relative">
              {!isLoggedIn && (
                <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-white/40 rounded-3xl flex items-center justify-center p-6">
                  <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md text-center transform -translate-y-4">
                    <div className="mx-auto h-16 w-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-4">
                      <LockKeyhole className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Save Your Tickets</h3>
                    <p className="text-sm text-slate-500 mb-6">
                      You must be signed in to purchase tickets so we can securely store them in your VitaConnect dashboard.
                    </p>
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => alert("Normally this routes to /login?redirect=/checkout")}
                        disabled={!hasSelectedTickets}
                        className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Sign In
                      </button>
                      <button 
                        onClick={() => alert("Normally this routes to /register?redirect=/checkout")}
                        disabled={!hasSelectedTickets}
                        className="w-full h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Create an Account
                      </button>
                    </div>
                    {!hasSelectedTickets && (
                      <p className="text-xs text-rose-500 font-medium mt-4">
                        Please select your tickets above first.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* The form components sit "behind" the auth gate blur */}
              <div className={`space-y-10 ${!isLoggedIn ? 'opacity-30 pointer-events-none select-none' : ''}`}>
                
                {/* Visual indicator that user is logged in */}
                {isLoggedIn && (
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center gap-3">
                    <UserCircle2 className="h-6 w-6 text-teal-600" />
                    <div>
                      <div className="text-sm font-bold text-teal-900">Signed in securely</div>
                      <div className="text-xs text-teal-700">Tickets will be saved to your dashboard after purchase.</div>
                    </div>
                  </div>
                )}

                <CheckoutForm 
                  formData={formData} 
                  customFields={event.customFields} 
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
              tiers={event.ticketTiers} 
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
