'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Ticket, Heart, User, Settings, Menu, X, LogOut } from 'lucide-react';
import logoWhite from '@/app/media/vc-white.svg';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Tickets', href: '/dashboard/tickets', icon: Ticket },
    { name: 'Saved Events', href: '/dashboard/saved', icon: Heart },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || '??';

  const displayName = profile?.full_name || user?.email || '';

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 selection:bg-slate-200 selection:text-slate-800">
      {/* Sidebar */}
      <aside className={`flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center p-2">
              <Image src={(logoWhite as any).src || logoWhite} alt="VitaConnect" width={24} height={24} />
            </div>
            {!collapsed && (
              <div>
                <div className="text-lg font-bold text-slate-900">Vita<span className="text-teal-600">Connect</span></div>
                <p className="text-xs text-slate-500 -mt-1">Welcome{displayName ? `, ${displayName.split(' ')[0]}` : ''}</p>
              </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 px-3 py-6">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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

        <div className="px-3 py-4 border-t border-slate-100">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors mt-2"
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
                <h1 className="text-lg font-semibold text-slate-900">Attendee Portal</h1>
              </div>

              <div className="flex items-center gap-5">
                <Link href="/events" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">
                  Browse Events
                </Link>
                <div className="h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center text-white text-sm font-semibold">
                  {initials}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
