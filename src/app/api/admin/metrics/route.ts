import { NextResponse } from 'next/server';
import { moderationService } from '@/features/admin/services/moderation.service';
import { getSessionUser } from '@/features/auth/services/jwt';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado. Se requiere rol de administrador.' }, { status: 403 });
    }

    const metrics = await moderationService.getMetrics();
    return NextResponse.json({ success: true, metrics });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error al obtener métricas del sistema.' },
      { status: 500 }
    );
  }
}
