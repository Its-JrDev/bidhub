import React from 'react';
import Link from 'next/link';
import { auctionsService } from '@/features/auctions/services/auctions.service';
import { categoriesService } from '@/features/categories/services/categories.service';
import { AuctionCard } from '@/features/auctions/components/AuctionCard';
import { EmptyState } from '@/shared/components/ui';
import { Filter, Tag, PlusCircle } from 'lucide-react';

// SSR: Catálogo is Server-Side Rendered on demand
export const dynamic = 'force-dynamic';

export default async function AuctionsCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const categoryId = params.categoryId || undefined;
  const status = params.status || undefined;
  const search = params.search || undefined;

  let auctions: any[] = [];
  let categories: any[] = [];

  try {
    [auctions, categories] = await Promise.all([
      auctionsService.list({ categoryId, status, search }),
      categoriesService.list(),
    ]);
  } catch (e) {
    console.error('Error fetching catalog:', e);
  }

  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            Catálogo de Subastas
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Explora {auctions.length} artículos de colección disponibles.
          </p>
        </div>

        <Link
          href="/auctions/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-all shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publicar Subasta</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-8 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <span className="text-xs font-semibold text-stone-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Estado:
          </span>
          {[
            { label: 'Todas', value: '' },
            { label: 'Activas', value: 'ACTIVE' },
            { label: 'Cerradas', value: 'CLOSED' },
            { label: 'Desiertas', value: 'DESERTED' },
            { label: 'Canceladas', value: 'CANCELLED' },
          ].map((s) => {
            const isSelected = (!status && s.value === '') || status === s.value;
            const queryParams = new URLSearchParams();
            if (categoryId) queryParams.set('categoryId', categoryId);
            if (search) queryParams.set('search', search);
            if (s.value) queryParams.set('status', s.value);

            return (
              <Link
                key={s.label}
                href={`/auctions?${queryParams.toString()}`}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-stone-900 text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {s.label}
              </Link>
            );
          })}
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <span className="text-xs font-semibold text-stone-500 mr-1 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> Categoría:
          </span>
          <Link
            href={status ? `/auctions?status=${status}` : '/auctions'}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              !categoryId
                ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Todas
          </Link>
          {categories.map((c: any) => {
            const isSelected = categoryId === c.id;
            const queryParams = new URLSearchParams();
            queryParams.set('categoryId', c.id);
            if (status) queryParams.set('status', status);

            return (
              <Link
                key={c.id}
                href={`/auctions?${queryParams.toString()}`}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {c.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Current Filter Notice */}
      {selectedCategory && (
        <div className="mb-6 flex items-center justify-between bg-amber-50/60 border border-amber-200/80 rounded-xl px-4 py-2 text-xs text-amber-900">
          <span>Filtrando por categoría: <strong>{selectedCategory.name}</strong></span>
          <Link href="/auctions" className="text-amber-800 font-bold hover:underline">
            Limpiar filtro
          </Link>
        </div>
      )}

      {/* Grid */}
      {auctions.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No hay subastas para mostrar"
          description="Prueba cambiando los filtros de categoría o de estado seleccionados."
          action={{
            label: 'Restablecer filtros',
            href: '/auctions',
          }}
          className="bg-white"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
}
