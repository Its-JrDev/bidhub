import { NextResponse } from 'next/server';
import { authService } from '@/features/auth/services/auth.service';
import { setAuthCookies } from '@/features/auth/services/jwt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Todos los campos (email, contraseña, nombre) son requeridos.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const { user, accessToken, refreshToken } = await authService.register({
      email,
      password,
      name,
    });

    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (err: any) {
    const status = err.status || 500;
    return NextResponse.json({ error: err.message || 'Error al registrar usuario.' }, { status });
  }
}
