import { NextResponse } from 'next/server';
import { bidsService } from '@/features/bids/services/bids.service';
import { getSessionUser } from '@/features/auth/services/jwt';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 });
    }

    const bids = await bidsService.listMyBids(session.userId);
    return NextResponse.json({ success: true, bids });
  } catch (err: any) {
    const status = err.status || 500;
    return NextResponse.json({ error: err.message || 'Error al obtener tus ofertas.' }, { status });
  }
}
