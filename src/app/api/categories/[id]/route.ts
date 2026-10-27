import { NextResponse } from 'next/server';
import { categoriesService } from '@/features/categories/services/categories.service';
import { getSessionUser } from '@/features/auth/services/jwt';
import { Role } from '@prisma/client';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores pueden editar categorías.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const updated = await categoriesService.update(id, {
      name: body.name,
      description: body.description,
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (err: any) {
    const status = err.status || 500;
    return NextResponse.json({ error: err.message || 'Error al actualizar categoría.' }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores pueden eliminar categorías.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    await categoriesService.delete(id);

    return NextResponse.json({ success: true, message: 'Categoría eliminada exitosamente.' });
  } catch (err: any) {
    const status = err.status || 500;
    return NextResponse.json({ error: err.message || 'Error al eliminar categoría.' }, { status });
  }
}
