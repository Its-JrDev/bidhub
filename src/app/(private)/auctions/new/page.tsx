import React from 'react';
import { PageHeader } from '@/shared/components/ui';
import { CreateAuctionForm } from '@/features/auctions/components';

export default function AuctionsNewPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" data-testid="auctions-new-page">
      <PageHeader
        title="Publicar Nueva Subasta"
        description="Configura los detalles de tu lote de colección, precio de salida, incrementos y fecha de cierre."
        className="mb-8"
      />
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm">
        <CreateAuctionForm />
      </div>
    </div>
  );
}
