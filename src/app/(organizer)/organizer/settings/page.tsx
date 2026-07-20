'use client';

import React, { useState, useEffect } from 'react';
import { Save, Building2, Banknote, Bell, Loader2 } from 'lucide-react';
import { useNotification } from '@/components/ui/notifications';
import { useAuth } from '@/hooks/use-auth';
import { getMyOrganizerProfile, updateOrganizerProfile } from '@/actions/organizer';

export default function OrganizerSettingsPage() {
  const { user } = useAuth();
  const notify = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const [orgName, setOrgName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [accountName, setAccountName] = useState('');
  const [branch, setBranch] = useState('');
  const [mobileMoney, setMobileMoney] = useState('');

  const [notifications, setNotifications] = useState({ sales: true, payouts: true, reminders: true });

  useEffect(() => {
    async function load() {
      if (!user) return;
      const org = await getMyOrganizerProfile();
      if (org) {
        setProfile(org);
        setOrgName(org.organization_name || '');
        setBio(org.bio || '');
        setWebsite(org.website || '');
        setPhone(org.phone || '');
        setCity(org.city || '');
        setBankName(org.bank_name || '');
        setBankAccount(org.bank_account || '');
        setAccountName(org.account_name || '');
        setBranch(org.branch || '');
        setMobileMoney(org.mobile_money || '');
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const handleSave = async (section: string) => {
    if (!user) return;
    setSaving(section);
    try {
      if (section === 'profile') {
        await updateOrganizerProfile(user.id, {
          organization_name: orgName,
          bio,
          website,
          phone,
          city,
        });
      } else if (section === 'banking') {
        await updateOrganizerProfile(user.id, {
          bank_name: bankName,
          bank_account: bankAccount,
          account_name: accountName,
          branch,
          mobile_money: mobileMoney,
        });
      }
      notify.success(`${section === 'profile' ? 'Profile' : 'Banking'} settings saved`);
    } catch (err: any) {
      notify.error(err.message || 'Failed to save');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Organizer Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your organizer profile, banking details, and preferences.</p>
      </div>

      {/* Profile Section */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-6 flex items-center gap-3">
          <Building2 className="h-5 w-5 text-slate-400" />
          <h3 className="text-lg font-medium text-slate-900">Organizer Profile</h3>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className={labelClass}>Organization Name</label>
              <input className={inputClass} value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Phone</label>
              <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Website</label>
              <input className={inputClass} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>City</label>
              <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Bio</label>
            <textarea className={`${inputClass} min-h-[100px] resize-y`} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <button
            onClick={() => handleSave('profile')}
            disabled={saving === 'profile'}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-6 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {saving === 'profile' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Profile
          </button>
        </div>
      </section>

      {/* Banking Section */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-6 flex items-center gap-3">
          <Banknote className="h-5 w-5 text-slate-400" />
          <h3 className="text-lg font-medium text-slate-900">Banking & Payouts</h3>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className={labelClass}>Bank Name</label>
              <input className={inputClass} value={bankName} onChange={(e) => setBankName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Account Name</label>
              <input className={inputClass} value={accountName} onChange={(e) => setAccountName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Account Number</label>
              <input className={inputClass} value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Branch</label>
              <input className={inputClass} value={branch} onChange={(e) => setBranch(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Mobile Money Number</label>
              <input className={inputClass} value={mobileMoney} onChange={(e) => setMobileMoney(e.target.value)} placeholder="+263..." />
            </div>
          </div>
          <button
            onClick={() => handleSave('banking')}
            disabled={saving === 'banking'}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-6 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {saving === 'banking' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Banking Details
          </button>
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-6 flex items-center gap-3">
          <Bell className="h-5 w-5 text-slate-400" />
          <h3 className="text-lg font-medium text-slate-900">Notifications</h3>
        </div>
        <div className="p-6 space-y-4">
          {[
            { key: 'sales', label: 'New Sales', desc: 'Get notified when someone purchases tickets to your events.' },
            { key: 'payouts', label: 'Payout Alerts', desc: 'Receive alerts when payouts are processed to your account.' },
            { key: 'reminders', label: 'Event Reminders', desc: 'Get reminded before your events go live.' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-900">{item.label}</div>
                <div className="text-sm text-slate-500 mt-0.5">{item.desc}</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={(notifications as any)[item.key]}
                onClick={() => setNotifications({ ...notifications, [item.key]: !(notifications as any)[item.key] })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  (notifications as any)[item.key] ? 'bg-teal-600' : 'bg-slate-200'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                  (notifications as any)[item.key] ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}