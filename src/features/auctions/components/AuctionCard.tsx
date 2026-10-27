'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Tag, Gavel } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';
import { useI18nStore } from '@/shared/stores';
import { formatCurrency } from '@/shared/utils/format';
import { StatusBadge, Badge } from '@/shared/components/ui';

export interface AuctionCardData {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  startingPrice: number;
  currentPrice: number;
  endsAt: string | Date;
  status: string;
  category?: { name: string; slug: string };
  bidCount: number;
  seller?: { name: string };
}

interface AuctionCardProps {
  auction: AuctionCardData;
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const { t } = useI18nStore();

  const imageSrc =
    auction.imageUrl && auction.imageUrl.startsWith('http')
      ? auction.imageUrl
      : 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Image Container with next/image */}
      <div className="relative w-full h-52 bg-stone-100 overflow-hidden">
        <Image
          src={imageSrc}
          alt={auction.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-1.5 items-center">
          <StatusBadge status={auction.status} />
          {auction.category && (
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-stone-800 text-[11px] font-medium border-stone-200 flex items-center gap-1">
              <Tag className="w-3 h-3 text-stone-500" />
              {auction.category.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-semibold text-stone-900 text-base leading-snug line-clamp-2 group-hover:text-amber-800 transition-colors">
          {auction.title}
        </h3>
        <p className="text-stone-500 text-xs mt-1.5 line-clamp-2">
          {auction.description}
        </p>

        {/* Countdown */}
        <div className="mt-3.5">
          <CountdownTimer endsAt={auction.endsAt} />
        </div>

        {/* Pricing & Bids */}
        <div className="mt-auto pt-4 border-t border-stone-100 flex items-end justify-between">
          <div>
            <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block">
              {t.auctions.currentPrice}
            </span>
            <span className="text-lg font-bold text-stone-900">
              {formatCurrency(auction.currentPrice)}
            </span>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-xs text-stone-500 font-medium">
              <Gavel className="w-3.5 h-3.5 text-stone-400" />
              {auction.bidCount} {t.auctions.bidsCount}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={`/auctions/${auction.id}`}
          className="mt-4 block w-full py-2.5 px-4 text-center text-xs font-semibold rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-colors"
        >
          {t.auctions.viewDetail}
        </Link>
      </div>
    </div>
  );
}
