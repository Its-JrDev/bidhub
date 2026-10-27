import { NextResponse } from 'next/server';
import { authService } from '@/features/auth/services/auth.service';
import { setAuthCookies } from '@/features/auth/services/jwt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos.' },
        { status: 400 }
      );
    }

    const { user, accessToken, refreshToken } = await authService.login({
      email,
      password,
    });

    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    const status = err.status || 500;
    return NextResponse.json({ error: err.message || 'Error al iniciar sesión.' }, { status });
  }
}
