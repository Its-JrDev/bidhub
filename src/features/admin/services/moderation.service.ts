import { db } from '@/lib/db';
import { AuctionStatus, Role } from '@prisma/client';

export interface CancelAuctionAsAdminDTO {
  auctionId: string;
  adminId: string;
  reason: string;
}

export const moderationService = {
  /**
   * Cancel an auction as administrator (Rules 15 & 16).
   */
  async cancelAuction(data: CancelAuctionAsAdminDTO) {
    // 1. Verify user is ADMIN
    const admin = await db.user.findUnique({
      where: { id: data.adminId },
    });

    if (!admin || admin.role !== Role.ADMIN) {
      const error = new Error('Acceso no autorizado. Se requiere rol de administrador.');
      (error as any).status = 403;
      throw error;
    }

    // 2. Reason is mandatory
    if (!data.reason || !data.reason.trim()) {
      const error = new Error('El motivo de cancelación es obligatorio.');
      (error as any).status = 400;
      throw error;
    }

    const auction = await db.auction.findUnique({
      where: { id: data.auctionId },
    });

    if (!auction) {
      const error = new Error('Subasta no encontrada.');
      (error as any).status = 404;
      throw error;
    }

    if (auction.status === AuctionStatus.CANCELLED) {
      const error = new Error('La subasta ya se encuentra cancelada.');
      (error as any).status = 400;
      throw error;
    }

    // Rule 15 & 16: Updates status and records mandatory reason without deleting auction
    return await db.auction.update({
      where: { id: data.auctionId },
      data: {
        status: AuctionStatus.CANCELLED,
        cancellationReason: `Cancelada por moderador (${admin.name}): ${data.reason.trim()}`,
      },
    });
  },

  /**
   * Fetch moderation statistics for admin dashboard.
   */
  async getMetrics() {
    const [totalUsers, totalAuctions, activeAuctions, totalBids, totalCategories] = await Promise.all([
      db.user.count(),
      db.auction.count(),
      db.auction.count({
        where: {
          status: AuctionStatus.ACTIVE,
          endsAt: { gt: new Date() },
        },
      }),
      db.bid.count(),
      db.category.count(),
    ]);

    return {
      totalUsers,
      totalAuctions,
      activeAuctions,
      totalBids,
      totalCategories,
    };
  },
};
