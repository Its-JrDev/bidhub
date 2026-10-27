import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authService } from '@/features/auth/services/auth.service';
import { setAuthCookies } from '@/features/auth/services/jwt';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('bidhub_refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token no encontrado en cookies.' }, { status: 401 });
    }

    const { accessToken, newRefreshToken } = await authService.refresh(refreshToken);
    await setAuthCookies(accessToken, newRefreshToken);

    return NextResponse.json({ success: true, message: 'Sesión renovada correctamente.' });
  } catch (err: any) {
    const status = err.status || 401;
    return NextResponse.json({ error: err.message || 'Error al renovar sesión.' }, { status });
  }
}
