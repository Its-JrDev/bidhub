'use client';

import React from 'react';
import Link from 'next/link';
import { Gavel, Heart } from 'lucide-react';
import { useI18nStore } from '@/shared/stores/i18n-store';

export function Footer() {
  const { t } = useI18nStore();

  return (
    <footer className="bg-stone-950 text-stone-400 border-t border-stone-800/80 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Gavel className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-tight">{t.nav.brand}</span>
            <p className="text-xs text-stone-500">{t.nav.tagline} — Next.js 16 Fullstack</p>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-stone-400">
          <Link href="/" className="hover:text-white transition-colors">{t.nav.home}</Link>
          <Link href="/auctions" className="hover:text-white transition-colors">{t.nav.catalog}</Link>
          <Link href="/login" className="hover:text-white transition-colors">{t.nav.login}</Link>
          <Link href="/register" className="hover:text-white transition-colors">{t.nav.register}</Link>
        </div>

        {/* Copyright */}
        <div className="text-xs text-stone-500 text-center md:text-right flex items-center gap-1">
          <span>Hecho con</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          <span>usando Lumen CLI & Next.js 16</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
