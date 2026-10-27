import { db } from '@/lib/db';
import { AuctionStatus, Prisma } from '@prisma/client';

export interface CreateAuctionDTO {
  sellerId: string;
  title: string;
  description: string;
  imageUrl?: string;
  startingPrice: number;
  minIncrement: number;
  endsAt: Date;
  categoryId: string;
}

export interface UpdateAuctionDTO {
  auctionId: string;
  userId: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  categoryId?: string;
}

export interface ListAuctionsFilter {
  categoryId?: string;
  status?: string;
  search?: string;
  sellerId?: string;
}

export function maskBidderName(fullName: string): string {
  if (!fullName) return 'Anónimo';
  const parts = fullName.trim().split(' ');
  const first = parts[0];
  const last = parts.length > 1 ? parts[parts.length - 1] : '';

  const maskedFirst = first.length <= 2 ? first + '***' : `${first[0]}***${first[first.length - 1]}`;
  const maskedLast = last ? ` ${last[0]}.` : '';
  return `${maskedFirst}${maskedLast}`;
}

export function computeAuctionStatus(auction: {
  status: AuctionStatus;
  endsAt: Date;
  bids?: { id: string }[];
  _count?: { bids: number };
}): AuctionStatus {
  if (auction.status === AuctionStatus.CANCELLED) {
    return AuctionStatus.CANCELLED;
  }

  const now = new Date();
  if (now < auction.endsAt) {
    return AuctionStatus.ACTIVE;
  }

  // Ended
  const bidCount = auction._count?.bids ?? auction.bids?.length ?? 0;
  return bidCount > 0 ? AuctionStatus.CLOSED : AuctionStatus.DESERTED;
}

export const auctionsService = {
  /**
   * List auctions with dynamic state computation and filtering.
   */
  async list(filter: ListAuctionsFilter = {}) {
    const where: Prisma.AuctionWhereInput = {};

    if (filter.categoryId) {
      where.categoryId = filter.categoryId;
    }

    if (filter.sellerId) {
      where.sellerId = filter.sellerId;
    }

    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const auctions = await db.auction.findMany({
      where,
      include: {
        category: true,
        seller: {
          select: { id: true, name: true, email: true },
        },
        bids: {
          orderBy: { amount: 'desc' },
          take: 1,
        },
        _count: {
          select: { bids: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    // Map and compute status dynamically per Rule 12 & 13
    const formatted = auctions.map((auc) => {
      const calculatedStatus = computeAuctionStatus(auc);
      const highestBid = auc.bids[0] ? Number(auc.bids[0].amount) : null;

      return {
        id: auc.id,
        title: auc.title,
        description: auc.description,
        imageUrl: auc.imageUrl,
        startingPrice: Number(auc.startingPrice),
        minIncrement: Number(auc.minIncrement),
        currentPrice: highestBid ?? Number(auc.startingPrice),
        endsAt: auc.endsAt,
        status: calculatedStatus,
        cancellationReason: auc.cancellationReason,
        category: auc.category,
        seller: { id: auc.seller.id, name: auc.seller.name },
        bidCount: auc._count.bids,
        createdAt: auc.createdAt,
      };
    });

    if (filter.status) {
      const target = filter.status.toUpperCase();
      return formatted.filter((a) => a.status === target);
    }

    return formatted;
  },

  /**
   * Get auction detail by ID with bid history and masked bidder aliases.
   */
  async getById(id: string) {
    const auction = await db.auction.findUnique({
      where: { id },
      include: {
        category: true,
        seller: {
          select: { id: true, name: true, email: true },
        },
        bids: {
          orderBy: { amount: 'desc' },
          include: {
            bidder: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!auction) {
      const error = new Error('Subasta no encontrada.');
      (error as any).status = 404;
      throw error;
    }

    const calculatedStatus = computeAuctionStatus(auction);
    const highestBid = auction.bids[0] ? Number(auction.bids[0].amount) : null;

    // Mask bidder names per Rule 18
    const maskedBids = auction.bids.map((b) => ({
      id: b.id,
      amount: Number(b.amount),
      createdAt: b.createdAt,
      bidderAlias: maskBidderName(b.bidder.name),
      bidderId: b.bidder.id,
    }));

    return {
      id: auction.id,
      title: auction.title,
      description: auction.description,
      imageUrl: auction.imageUrl,
      startingPrice: Number(auction.startingPrice),
      minIncrement: Number(auction.minIncrement),
      currentPrice: highestBid ?? Number(auction.startingPrice),
      endsAt: auction.endsAt,
      status: calculatedStatus,
      cancellationReason: auction.cancellationReason,
      category: auction.category,
      seller: { id: auction.seller.id, name: auction.seller.name },
      bids: maskedBids,
      bidCount: maskedBids.length,
      createdAt: auction.createdAt,
    };
  },

  /**
   * Create an auction enforcing business rules 1, 2, 3, 4.
   */
  async create(data: CreateAuctionDTO) {
    // Rule 1: Starting price and min increment > 0
    if (data.startingPrice <= 0 || data.minIncrement <= 0) {
      const error = new Error('El precio inicial y el incremento mínimo deben ser mayores a cero.');
      (error as any).status = 400;
      throw error;
    }

    // Rule 2: Date between 1h and 7d from now
    const now = Date.now();
    const minEndsAt = now + 60 * 60 * 1000; // 1 hour
    const maxEndsAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days
    const endsAtTime = new Date(data.endsAt).getTime();

    if (endsAtTime < minEndsAt || endsAtTime > maxEndsAt) {
      const error = new Error('La fecha de cierre debe estar entre 1 hora y 7 días a partir de la publicación.');
      (error as any).status = 400;
      throw error;
    }

    // Rule 3: Category must exist
    const category = await db.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      const error = new Error('La categoría seleccionada no existe.');
      (error as any).status = 400;
      throw error;
    }

    // Rule 4: Max 5 active auctions per seller
    const activeCount = await db.auction.count({
      where: {
        sellerId: data.sellerId,
        status: AuctionStatus.ACTIVE,
        endsAt: { gt: new Date() },
      },
    });

    if (activeCount >= 5) {
      const error = new Error('Has alcanzado el límite máximo de 5 subastas activas al mismo tiempo.');
      (error as any).status = 400;
      throw error;
    }

    return await db.auction.create({
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        imageUrl: data.imageUrl || null,
        startingPrice: new Prisma.Decimal(data.startingPrice),
        minIncrement: new Prisma.Decimal(data.minIncrement),
        endsAt: new Date(data.endsAt),
        sellerId: data.sellerId,
        categoryId: data.categoryId,
        status: AuctionStatus.ACTIVE,
      },
    });
  },

  /**
   * Update an auction enforcing business rules 5 & 19.
   */
  async update(data: UpdateAuctionDTO) {
    const auction = await db.auction.findUnique({
      where: { id: data.auctionId },
      include: { _count: { select: { bids: true } } },
    });

    if (!auction) {
      const error = new Error('Subasta no encontrada.');
      (error as any).status = 404;
      throw error;
    }

    // Rule 19: Only seller can edit
    if (auction.sellerId !== data.userId) {
      const error = new Error('No tienes permiso para editar esta subasta.');
      (error as any).status = 403;
      throw error;
    }

    // Rule 5: Only editable while active and has 0 bids
    const now = new Date();
    if (now >= auction.endsAt || auction.status !== AuctionStatus.ACTIVE) {
      const error = new Error('Solo se puede editar una subasta activa.');
      (error as any).status = 400;
      throw error;
    }

    if (auction._count.bids > 0) {
      const error = new Error('No se puede editar una subasta que ya tiene ofertas.');
      (error as any).status = 400;
      throw error;
    }

    const updateData: Prisma.AuctionUpdateInput = {};
    if (data.title) updateData.title = data.title.trim();
    if (data.description) updateData.description = data.description.trim();
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.categoryId) {
      const catExists = await db.category.findUnique({ where: { id: data.categoryId } });
      if (!catExists) {
        const error = new Error('La categoría especificada no existe.');
        (error as any).status = 400;
        throw error;
      }
      updateData.category = { connect: { id: data.categoryId } };
    }

    return await db.auction.update({
      where: { id: data.auctionId },
      data: updateData,
    });
  },

  /**
   * Cancel auction by seller enforcing business rules 14 & 19.
   */
  async cancelBySeller(auctionId: string, sellerId: string) {
    const auction = await db.auction.findUnique({
      where: { id: auctionId },
      include: { _count: { select: { bids: true } } },
    });

    if (!auction) {
      const error = new Error('Subasta no encontrada.');
      (error as any).status = 404;
      throw error;
    }

    // Rule 19: Seller verification
    if (auction.sellerId !== sellerId) {
      const error = new Error('No tienes permiso para cancelar esta subasta.');
      (error as any).status = 403;
      throw error;
    }

    // Rule 14: Seller can cancel ONLY if 0 bids
    if (auction._count.bids > 0) {
      const error = new Error('No puedes cancelar una subasta que ya recibió ofertas.');
      (error as any).status = 400;
      throw error;
    }

    if (auction.status === AuctionStatus.CANCELLED) {
      const error = new Error('La subasta ya está cancelada.');
      (error as any).status = 400;
      throw error;
    }

    // Rule 16: Kept, not deleted
    return await db.auction.update({
      where: { id: auctionId },
      data: {
        status: AuctionStatus.CANCELLED,
        cancellationReason: 'Cancelada por el vendedor antes de recibir ofertas.',
      },
    });
  },
};
