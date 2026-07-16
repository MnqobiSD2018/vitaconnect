'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import logoWhite from '@/app/media/vc-white.svg';
import { useAuth } from '@/hooks/use-auth';
import { LogOut } from 'lucide-react';

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/organizer' },
    { name: 'Events', href: '/organizer/events' },
    { name: 'Create Event', href: '/organizer/events/new' },
    { name: 'Payouts', href: '/organizer/payouts' },
    { name: 'Scanner', href: '/organizer/scanner' },
    { name: 'Settings', href: '/organizer/settings' },
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
        router.push('/login?redirect=/organizer');
      } else if (profile && profile.role !== 'organizer' && profile.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [loading, user, profile, router]);

  if (loading || !user || (profile && profile.role !== 'organizer' && profile.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-850 selection:bg-slate-200 selection:text-slate-800">
      {/* Sidebar */}
      <aside className={`flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex items-center gap-3 px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center p-2">
              <Image src={(logoWhite as any).src || logoWhite} alt="VitaConnect" width={24} height={24} />
            </div>
            {!collapsed && (
              <div>
                <div className="text-lg font-bold text-slate-900">Vita<span className="text-teal-600">Connect</span></div>
                <p className="text-xs text-slate-500 -mt-1">Organizer Console</p>
              </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.href === '/organizer' ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="ml-1">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-3 py-4 border-t border-slate-100">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 mt-2"
          >
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold text-slate-900">Organizer Dashboard</h1>
                <div className="text-sm text-slate-500">Manage events, tickets and payouts</div>
              </div>

              <div className="flex items-center gap-4">
                <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">View site</Link>
                <div className="h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center text-white text-sm font-semibold">
                  {initials}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
