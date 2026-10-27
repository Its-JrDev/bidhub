'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormValues } from './register.schema';
import { Button, Input, Label, Alert, AlertDescription } from '@/shared/components/ui';
import { AlertCircle, Loader2, UserPlus } from 'lucide-react';
import { useCurrentUser } from '@/shared/hooks';

export function RegisterForm() {
  const router = useRouter();
  const { refetch } = useCurrentUser();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al crear la cuenta.');
      }

      await refetch();
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setServerError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs font-semibold text-stone-700">
          Nombre Completo
        </Label>
        <Input
          id="name"
          placeholder="Ej. Sofía Valenzuela"
          {...register('name')}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-semibold text-stone-700">
          Correo Electrónico
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="usuario@ejemplo.com"
          {...register('email')}
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-xs text-rose-500 font-medium">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-semibold text-stone-700">
          Contraseña
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Al menos 6 caracteres"
          {...register('password')}
          disabled={isSubmitting}
        />
        {errors.password && (
          <p className="text-xs text-rose-500 font-medium">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creando cuenta...
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-2" />
            Crear Cuenta de Coleccionista
          </>
        )}
      </Button>
    </form>
  );
}

export default RegisterForm;
