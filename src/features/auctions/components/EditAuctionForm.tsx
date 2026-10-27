'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { editAuctionSchema, type EditAuctionFormValues } from './edit-auction.schema';
import { useCategories } from '@/shared/hooks';
import {
  Button,
  Input,
  Label,
  Textarea,
  Alert,
  AlertDescription,
} from '@/shared/components/ui';
import { AlertCircle, Loader2 } from 'lucide-react';

interface EditAuctionFormProps {
  auction: {
    id: string;
    title: string;
    description: string;
    categoryId: string;
    imageUrl?: string | null;
    startingPrice?: number;
    minIncrement?: number;
  };
}

export function EditAuctionForm({ auction }: EditAuctionFormProps) {
  const router = useRouter();
  const { categories, loading: categoriesLoading } = useCategories();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditAuctionFormValues>({
    resolver: zodResolver(editAuctionSchema),
    defaultValues: {
      title: auction.title,
      description: auction.description,
      categoryId: auction.categoryId,
      imageUrl: auction.imageUrl || '',
      startingPrice: auction.startingPrice,
      minIncrement: auction.minIncrement,
    },
  });

  const onSubmit = async (values: EditAuctionFormValues) => {
    setServerError(null);
    try {
      const res = await fetch(`/api/auctions/${auction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar la subasta');
      }

      router.push(`/auctions/${auction.id}`);
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
          {...register('description')}
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="text-xs text-rose-500 font-medium">{errors.description.message}</p>
        )}
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando cambios...
            </>
          ) : (
            'Guardar Cambios'
          )}
        </Button>
      </div>
    </form>
  );
}

export default EditAuctionForm;
