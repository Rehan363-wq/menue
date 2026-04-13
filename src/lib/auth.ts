// src/lib/auth.ts — Auth helpers for API routes

import { verifyJWT } from './jwt';
import type { JWTPayload } from './types';

export function success(data: unknown, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function error(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

export async function getAuthUser(request: Request): Promise<JWTPayload | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  return verifyJWT(token);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): boolean {
  return typeof password === 'string' && password.length >= 6;
}
