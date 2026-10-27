'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAuctionSchema, type CreateAuctionFormValues } from './create-auction.schema';
import { useCategories } from '@/shared/hooks';
import {
  Button,
  Input,
  Label,
  Textarea,
  Alert,
  AlertDescription,
} from '@/shared/components/ui';
import { AlertCircle, Loader2, Sparkles } from 'lucide-react';

export function CreateAuctionForm() {
  const router = useRouter();
  const { categories, loading: categoriesLoading } = useCategories();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateAuctionFormValues>({
    resolver: zodResolver(createAuctionSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      startingPrice: 10,
      minIncrement: 5,
      endsAt: '',
      imageUrl: '',
    },
  });

  const onSubmit = async (values: CreateAuctionFormValues) => {
    setServerError(null);
    try {
      const res = await fetch('/api/auctions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al crear la subasta');
      }

      router.push(`/auctions/${data.auction?.id || data.id}`);
      router.refresh();
    } catch (err: any) {
      setServerError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-stone-700 font-semibold text-sm">
          Título del Lote <span className="text-rose-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Ej. Charizard 1st Edition Base Set PSA 9 Mint"
          {...register('title')}
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="text-xs text-rose-500 font-medium">{errors.title.message}</p>
        )}
      </div>

      {/* Category & Image URL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoryId" className="text-stone-700 font-semibold text-sm">
            Categoría <span className="text-rose-500">*</span>
          </Label>
          <select
            id="categoryId"
            {...register('categoryId')}
            disabled={isSubmitting || categoriesLoading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Selecciona una categoría...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-xs text-rose-500 font-medium">{errors.categoryId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl" className="text-stone-700 font-semibold text-sm">
            URL de la Imagen
          </Label>
          <Input
            id="imageUrl"
            placeholder="https://images.unsplash.com/..."
            {...register('imageUrl')}
            disabled={isSubmitting}
          />
          {errors.imageUrl && (
            <p className="text-xs text-rose-500 font-medium">{errors.imageUrl.message}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-stone-700 font-semibold text-sm">
          Descripción del Artículo <span className="text-rose-500">*</span>
        </Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="Describe el estado de conservación, autenticidad, historia y detalles del lote..."
          {...register('description')}
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="text-xs text-rose-500 font-medium">{errors.description.message}</p>
        )}
      </div>

      {/* Financials & Deadline (Rules 1, 2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startingPrice" className="text-stone-700 font-semibold text-sm">
            Precio Inicial ($ USD) <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="startingPrice"
            type="number"
            step="0.01"
            min="0.01"
            {...register('startingPrice')}
            disabled={isSubmitting}
          />
          {errors.startingPrice && (
            <p className="text-xs text-rose-500 font-medium">{errors.startingPrice.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="minIncrement" className="text-stone-700 font-semibold text-sm">
            Incremento Mínimo ($) <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="minIncrement"
            type="number"
            step="0.01"
            min="0.01"
            {...register('minIncrement')}
            disabled={isSubmitting}
          />
          {errors.minIncrement && (
            <p className="text-xs text-rose-500 font-medium">{errors.minIncrement.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endsAt" className="text-stone-700 font-semibold text-sm">
            Fecha de Cierre <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="endsAt"
            type="datetime-local"
            {...register('endsAt')}
            disabled={isSubmitting}
          />
          {errors.endsAt && (
            <p className="text-xs text-rose-500 font-medium">{errors.endsAt.message}</p>
          )}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-800 space-y-1">
        <p className="font-semibold flex items-center gap-1.5 text-amber-900">
          <Sparkles className="w-4 h-4 text-amber-600" />
          Reglas de publicación:
        </p>
        <p>• El cierre debe estar entre 1 hora y 7 días a partir del momento actual (Regla 2).</p>
        <p>• Máximo 5 subastas activas simultáneas por vendedor (Regla 4).</p>
        <p>• Podrás editar o cancelar la subasta únicamente mientras no reciba ofertas (Reglas 5 y 14).</p>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-2.5 text-sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Publicando lote en BidHub...
          </>
        ) : (
          'Publicar Subasta'
        )}
      </Button>
    </form>
  );
}

export default CreateAuctionForm;
