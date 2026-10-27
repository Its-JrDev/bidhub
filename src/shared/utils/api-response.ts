import { NextResponse } from 'next/server';

export interface ApiSuccessResponse<T> {
  success: true;
  data?: T;
  [key: string]: any;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: any;
}

/**
 * Standard successful JSON response helper.
 */
export function apiSuccess<T>(data: T, status = 200): NextResponse {
  if (typeof data === 'object' && data !== null && !Array.isArray(data) && !('success' in (data as object))) {
    return NextResponse.json({ success: true, ...data }, { status });
  }
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Standard error JSON response helper with proper HTTP status.
 */
export function apiError(message: string, status = 500, details?: any): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details !== undefined && { details }),
    },
    { status }
  );
}

/**
 * Catch-all route handler error parser.
 */
export function handleRouteError(err: any): NextResponse {
  const status = typeof err?.status === 'number' ? err.status : 500;
  const message = err?.message || 'Error interno del servidor.';
  return apiError(message, status);
}
