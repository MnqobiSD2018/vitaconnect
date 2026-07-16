"use client"

import React from "react"
import { RegistrationField } from "@/lib/constants/mockData"
import { User } from "lucide-react"

interface CheckoutFormProps {
  formData: Record<string, string>;
  customFields?: RegistrationField[];
  onChange: (fieldName: string, value: string) => void;
}

export function CheckoutForm({ formData, customFields = [], onChange }: CheckoutFormProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
        <User className="h-5 w-5 text-teal-600" />
        Attendee Details
      </h3>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
        {/* Standard Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Samuel Mqobi Dube"
              value={formData.fullName || ""}
              onChange={(e) => onChange("fullName", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={formData.email || ""}
              onChange={(e) => onChange("email", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="+263..."
              value={formData.phone || ""}
              onChange={(e) => onChange("phone", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
            />
          </div>
        </div>

        {/* Dynamic Custom Fields */}
        {customFields.length > 0 && (
          <>
            <hr className="border-slate-100 my-6" />
            <h4 className="font-semibold text-slate-900 mb-4">Additional Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {customFields.map((field) => (
                <div key={field.name} className={`space-y-2 ${field.type === 'checkbox' ? 'sm:col-span-2' : ''}`}>
                  
                  {field.type !== 'checkbox' && (
                    <label className="block text-sm font-medium text-slate-700">
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </label>
                  )}

                  {field.type === 'select' ? (
                    <select
                      required={field.required}
                      value={formData[field.name] || ""}
                      onChange={(e) => onChange(field.name, e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
                    >
                      <option value="">Select an option...</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                      <input
                        type="checkbox"
                        required={field.required}
                        checked={formData[field.name] === 'true'}
                        onChange={(e) => onChange(field.name, e.target.checked ? 'true' : 'false')}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
                      />
                      <span className="text-sm text-slate-700 font-medium leading-tight">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </span>
                    </label>
                  ) : (
                    <input
                      type={field.type}
                      required={field.required}
                      value={formData[field.name] || ""}
                      onChange={(e) => onChange(field.name, e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
                    />
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
