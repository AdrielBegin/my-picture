// src/utils/auth/verify-token.ts
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || 'segredo-super-seguro';

// Edge-compatible: transform string secret to Uint8Array
const encoder = new TextEncoder();
const secret = encoder.encode(SECRET_KEY);

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret);
    return true;
  } catch (err) {
    console.error('Token inválido:', err);
    return false;
  }
}
