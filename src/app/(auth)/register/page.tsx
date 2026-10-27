import React from 'react';
import Link from 'next/link';
import { RegisterForm } from '@/features/auth/components';

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-5">
      <RegisterForm />

      <div className="text-center text-xs text-stone-500 border-t border-stone-100 pt-4">
        ¿Ya tienes una cuenta en BidHub?{' '}
        <Link href="/login" className="font-semibold text-amber-600 hover:text-amber-700">
          Inicia sesión aquí
        </Link>
      </div>
    </div>
  );
}
