// src/lib/auth.ts — Auth helpers for API routes (Production-hardened)

import { verifyJWT } from './jwt';
import type { JWTPayload } from './types';

const COOKIE_NAME = 'menuqr_session';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export function success(data: unknown, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function error(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

/**
 * Create a success response with httpOnly auth cookie set.
 */
export function successWithCookie(data: unknown, token: string, status = 200) {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieValue = [
    `${COOKIE_NAME}=${token}`,
    `HttpOnly`,
    `Path=/`,
    `Max-Age=${COOKIE_MAX_AGE}`,
    `SameSite=Lax`,
    isProduction ? `Secure` : '',
  ].filter(Boolean).join('; ');

  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookieValue,
    },
  });
}

/**
 * Create a response that clears the auth cookie.
 */
export function clearAuthCookie() {
  const cookieValue = `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
  return new Response(JSON.stringify({ success: true, data: { message: 'Logged out' } }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookieValue,
    },
  });
}

/**
 * Extract and verify the authenticated user from the request.
 * Reads from httpOnly cookie (primary) or Authorization header (fallback).
 */
export async function getAuthUser(request: Request): Promise<JWTPayload | null> {
  // 1. Try httpOnly cookie first
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...rest] = c.trim().split('=');
      return [key, rest.join('=')];
    })
  );
  const cookieToken = cookies[COOKIE_NAME];
  if (cookieToken) {
    const user = await verifyJWT(cookieToken);
    if (user) return user;
  }

  // 2. Fallback: Authorization header (for backward compatibility during migration)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    return verifyJWT(token);
  }

  return null;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): boolean {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    /[A-Z]/.test(password) && // at least one uppercase
    /[0-9]/.test(password)   // at least one number
  );
}
