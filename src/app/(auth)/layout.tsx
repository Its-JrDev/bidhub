import type { ReactNode } from 'react';
import Link from 'next/link';
import { Gavel, ArrowLeft } from 'lucide-react';

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-stone-100 p-4 sm:p-6 lg:p-8">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a BidHub</span>
      </Link>

      <div className="w-full max-w-md bg-white shadow-xl shadow-stone-200/50 rounded-2xl p-8 border border-stone-200/80">
        <div className="mb-6 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-3">
            <Gavel className="w-6 h-6" />
          </div>
          <Link href="/" className="text-2xl font-bold text-stone-900 tracking-tight">
            BidHub
          </Link>
          <p className="text-xs text-stone-500 mt-1">
            Plataforma de Subastas de Colección
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
