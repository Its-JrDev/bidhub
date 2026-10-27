import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { auctionsService } from '@/features/auctions/services/auctions.service';
import { getSessionUser } from '@/features/auth/services/jwt';
import { CountdownTimer } from '@/features/auctions/components/CountdownTimer';
import { AuctionActions } from '@/features/auctions/components/AuctionActions';
import { BidHistory } from '@/features/bids/components/BidHistory';
import { StatusBadge, Badge } from '@/shared/components/ui';
import { formatCurrency } from '@/shared/utils/format';
import { Tag, ArrowLeft, User, History } from 'lucide-react';

// SSR: Detail page is rendered dynamically on server
export const dynamic = 'force-dynamic';

export default async function AuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let auction: any = null;
  let currentUser: any = null;

  try {
    [auction, currentUser] = await Promise.all([
      auctionsService.getById(id),
      getSessionUser(),
    ]);
  } catch (e: any) {
    if (e.status === 404) notFound();
    console.error('Error fetching auction detail:', e);
  }

  if (!auction) notFound();

  const imageSrc =
    auction.imageUrl && auction.imageUrl.startsWith('http')
      ? auction.imageUrl
      : 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <Link
        href="/auctions"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al catálogo</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Image & Details (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Main Image with next/image */}
          <div className="relative w-full h-[380px] sm:h-[460px] rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm">
            <Image
              src={imageSrc}
              alt={auction.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <StatusBadge status={auction.status} />
              {auction.category && (
                <Badge variant="outline" className="bg-white/95 backdrop-blur-sm text-stone-800 text-xs font-medium border-stone-200 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-stone-500" />
                  {auction.category.name}
                </Badge>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight mb-4">
              Descripción del lote
            </h2>
            <div className="prose prose-stone text-stone-600 text-sm leading-relaxed whitespace-pre-line">
              {auction.description}
            </div>

            {/* Cancellation reason callout if cancelled */}
            {auction.status === 'CANCELLED' && auction.cancellationReason && (
              <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                <span className="font-bold block mb-1">Motivo de cancelación registrado (Regla 15 y 16):</span>
                <p>{auction.cancellationReason}</p>
              </div>
            )}
          </div>

          {/* Bid History (Rule 18: Masked aliases, reusable component) */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-amber-500" />
              <span>Historial de Ofertas ({auction.bidCount})</span>
            </h2>

            <BidHistory
              bids={auction.bids.map((b: any) => ({
                id: b.id,
                amount: b.amount,
                createdAt: b.createdAt,
                user: { name: b.bidderAlias },
              }))}
            />
          </div>
        </div>

        {/* Right Column: Pricing & Action Sidebar (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
            <span className="text-xs text-stone-400 font-medium">Lote #{auction.id.slice(-6).toUpperCase()}</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1 leading-snug">
              {auction.title}
            </h1>

            {/* Seller meta */}
            <div className="mt-4 flex items-center gap-2 text-xs text-stone-500 border-b border-stone-100 pb-4">
              <User className="w-4 h-4 text-stone-400" />
              <span>Vendedor: <strong>{auction.seller.name}</strong></span>
            </div>

            {/* Countdown Banner */}
            <div className="mt-4 flex items-center justify-between bg-stone-50 rounded-2xl p-4 border border-stone-100">
              <span className="text-xs font-semibold text-stone-600">Tiempo restante:</span>
              <CountdownTimer endsAt={auction.endsAt} />
            </div>

            {/* Price Box */}
            <div className="mt-6 pt-2 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider block">
                  Oferta Actual
                </span>
                <span className="text-2xl font-black text-stone-900 mt-1 block">
                  {formatCurrency(auction.currentPrice)}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block">
                  Precio Inicial
                </span>
                <span className="text-lg font-bold text-stone-700 mt-1 block">
                  {formatCurrency(auction.startingPrice)}
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  Incremento: {formatCurrency(auction.minIncrement)}
                </span>
              </div>
            </div>

            {/* Interactive Actions Component */}
            <div className="mt-6">
              <AuctionActions
                auctionId={auction.id}
                sellerId={auction.seller.id}
                currentPrice={auction.currentPrice}
                minIncrement={auction.minIncrement}
                bidCount={auction.bidCount}
                status={auction.status}
                endsAt={auction.endsAt}
                currentUser={currentUser ? { id: currentUser.userId, role: currentUser.role, name: currentUser.name } : null}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
