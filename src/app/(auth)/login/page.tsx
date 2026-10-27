import React, { Suspense } from 'react';
import Link from 'next/link';
import { LoginForm } from '@/features/auth/components';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-5">
      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>

      <div className="text-center text-xs text-stone-500 border-t border-stone-100 pt-4">
        ¿Aún no tienes una cuenta?{' '}
        <Link href="/register" className="font-semibold text-amber-600 hover:text-amber-700">
          Regístrate gratis
        </Link>
      </div>

      <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-[11px] text-stone-500 space-y-1">
        <p className="font-semibold text-stone-700">Cuentas demo para evaluación:</p>
        <p>• Admin: <code className="bg-white px-1 rounded border">admin@bidhub.com</code> / <code className="bg-white px-1 rounded border">Admin123!</code></p>
        <p>• Usuario: <code className="bg-white px-1 rounded border">carlos@bidhub.com</code> / <code className="bg-white px-1 rounded border">User123!</code></p>
      </div>
    </div>
  );
}
