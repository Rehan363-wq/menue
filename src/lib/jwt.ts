// src/lib/jwt.ts — JWT signing & verification using Web Crypto (HMAC-SHA256)

import type { JWTPayload } from './types';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("FATAL: JWT_SECRET environment variable is not set. Set it in .env.local");

function base64UrlEncode(input: Uint8Array | ArrayBuffer): string {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlDecode(str: string): Uint8Array<ArrayBuffer> {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes as Uint8Array<ArrayBuffer>;
}

async function getKey(usage: 'sign' | 'verify'): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(JWT_SECRET) as Uint8Array<ArrayBuffer>,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage]
  );
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  const encoder = new TextEncoder();
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const data = `${encodedHeader}.${encodedPayload}`;

  const key = await getKey('sign');
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data) as Uint8Array<ArrayBuffer>);
  return `${data}.${base64UrlEncode(sig)}`;
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;

  try {
    const key = await getKey('verify');
    const sigBytes = base64UrlDecode(signature);
    const dataBytes = new TextEncoder().encode(data) as Uint8Array<ArrayBuffer>;
    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, dataBytes);
    if (!isValid) return null;

    const payloadBytes = base64UrlDecode(encodedPayload);
    const payloadStr = new TextDecoder().decode(payloadBytes);
    const parsed: JWTPayload = JSON.parse(payloadStr);

    if (parsed.exp && Math.floor(Date.now() / 1000) > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}
