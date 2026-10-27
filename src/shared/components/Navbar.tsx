'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Gavel, PlusCircle, LayoutDashboard, ShieldCheck, LogIn, UserPlus, Globe } from 'lucide-react';
import { useI18nStore } from '@/shared/stores';
import { useCurrentUser } from '@/shared/hooks';
import { Button, UserProfileMenu } from '@/shared/components/ui';

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useCurrentUser();
  const { lang, setLang, t } = useI18nStore();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    setLang(lang === 'es' ? 'en' : 'es');
  };

  return (
    <header className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur-md text-stone-100 border-b border-stone-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
            <Gavel className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-white group-hover:text-amber-400 transition-colors">
              {t.nav.brand}
            </span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-stone-400 -mt-1">
              {t.nav.tagline}
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              pathname === '/' ? 'text-amber-400 bg-stone-800' : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            {t.nav.home}
          </Link>
          <Link
            href="/auctions"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              pathname.startsWith('/auctions') && !pathname.includes('/new') && !pathname.includes('/edit')
                ? 'text-amber-400 bg-stone-800'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            {t.nav.catalog}
          </Link>

          {isAuthenticated && (
            <>
              <Link
                href="/auctions/new"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === '/auctions/new' ? 'text-amber-400 bg-stone-800' : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                {t.nav.publish}
              </Link>
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === '/dashboard' ? 'text-amber-400 bg-stone-800' : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-amber-400" />
                {t.nav.dashboard}
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                pathname === '/admin' ? 'text-amber-400 bg-stone-800' : 'text-amber-300/80 hover:text-amber-300 hover:bg-stone-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              {t.nav.admin}
            </Link>
          )}
        </nav>

        {/* Action Controls & User Menu */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-1 text-xs text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800"
            title="Cambiar idioma / Switch language"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold uppercase">{lang}</span>
          </Button>

          {isAuthenticated && user ? (
            <UserProfileMenu
              user={{
                name: user.name,
                email: user.email,
                role: user.role,
                initials: user.name ? user.name.slice(0, 2).toUpperCase() : 'U',
              }}
              onNavigate={(path) => router.push(path)}
              onLogout={logout}
            />
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-stone-300 hover:text-white hover:bg-stone-800 text-xs">
                  <LogIn className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  {t.nav.login}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold text-xs shadow-sm">
                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                  {t.nav.register}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
