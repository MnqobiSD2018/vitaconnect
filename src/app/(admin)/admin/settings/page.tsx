'use client';

import React, { useEffect, useState } from 'react';
import { Settings2, Percent, DollarSign, Loader2, Save } from 'lucide-react';
import { getPlatformSettings, updatePlatformSettings } from '@/actions/admin';

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    service_fee_percent: '5',
    min_payout_amount: '10',
    platform_currency: 'USD',
  });

  useEffect(() => {
    getPlatformSettings()
      .then((settings) => {
        setFormData({
          service_fee_percent: String(settings.service_fee_percent ?? '5'),
          min_payout_amount: String(settings.min_payout_amount ?? '10'),
          platform_currency: String(settings.platform_currency ?? 'USD'),
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSaved(false);
    try {
      await updatePlatformSettings({
        service_fee_percent: Number(formData.service_fee_percent),
        min_payout_amount: Number(formData.min_payout_amount),
        platform_currency: formData.platform_currency,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Platform Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Configure global variables, fees, and operational parameters.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
        {saved && <div className="rounded-xl bg-teal-50 border border-teal-200 p-3 text-sm text-teal-700">Settings saved successfully.</div>}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 p-6 flex items-center gap-3 bg-slate-50/50">
            <div className="h-8 w-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700">
              <Settings2 className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Financial Configurations</h3>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="service_fee_percent" className="block text-sm font-medium text-slate-700">Platform Service Fee</label>
              <p className="text-xs text-slate-500 mb-2">Percentage deducted from organizer revenue.</p>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Percent className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="number"
                  id="service_fee_percent"
                  name="service_fee_percent"
                  min="0"
                  max="100"
                  value={formData.service_fee_percent}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="min_payout_amount" className="block text-sm font-medium text-slate-700">Minimum Payout Amount</label>
              <p className="text-xs text-slate-500 mb-2">Minimum balance required for withdrawal.</p>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="number"
                  id="min_payout_amount"
                  name="min_payout_amount"
                  min="0"
                  value={formData.min_payout_amount}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="platform_currency" className="block text-sm font-medium text-slate-700">Base Platform Currency</label>
              <select
                id="platform_currency"
                name="platform_currency"
                value={formData.platform_currency}
                onChange={handleChange}
                className="block w-full sm:w-1/2 rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="ZWG">ZWG - Zimbabwe Gold</option>
              </select>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-8 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-70 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Configurations
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
