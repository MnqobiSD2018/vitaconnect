"use client"

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getMyOrganizerProfile, getOrganizerPayouts } from "@/actions/organizer";
import { Loader2 } from "lucide-react";

export default function PayoutsPage() {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getMyOrganizerProfile()
      .then((profile) => getOrganizerPayouts(profile.id))
      .then((data) => setPayouts(data.payouts || data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="h-32 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>;

  const totalPaid = payouts
    .filter((p) => p.status === 'paid' || p.status === 'completed')
    .reduce((s, p) => s + Number(p.amount || 0), 0);

  const pendingTotal = payouts
    .filter((p) => p.status === 'pending' || p.status === 'processing')
    .reduce((s, p) => s + Number(p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Payouts</h2>
        <p className="text-sm text-slate-500">Track your earnings and payout history</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-500">Total Paid</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">${totalPaid.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-500">Pending</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">${pendingTotal.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-500">Total Payouts</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{payouts.length}</div>
        </div>
      </div>

      {payouts.length === 0 ? (
        <div className="text-center py-16 text-sm text-slate-400">
          No payouts yet. Payouts are processed within 2 business days after an event ends.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                <th className="px-4 py-3 font-medium text-slate-600">Amount</th>
                <th className="px-4 py-3 font-medium text-slate-600">Method</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payouts.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">${Number(p.amount || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-500">{p.payout_method || 'Bank Transfer'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      p.status === 'paid' || p.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                      p.status === 'pending' || p.status === 'processing' ? 'bg-amber-50 text-amber-700' :
                      'bg-rose-50 text-rose-700'
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{p.reference || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
