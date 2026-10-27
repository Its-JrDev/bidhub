import { NextResponse } from 'next/server';
import { categoriesService } from '@/features/categories/services/categories.service';
import { getSessionUser } from '@/features/auth/services/jwt';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const categories = await categoriesService.list();
    return NextResponse.json({ success: true, categories });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al obtener categorías.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores pueden crear categorías.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, slug, description } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'El nombre y el slug de la categoría son obligatorios.' },
        { status: 400 }
      );
    }

    const category = await categoriesService.create({ name, slug, description });
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (err: any) {
    const status = err.status || 500;
    return NextResponse.json({ error: err.message || 'Error al crear categoría.' }, { status });
  }
}
