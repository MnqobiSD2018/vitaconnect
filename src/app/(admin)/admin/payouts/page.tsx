'use client';

import React, { useEffect, useState } from 'react';
import { CircleDollarSign, ArrowUpRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getAllPayouts, processPayout } from '@/actions/admin';

export default function AdminPayoutsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    getAllPayouts()
      .then(setPayouts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredPayouts = payouts.filter((p) => p.status === activeTab);

  const handleProcess = async (payoutId: string) => {
    if (!user) return;
    setProcessingId(payoutId);
    try {
      await processPayout(payoutId, user.id);
      setPayouts((prev) =>
        prev.map((p) => (p.id === payoutId ? { ...p, status: 'completed', processed_at: new Date().toISOString() } : p))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Organizer Payouts</h2>
        <p className="text-sm text-slate-500 mt-1">Process withdrawal requests and transfer revenue to event organizers.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {(['pending', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors capitalize ${
                activeTab === tab ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:border-slate-300'
              }`}
            >
              {tab} Requests
            </button>
          ))}
        </nav>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Organizer</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Details</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayouts.length > 0 ? (
                filteredPayouts.map((payout) => {
                  const org = payout.organizer_profiles;
                  return (
                    <tr key={payout.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{org?.organization_name || 'Unknown'}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">${Number(payout.amount).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="text-slate-900">{org?.paynow_email || org?.bank_name || 'N/A'}</div>
                        {org?.bank_account && <div className="text-xs text-slate-500 font-mono mt-0.5">{org.bank_account}</div>}
                      </td>
                      <td className="px-6 py-4">
                        {activeTab === 'pending'
                          ? payout.created_at ? new Date(payout.created_at).toLocaleDateString() : '-'
                          : payout.processed_at ? new Date(payout.processed_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {activeTab === 'pending' ? (
                          <button
                            onClick={() => handleProcess(payout.id)}
                            disabled={processingId === payout.id}
                            className="inline-flex items-center rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-70"
                          >
                            {processingId === payout.id ? (
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            ) : (
                              <>Mark Paid <ArrowUpRight className="ml-1 h-3 w-3" /></>
                            )}
                          </button>
                        ) : (
                          <span className="inline-flex items-center text-emerald-600 font-medium">
                            <CheckCircle2 className="mr-1 h-4 w-4" /> Paid
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No {activeTab} payout requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
