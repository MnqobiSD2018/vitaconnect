'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, CalendarCheck, CircleDollarSign, Settings, Menu, X, ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();

  const navItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Users & Organizers', href: '/admin/users', icon: Users },
    { name: 'Event Approvals', href: '/admin/events', icon: CalendarCheck },
    { name: 'Payouts', href: '/admin/payouts', icon: CircleDollarSign },
    { name: 'Platform Settings', href: '/admin/settings', icon: Settings },
  ];

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || '??';

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login?redirect=/admin');
      } else if (profile && profile.role !== 'admin') {
        router.push('/');
      }
    }
  }, [loading, user, profile, router]);

  if (loading || !user || (profile && profile.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className={`flex flex-col bg-slate-950 text-slate-300 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950">
              <ShieldAlert size={24} />
            </div>
            {!collapsed && (
              <div>
                <div className="text-lg font-bold text-white">Vita<span className="text-teal-400">Admin</span></div>
              </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 px-3 py-6">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-teal-500/10 text-teal-400'
                        : 'hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-4 py-4 border-t border-slate-800">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-xl border border-slate-700 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mt-2"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {!collapsed && <span className="ml-2">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
          <div className="mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold text-slate-900">Platform Control Center</h1>
              </div>

              <div className="flex items-center gap-5">
                <div className="text-sm text-slate-500">System Status: <span className="text-teal-600 font-semibold">Online</span></div>
                <div className="h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center text-white text-sm font-semibold cursor-pointer">
                  {initials}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
