import Link from 'next/link';
import { Gavel, Sparkles, Shield, Clock, ArrowRight, Tag } from 'lucide-react';
import { auctionsService } from '@/features/auctions/services/auctions.service';
import { categoriesService } from '@/features/categories/services/categories.service';
import { AuctionCard } from '@/features/auctions/components/AuctionCard';

// SSG: Home is statically generated
export const revalidate = 60; // ISR revalidation every 60s

export default async function HomePage() {
  let featuredAuctions: any[] = [];
  let categories: any[] = [];

  try {
    featuredAuctions = await auctionsService.list({ status: 'ACTIVE' });
    categories = await categoriesService.list();
  } catch (e) {
    console.error('Error fetching home data:', e);
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mercado Certificado de Coleccionismo</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
            El mercado definitivo de <span className="text-amber-400">artículos de colección</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-stone-300 max-w-2xl leading-relaxed">
            Descubre, oferta y subasta cartas raras, relojes vintage, vinilos históricos y figuras exclusivas con garantía de procedencia y reglas de negocio transparentes.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auctions"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
            >
              <span>Explorar Subastas</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/auctions/new"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold text-sm border border-stone-700 active:scale-95 transition-all"
            >
              <Gavel className="w-4 h-4 text-amber-400" />
              <span>Publicar Artículo</span>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-14 pt-8 border-t border-stone-800/80 grid grid-cols-1 sm:grid-cols-3 gap-6 text-stone-400 text-xs max-w-3xl">
            <div className="flex items-center justify-center gap-2.5">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Cero APIs externas: DB propia en Supabase</span>
            </div>
            <div className="flex items-center justify-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Protección anti-sniping automática</span>
            </div>
            <div className="flex items-center justify-center gap-2.5">
              <Gavel className="w-4 h-4 text-amber-400" />
              <span>Ofertas atómicas e inmutables</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      {categories.length > 0 && (
        <section className="py-12 bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">Categorías Populares</h2>
              <Link href="/auctions" className="text-xs font-semibold text-amber-800 hover:underline flex items-center gap-1">
                Ver todas <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/auctions?categoryId=${cat.id}`}
                  className="p-4 rounded-xl bg-stone-50 hover:bg-amber-50/50 border border-stone-200 hover:border-amber-300 transition-all group flex flex-col justify-between"
                >
                  <Tag className="w-5 h-5 text-stone-400 group-hover:text-amber-600 transition-colors mb-2" />
                  <div>
                    <span className="font-semibold text-sm text-stone-900 block group-hover:text-amber-900">
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {cat._count?.auctions || 0} lotes
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Auctions Grid */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-800 font-semibold block">
                En vivo ahora
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1">
                Subastas Destacadas
              </h2>
            </div>
            <Link
              href="/auctions"
              className="text-xs font-semibold px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
            >
              Ver Catálogo Completo
            </Link>
          </div>

          {featuredAuctions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
              No hay subastas activas en este momento. ¡Sé el primero en publicar una!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAuctions.slice(0, 6).map((auction: any) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
