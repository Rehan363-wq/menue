// src/lib/hash.ts — Password hashing using Web Crypto (PBKDF2)

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map(x => ('00' + x.toString(16)).slice(-2)).join('');
}

function hexToUint8Array(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes as Uint8Array<ArrayBuffer>;
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const saltArr = crypto.getRandomValues(new Uint8Array(16));
  const salt = saltArr.buffer as ArrayBuffer;

  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']
  );

  const hashBuffer = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );

  return `v1:100000:${bufferToHex(salt)}:${bufferToHex(hashBuffer)}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [version, iterStr, saltHex, hashHex] = storedHash.split(':');
  if (version !== 'v1') return false;

  const iterations = parseInt(iterStr, 10);
  const saltBytes = hexToUint8Array(saltHex);
  const salt = saltBytes.buffer as ArrayBuffer;
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']
  );

  const hashBuffer = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial, 256
  );

  return bufferToHex(hashBuffer) === hashHex;
}
