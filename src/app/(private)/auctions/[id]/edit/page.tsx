import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { PageHeader, Alert, AlertDescription, Button } from '@/shared/components/ui';
import { EditAuctionForm } from '@/features/auctions/components';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AuctionsIdEditPage({ params }: Props) {
  const { id } = await params;

  const auction = await db.auction.findUnique({
    where: { id },
    include: {
      bids: {
        select: { id: true },
        take: 1,
      },
      category: true,
    },
  });

  if (!auction) {
    notFound();
  }

  const hasBids = auction.bids.length > 0;
  const isCancelled = auction.status === 'CANCELLED';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" data-testid="auctions-id-edit-page">
      <PageHeader
        title="Editar Subasta"
        description={`Edición del lote: "${auction.title}"`}
        actions={
          <Link href={`/auctions/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Volver al Lote
            </Button>
          </Link>
        }
        className="mb-8"
      />

      {hasBids ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            <strong>Regla 5 de Negocio:</strong> El vendedor puede editar su subasta únicamente mientras no tenga ofertas. Esta subasta ya cuenta con pujas registradas y sus términos son vinculantes.
          </AlertDescription>
        </Alert>
      ) : isCancelled ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            Esta subasta se encuentra cancelada y no admite modificaciones.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm">
          <EditAuctionForm
            auction={{
              id: auction.id,
              title: auction.title,
              description: auction.description,
              categoryId: auction.categoryId,
              imageUrl: auction.imageUrl,
              startingPrice: Number(auction.startingPrice),
              minIncrement: Number(auction.minIncrement),
            }}
          />
        </div>
      )}
    </div>
  );
}
