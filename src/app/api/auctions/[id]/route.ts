import { NextResponse } from 'next/server';
import { auctionsService } from '@/features/auctions/services/auctions.service';
import { getSessionUser } from '@/features/auth/services/jwt';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auction = await auctionsService.getById(id);
    return NextResponse.json({ success: true, auction });
  } catch (err: any) {
    const status = err.status || 500;
    return NextResponse.json({ error: err.message || 'Error al obtener subasta.' }, { status });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const updated = await auctionsService.update({
      auctionId: id,
      userId: session.userId,
      title: body.title,
      description: body.description,
      imageUrl: body.imageUrl,
      categoryId: body.categoryId,
    });

    return NextResponse.json({ success: true, auction: updated });
  } catch (err: any) {
    const status = err.status || 500;
    return NextResponse.json({ error: err.message || 'Error al actualizar subasta.' }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 });
    }

    const { id } = await params;
    const cancelled = await auctionsService.cancelBySeller(id, session.userId);

    return NextResponse.json({ success: true, auction: cancelled });
  } catch (err: any) {
    const status = err.status || 500;
    return NextResponse.json({ error: err.message || 'Error al cancelar subasta.' }, { status });
  }
}
