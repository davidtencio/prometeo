/**
 * Sesión mínima sin dependencias, firmada con HMAC-SHA256 (Web Crypto).
 * Funciona tanto en el runtime de Node (rutas API) como en el Edge (middleware).
 *
 * El token tiene la forma `<expiración>.<firma>`, donde la firma evita que
 * alguien falsifique la cookie sin conocer AUTH_SECRET.
 */

export const SESSION_COOKIE = "session";
export const SESSION_TTL = 60 * 60 * 24 * 7; // 7 días en segundos

const encoder = new TextEncoder();

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toBase64Url(signature);
}

/** Comparación en tiempo constante para evitar ataques de temporización. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function createSessionToken(
  secret: string,
  ttlSeconds: number = SESSION_TTL
): Promise<string> {
  const payload = String(Date.now() + ttlSeconds * 1000);
  const signature = await sign(secret, payload);
  return `${payload}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string
): Promise<boolean> {
  if (!token) return false;

  const separator = token.indexOf(".");
  if (separator < 0) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const expected = await sign(secret, payload);
  return safeEqual(expected, signature);
}
