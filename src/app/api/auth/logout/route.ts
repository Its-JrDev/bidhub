import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authService } from '@/features/auth/services/auth.service';
import { clearAuthCookies } from '@/features/auth/services/jwt';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('bidhub_refresh_token')?.value;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    await clearAuthCookies();
    return NextResponse.json({ success: true, message: 'Sesión cerrada exitosamente.' });
  } catch (err: any) {
    await clearAuthCookies();
    return NextResponse.json({ success: true });
  }
}
