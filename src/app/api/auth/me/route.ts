import { NextResponse } from 'next/server';
import { getSessionUser } from '@/features/auth/services/jwt';
import { authService } from '@/features/auth/services/auth.service';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const user = await authService.getProfile(session.userId);
    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    const status = err.status || 401;
    return NextResponse.json({ error: err.message || 'Error al obtener sesión.' }, { status });
  }
}
