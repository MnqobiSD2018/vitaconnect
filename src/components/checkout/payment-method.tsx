"use client"

import React from "react"
import { CreditCard, Smartphone, Wallet } from "lucide-react"

interface PaymentMethodProps {
  selectedMethod: "paynow" | "stripe";
  onChange: (method: "paynow" | "stripe") => void;
}

export function PaymentMethod({ selectedMethod, onChange }: PaymentMethodProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Wallet className="h-5 w-5 text-teal-600" />
        Payment Method
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Paynow Option */}
        <label 
          className={`relative flex flex-col p-5 cursor-pointer rounded-2xl border-2 transition-all duration-200 ${
            selectedMethod === 'paynow' 
              ? "border-teal-600 bg-teal-50/30 shadow-sm" 
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <input 
            type="radio" 
            name="payment_method" 
            value="paynow"
            checked={selectedMethod === 'paynow'}
            onChange={() => onChange('paynow')}
            className="sr-only" 
          />
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-xl ${selectedMethod === 'paynow' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <Smartphone className="h-6 w-6" />
            </div>
            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'paynow' ? 'border-teal-600' : 'border-slate-300'}`}>
              {selectedMethod === 'paynow' && <div className="h-2.5 w-2.5 rounded-full bg-teal-600" />}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Paynow</h4>
            <p className="text-sm text-slate-500 mt-1">EcoCash, OneMoney, Innbucks & Local ZimSwitch.</p>
          </div>
        </label>

        {/* Stripe Option */}
        <label 
          className={`relative flex flex-col p-5 cursor-pointer rounded-2xl border-2 transition-all duration-200 ${
            selectedMethod === 'stripe' 
              ? "border-teal-600 bg-teal-50/30 shadow-sm" 
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <input 
            type="radio" 
            name="payment_method" 
            value="stripe"
            checked={selectedMethod === 'stripe'}
            onChange={() => onChange('stripe')}
            className="sr-only" 
          />
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-xl ${selectedMethod === 'stripe' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <CreditCard className="h-6 w-6" />
            </div>
            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'stripe' ? 'border-teal-600' : 'border-slate-300'}`}>
              {selectedMethod === 'stripe' && <div className="h-2.5 w-2.5 rounded-full bg-teal-600" />}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Credit / Debit Card</h4>
            <p className="text-sm text-slate-500 mt-1">Secure international payments via Stripe.</p>
          </div>
        </label>

      </div>
    </div>
  )
}
