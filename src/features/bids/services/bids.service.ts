import { db } from '@/lib/db';
import { AuctionStatus, Prisma } from '@prisma/client';

export interface PlaceBidDTO {
  auctionId: string;
  bidderId: string;
  amount: number;
}

export const bidsService = {
  /**
   * Place a bid on an auction atomically with anti-sniping extension.
   */
  async placeBid(data: PlaceBidDTO) {
    if (data.amount <= 0 || isNaN(data.amount)) {
      const error = new Error('El monto de la oferta debe ser un número mayor a cero.');
      (error as any).status = 400;
      throw error;
    }

    return await db.$transaction(async (tx) => {
      // 1. Fetch auction with its current highest bid
      const auction = await tx.auction.findUnique({
        where: { id: data.auctionId },
        include: {
          bids: {
            orderBy: { amount: 'desc' },
            take: 1,
          },
        },
      });

      if (!auction) {
        const error = new Error('Subasta no encontrada.');
        (error as any).status = 404;
        throw error;
      }

      // Rule 6: A user cannot bid on their own auction
      if (auction.sellerId === data.bidderId) {
        const error = new Error('No puedes ofertar en tu propia subasta.');
        (error as any).status = 400;
        throw error;
      }

      // Rule 7: Can only bid on active auction (not cancelled and endsAt has not passed)
      const now = new Date();
      if (auction.status !== AuctionStatus.ACTIVE || now >= auction.endsAt) {
        const error = new Error('Solo se puede ofertar en una subasta activa.');
        (error as any).status = 400;
        throw error;
      }

      const startingPrice = Number(auction.startingPrice);
      const minIncrement = Number(auction.minIncrement);
      const highestBid = auction.bids[0];

      // Rule 8: First bid >= startingPrice; subsequent >= highestBid + minIncrement
      if (!highestBid) {
        if (data.amount < startingPrice) {
          const error = new Error(`La primera oferta debe ser mayor o igual al precio inicial ($${startingPrice.toFixed(2)}).`);
          (error as any).status = 400;
          throw error;
        }
      } else {
        // Rule 9: User who has the highest bid cannot bid again
        if (highestBid.bidderId === data.bidderId) {
          const error = new Error('Ya tienes la oferta más alta actual en esta subasta.');
          (error as any).status = 400;
          throw error;
        }

        const minRequired = Number(highestBid.amount) + minIncrement;
        if (data.amount < minRequired) {
          const error = new Error(`La oferta mínima requerida es de $${minRequired.toFixed(2)} (oferta actual + incremento mínimo).`);
          (error as any).status = 400;
          throw error;
        }
      }

      // Rule 11 (Anti-sniping): If bid arrives with 5m or less remaining, extend by 5 minutes
      const fiveMinutesMs = 5 * 60 * 1000;
      const msRemaining = auction.endsAt.getTime() - now.getTime();
      let newEndsAt = auction.endsAt;

      if (msRemaining <= fiveMinutesMs && msRemaining > 0) {
        newEndsAt = new Date(auction.endsAt.getTime() + fiveMinutesMs);
        await tx.auction.update({
          where: { id: auction.id },
          data: { endsAt: newEndsAt },
        });
      }

      // Rule 10: Create immutable bid
      const bid = await tx.bid.create({
        data: {
          amount: new Prisma.Decimal(data.amount),
          auctionId: data.auctionId,
          bidderId: data.bidderId,
        },
      });

      return {
        bid: {
          id: bid.id,
          amount: Number(bid.amount),
          createdAt: bid.createdAt,
        },
        extended: newEndsAt.getTime() !== auction.endsAt.getTime(),
        endsAt: newEndsAt,
      };
    });
  },

  /**
   * List all bids made by a specific user (Rule 20).
   */
  async listMyBids(userId: string) {
    const bids = await db.bid.findMany({
      where: { bidderId: userId },
      include: {
        auction: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            status: true,
            endsAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bids.map((b) => ({
      id: b.id,
      amount: Number(b.amount),
      createdAt: b.createdAt,
      auction: b.auction,
    }));
  },
};
