import type { ReactNode } from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Tags, AlertTriangle } from 'lucide-react';

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900">
      {/* Admin Top Header */}
      <header className="bg-stone-950 text-white px-6 py-3.5 flex items-center justify-between text-xs border-b border-stone-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-white uppercase text-[11px] block">
              Panel de Administración y Moderación
            </span>
            <span className="text-[10px] text-amber-400/80 font-mono">
              Acceso restringido a administradores
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-colors font-medium"
          >
            <Tags className="w-3.5 h-3.5 text-amber-400" />
            <span>Gestión & Moderación</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white rounded-lg transition-colors border border-stone-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Sitio</span>
          </Link>
        </div>
      </header>

      {/* Main Admin Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
