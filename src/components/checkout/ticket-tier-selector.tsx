"use client"

import React from "react"
import { TicketTier } from "@/lib/constants/mockData"
import { Plus, Minus, Info, Ticket } from "lucide-react"

interface TicketTierSelectorProps {
  tiers: TicketTier[];
  selectedTickets: Record<string, number>;
  onQuantityChange: (tierId: string, delta: number) => void;
}

export function TicketTierSelector({ tiers, selectedTickets, onQuantityChange }: TicketTierSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Ticket className="h-5 w-5 text-teal-600" />
        Select Tickets
      </h3>
      
      <div className="space-y-4">
        {tiers.map((tier) => {
          const currentQty = selectedTickets[tier.id] || 0;
          const isMaxedOut = currentQty >= tier.available;

          return (
            <div 
              key={tier.id} 
              className={`p-5 rounded-2xl border transition-all duration-200 ${
                currentQty > 0 
                  ? "border-teal-500 bg-teal-50/10 shadow-sm" 
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-lg">{tier.name}</h4>
                  <div className="text-xl font-bold text-teal-650 mt-1">
                    {tier.currency === 'USD' ? '$' : 'ZiG '}{tier.price}
                  </div>
                  {tier.description && (
                    <p className="text-sm text-slate-500 mt-2 flex items-start gap-1.5">
                      <Info className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
                      {tier.description}
                    </p>
                  )}
                </div>
                
                {/* Quantity Controls */}
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-1 shrink-0 w-max">
                  <button 
                    type="button"
                    onClick={() => onQuantityChange(tier.id, -1)}
                    disabled={currentQty === 0}
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  
                  <span className="w-6 text-center font-bold text-slate-900 text-lg tabular-nums">
                    {currentQty}
                  </span>
                  
                  <button 
                    type="button"
                    onClick={() => onQuantityChange(tier.id, 1)}
                    disabled={isMaxedOut}
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {isMaxedOut && (
                <div className="mt-3 text-xs font-semibold text-rose-500">
                  Maximum available tickets reached for this tier.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  )
}
