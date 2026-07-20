'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Loader2, Send } from 'lucide-react';
import { useNotification } from '@/components/ui/notifications';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const notify = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      notify.error('Please fill in all required fields.');
      return;
    }
    setSending(true);
    // Placeholder — integrates with email/notification system
    await new Promise((r) => setTimeout(r, 1000));
    notify.success('Message sent! We\'ll get back to you soon.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setSending(false);
  };

  const inputClass = "w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all";

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Contact Us</h1>
        <p className="mt-4 text-lg text-slate-600">
          Have a question, need support, or want to partner with us? We&apos;d love to hear from you.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Name <span className="text-rose-500">*</span></label>
                  <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email <span className="text-rose-500">*</span></label>
                  <input className={inputClass} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
                <input className={inputClass} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Message <span className="text-rose-500">*</span></label>
                <textarea className={`${inputClass} min-h-[150px] resize-y`} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us more..." required />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-8 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Send Message
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-teal-600 shrink-0" />
              <div>
                <div className="text-sm font-medium text-slate-900">Email</div>
                <a href="mailto:admin@vitaconnect.co.zw" className="text-sm text-slate-600 hover:text-teal-600">admin@vitaconnect.co.zw</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 text-teal-600 shrink-0" />
              <div>
                <div className="text-sm font-medium text-slate-900">Phone</div>
                <div className="text-sm text-slate-600">+263 777 777 777 / +263 777 777 777</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-teal-600 shrink-0" />
              <div>
                <div className="text-sm font-medium text-slate-900">Address</div>
                <div className="text-sm text-slate-600">Harare, Zimbabwe</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}