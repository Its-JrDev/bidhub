'use client';

import React from 'react';
import { Gavel } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  EmptyState,
} from '@/shared/components/ui';
import { formatCurrency, formatDate, formatBidderAlias } from '@/shared/utils/format';
import { useI18nStore } from '@/shared/stores';

export interface BidRecord {
  id: string;
  amount: number;
  createdAt: string | Date;
  user?: {
    id?: string;
    name: string;
    email?: string;
  };
}

interface BidHistoryProps {
  bids: BidRecord[];
  className?: string;
}

export function BidHistory({ bids, className }: BidHistoryProps) {
  const { t } = useI18nStore();

  if (!bids || bids.length === 0) {
    return (
      <div className={`py-6 text-center bg-stone-50 rounded-xl border border-stone-100 ${className || ''}`}>
        <p className="text-sm text-stone-500">Aún no hay ofertas para este lote. ¡Sé el primero en ofertar!</p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-stone-200 bg-white ${className || ''}`}>
      <Table>
        <TableHeader className="bg-stone-50/80">
          <TableRow>
            <TableHead className="w-12 text-center text-xs font-semibold text-stone-600">#</TableHead>
            <TableHead className="text-xs font-semibold text-stone-600">Postor</TableHead>
            <TableHead className="text-xs font-semibold text-stone-600">Fecha y Hora</TableHead>
            <TableHead className="text-right text-xs font-semibold text-stone-600">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bids.map((bid, idx) => {
            const isHighest = idx === 0;
            return (
              <TableRow key={bid.id} className={isHighest ? 'bg-amber-50/50 font-medium' : ''}>
                <TableCell className="text-center text-xs text-stone-400">
                  {bids.length - idx}
                </TableCell>
                <TableCell className="text-xs text-stone-800">
                  <div className="flex items-center gap-1.5">
                    <span>{formatBidderAlias(bid.user?.name || 'Postor')}</span>
                    {isHighest && (
                      <Badge variant="warning" className="text-[10px] py-0 px-1.5 h-4">
                        Más alta
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-stone-500">
                  {formatDate(bid.createdAt)}
                </TableCell>
                <TableCell className="text-right text-xs font-semibold text-stone-900">
                  {formatCurrency(bid.amount)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default BidHistory;
