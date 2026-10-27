import { NextResponse } from 'next/server';
import { auctionsService } from '@/features/auctions/services/auctions.service';
import { getSessionUser } from '@/features/auth/services/jwt';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const sellerId = searchParams.get('sellerId') || undefined;

    const auctions = await auctionsService.list({
      categoryId,
      status,
      search,
      sellerId,
    });

    return NextResponse.json({ success: true, auctions });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error al listar subastas.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Debes iniciar sesión para publicar una subasta.' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, imageUrl, startingPrice, minIncrement, endsAt, categoryId } = body;

    if (!title || !description || startingPrice === undefined || minIncrement === undefined || !endsAt || !categoryId) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios deben ser proporcionados.' },
        { status: 400 }
      );
    }

    const auction = await auctionsService.create({
      sellerId: session.userId,
      title,
      description,
      imageUrl,
      startingPrice: Number(startingPrice),
      minIncrement: Number(minIncrement),
      endsAt: new Date(endsAt),
      categoryId,
    });

    return NextResponse.json({ success: true, auction }, { status: 201 });
  } catch (err: any) {
    const status = err.status || 500;
    return NextResponse.json({ error: err.message || 'Error al crear subasta.' }, { status });
  }
}
