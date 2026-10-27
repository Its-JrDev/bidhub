import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import {
  signAccessToken,
  signRefreshToken,
  hashToken,
  verifyRefreshToken,
  type TokenPayload,
} from './jwt';

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  /**
   * Register a new user with hashed password.
   */
  async register(data: RegisterDTO): Promise<AuthResponse> {
    const existing = await db.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      const error = new Error('El correo electrónico ya está registrado.');
      (error as any).status = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await db.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        name: data.name.trim(),
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken({ userId: user.id });

    // Store hashed refresh token in database
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    return { user, accessToken, refreshToken };
  },

  /**
   * Login user with credentials and issue tokens.
   */
  async login(data: LoginDTO): Promise<AuthResponse> {
    const user = await db.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (!user) {
      const error = new Error('Credenciales inválidas.');
      (error as any).status = 401;
      throw error;
    }

    const validPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!validPassword) {
      const error = new Error('Credenciales inválidas.');
      (error as any).status = 401;
      throw error;
    }

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken({ userId: user.id });

    // Store hashed refresh token
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  },

  /**
   * Refresh access token using a valid stored refresh token.
   */
  async refresh(refreshToken: string): Promise<{ accessToken: string; newRefreshToken: string }> {
    const verified = await verifyRefreshToken(refreshToken);
    if (!verified) {
      const error = new Error('Refresh token inválido o expirado.');
      (error as any).status = 401;
      throw error;
    }

    const tokenHash = hashToken(refreshToken);
    const storedToken = await db.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      const error = new Error('Refresh token revocado o expirado.');
      (error as any).status = 401;
      throw error;
    }

    // Revoke old token
    await db.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    const user = storedToken.user;
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const accessToken = await signAccessToken(payload);
    const newRefreshToken = await signRefreshToken({ userId: user.id });

    // Save new hashed refresh token
    await db.refreshToken.create({
      data: {
        tokenHash: hashToken(newRefreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, newRefreshToken };
  },

  /**
   * Logout user by revoking the refresh token in database.
   */
  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) return;
    const tokenHash = hashToken(refreshToken);
    await db.refreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    });
  },

  /**
   * Get user profile by ID.
   */
  async getProfile(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) {
      const error = new Error('Usuario no encontrado.');
      (error as any).status = 404;
      throw error;
    }
    return user;
  },
};
