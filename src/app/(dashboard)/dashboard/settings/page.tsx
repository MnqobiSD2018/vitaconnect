'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Lock, Shield, Trash2, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { updatePassword } from '@/actions/auth';

const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
      enabled ? 'bg-teal-600' : 'bg-slate-200'
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        enabled ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState({
    purchases: true,
    reminders: true,
    marketing: false,
  });
  const [deleting, setDeleting] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    toast.error('Account deletion is not yet implemented. Please contact support.');
    setDeleting(false);
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Account Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your preferences and security settings.</p>
      </div>

      {/* Notifications Section */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-6 flex items-center gap-3">
          <Bell className="h-5 w-5 text-slate-400" />
          <h3 className="text-lg font-medium text-slate-900">Notifications</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-900">Ticket Purchases</div>
              <div className="text-sm text-slate-500 mt-0.5">Receive a receipt and ticket link immediately after purchase.</div>
            </div>
            <Toggle enabled={notifications.purchases} onChange={() => setNotifications({ ...notifications, purchases: !notifications.purchases })} />
          </div>
          <hr className="border-slate-100" />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-900">Event Reminders</div>
              <div className="text-sm text-slate-500 mt-0.5">Get a reminder 24 hours before your event starts.</div>
            </div>
            <Toggle enabled={notifications.reminders} onChange={() => setNotifications({ ...notifications, reminders: !notifications.reminders })} />
          </div>
          <hr className="border-slate-100" />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-900">Marketing & Promos</div>
              <div className="text-sm text-slate-500 mt-0.5">Receive updates about new events based on your saved categories.</div>
            </div>
            <Toggle enabled={notifications.marketing} onChange={() => setNotifications({ ...notifications, marketing: !notifications.marketing })} />
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-6 flex items-center gap-3">
          <Shield className="h-5 w-5 text-slate-400" />
          <h3 className="text-lg font-medium text-slate-900">Security</h3>
        </div>
        <div className="p-6 space-y-4">
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <Lock className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900">Change Password</div>
                <div className="text-xs text-slate-500 mt-0.5">Update your password to keep your account secure.</div>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-600">{showPasswordForm ? 'Cancel' : 'Update'} &rarr;</div>
          </button>

          {showPasswordForm && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (newPassword.length < 8) {
                  toast.error('Password must be at least 8 characters');
                  return;
                }
                if (newPassword !== confirmPassword) {
                  toast.error('Passwords do not match');
                  return;
                }
                setChangingPassword(true);
                const result = await updatePassword(newPassword);
                setChangingPassword(false);
                if (result.error) {
                  toast.error(result.error);
                } else {
                  toast.success('Password updated successfully');
                  setShowPasswordForm(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4"
            >
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 pr-11 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="Min. 8 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="Re-enter new password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={changingPassword}
                className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Danger Zone */}
      <section className="rounded-2xl border border-rose-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium text-slate-900">Delete Account</h3>
            <p className="text-sm text-slate-500 mt-1">Permanently delete your account and all ticket history. This action is not reversible.</p>
          </div>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-600 hover:bg-rose-100 hover:border-rose-300 transition-colors disabled:opacity-70"
          >
            {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Delete Account
          </button>
        </div>
      </section>
    </div>
  );
}
