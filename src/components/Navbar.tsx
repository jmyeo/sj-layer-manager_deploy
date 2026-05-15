'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useTranslation, LanguageToggle } from '@/lib/i18n';
import type { Profile } from '@/lib/types';

const navItems = [
  { href: '/', labelKey: 'nav.dashboard' as const, icon: 'dashboard' },
  { href: '/customers', labelKey: 'nav.customers' as const, icon: 'customers' },
  { href: '/reports', labelKey: 'nav.reports' as const, icon: 'reports' },
  { href: '/admin/audit', labelKey: 'nav.audit' as const, icon: 'audit' },
];

const icons: Record<string, JSX.Element> = {
  dashboard: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
    </svg>
  ),
  customers: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  reports: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  audit: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
};

const roleColorMap: Record<string, string> = {
  Admin: 'bg-red-100 text-red-700',
  Manager: 'bg-blue-100 text-blue-700',
  Consultant: 'bg-purple-100 text-purple-700',
  'Farm User': 'bg-green-100 text-green-700',
};

// Simple in-memory cache to avoid re-fetching on every render
let cachedProfile: Profile | null = null;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(cachedProfile);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current || cachedProfile) return;
    fetched.current = true;

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          cachedProfile = data as Profile;
          setProfile(cachedProfile);
        }
      });
    });
  }, []);

  const handleLogout = async () => {
    cachedProfile = null;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const roleKey = profile?.role === 'Farm User' ? 'role.FarmUser' : `role.${profile?.role}` as const;
  const translatedRole = profile ? t(roleKey as 'role.Admin' | 'role.Manager' | 'role.Consultant' | 'role.FarmUser') : '';

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white border-r border-border">
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <h1 className="text-lg font-bold text-primary">Sunjin Layer PM</h1>
          <LanguageToggle />
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {icons[item.icon]}
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border">
          {profile && (
            <div className="px-4 pt-3 pb-1">
              <p className="text-xs text-gray-500 truncate">{profile.email}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${roleColorMap[profile.role] ?? 'bg-gray-100 text-gray-600'}`}>
                {translatedRole}
              </span>
            </div>
          )}
          <div className="px-4 pb-4 pt-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t('common.logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 safe-bottom">
        <div className="flex justify-around items-center h-16">
          {navItems.slice(0, 3).map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-1 px-3 ${
                  isActive ? 'text-primary' : 'text-gray-400'
                }`}
              >
                {icons[item.icon]}
                <span className="text-xs font-medium">{t(item.labelKey)}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 py-1 px-3 text-gray-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-xs font-medium">{t('common.logout')}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
