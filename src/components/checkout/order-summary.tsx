"use client"

import React from "react"
import { TicketTier } from "@/lib/constants/mockData"
import { Lock, ArrowRight, Loader2 } from "lucide-react"

interface OrderSummaryProps {
  tiers: TicketTier[];
  selectedTickets: Record<string, number>;
  platformFeePercent?: number;
  onCheckout: () => void;
  isProcessing?: boolean;
}

export function OrderSummary({ 
  tiers, 
  selectedTickets, 
  platformFeePercent = 5, 
  onCheckout,
  isProcessing = false 
}: OrderSummaryProps) {
  
  // Calculate totals
  let subtotal = 0;
  const lineItems: { name: string; qty: number; total: number }[] = [];

  Object.entries(selectedTickets).forEach(([tierId, qty]) => {
    if (qty > 0) {
      const tier = tiers.find(t => t.id === tierId);
      if (tier) {
        const total = tier.price * qty;
        subtotal += total;
        lineItems.push({ name: tier.name, qty, total });
      }
    }
  });

  const totalQuantity = lineItems.reduce((acc, item) => acc + item.qty, 0);
  const platformFee = (subtotal * platformFeePercent) / 100;
  const finalTotal = subtotal + platformFee;

  return (
    <div className="bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl text-white sticky top-24">
      <h3 className="text-xl font-bold mb-6">Order Summary</h3>
      
      {totalQuantity === 0 ? (
        <div className="text-center py-8 opacity-60">
          <p className="text-sm">No tickets selected yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Line Items */}
          <div className="space-y-4">
            {lineItems.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-sm">
                <div>
                  <span className="font-semibold">{item.qty}x</span> <span className="text-slate-300">{item.name}</span>
                </div>
                <div className="font-semibold">${item.total.toFixed(2)}</div>
              </div>
            ))}
          </div>

          <hr className="border-slate-700" />

          {/* Subtotals & Fees */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Service Fee ({platformFeePercent}%)</span>
              <span>${platformFee.toFixed(2)}</span>
            </div>
          </div>

          <hr className="border-slate-700" />

          {/* Final Total */}
          <div className="flex justify-between items-end">
            <span className="text-slate-300 text-sm">Total due</span>
            <span className="text-3xl font-bold text-white tracking-tight">
              ${finalTotal.toFixed(2)}
            </span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={onCheckout}
            disabled={isProcessing}
            className="w-full flex items-center justify-center h-14 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-lg disabled:opacity-70 transition-colors mt-8"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Complete Purchase
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </button>

          <p className="text-xs text-center text-slate-400 mt-4 flex items-center justify-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            Secure encrypted payment
          </p>
        </div>
      )}
    </div>
  )
}
