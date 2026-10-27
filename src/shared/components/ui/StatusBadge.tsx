'use client';

import React from 'react';
import { Badge } from './badge';
import { useI18nStore } from '@/shared/stores';

export type AuctionStatusType = 'ACTIVE' | 'CLOSED' | 'DESERTED' | 'CANCELLED' | string;

interface StatusBadgeProps {
  status: AuctionStatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useI18nStore();
  const normalized = (status || '').toUpperCase();

  switch (normalized) {
    case 'ACTIVE':
      return (
        <Badge variant="success" className={className}>
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {t.auctions.active}
        </Badge>
      );
    case 'CLOSED':
      return (
        <Badge variant="default" className={`bg-blue-600 hover:bg-blue-700 text-white ${className || ''}`}>
          {t.auctions.closed}
        </Badge>
      );
    case 'DESERTED':
      return (
        <Badge variant="secondary" className={`bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 ${className || ''}`}>
          {t.auctions.deserted}
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="destructive" className={className}>
          {t.auctions.cancelled}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={className}>
          {status}
        </Badge>
      );
  }
}
