import { NextResponse } from 'next/server';
import { bidsService } from '@/features/bids/services/bids.service';
import { auctionsService } from '@/features/auctions/services/auctions.service';
import { getSessionUser } from '@/features/auth/services/jwt';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auction = await auctionsService.getById(id);
    return NextResponse.json({ success: true, bids: auction.bids });
  } catch (err: any) {
    const status = err.status || 500;
    return NextResponse.json({ error: err.message || 'Error al obtener historial de ofertas.' }, { status });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Debes iniciar sesión para realizar una oferta.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const amount = Number(body.amount);

    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: 'Debes ingresar un monto numérico válido.' }, { status: 400 });
    }

    const result = await bidsService.placeBid({
      auctionId: id,
      bidderId: session.userId,
      amount,
    });

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (err: any) {
    const status = err.status || 500;
    return NextResponse.json({ error: err.message || 'Error al procesar la oferta.' }, { status });
  }
}
