import { NextResponse } from 'next/server';
import { moderationService } from '@/features/admin/services/moderation.service';
import { getSessionUser } from '@/features/auth/services/jwt';
import { Role } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requiere rol de administrador para moderar subastas.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: 'El motivo de cancelación por moderación es obligatorio.' },
        { status: 400 }
      );
    }

    const cancelled = await moderationService.cancelAuction({
      auctionId: id,
      adminId: session.userId,
      reason,
    });

    return NextResponse.json({ success: true, auction: cancelled });
  } catch (err: any) {
    const status = err.status || 500;
    return NextResponse.json({ error: err.message || 'Error al cancelar subasta.' }, { status });
  }
}
