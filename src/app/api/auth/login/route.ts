import { NextResponse } from "next/server";
import { createSessionToken, safeEqual, SESSION_COOKIE, SESSION_TTL } from "@/lib/auth";
import { getAuthConfig } from "@/lib/env";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { verifyTotp } from "@/lib/totp";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000; // 5 intentos por minuto por IP
const FAIL_DELAY_MS = 600; // ralentiza la fuerza bruta

export async function POST(request: Request) {
  const { enabled, password, secret, totpSecret } = getAuthConfig();

  if (!enabled || !password || !secret) {
    return NextResponse.json(
      { error: "La autenticación no está configurada en el servidor." },
      { status: 500 }
    );
  }

  const ip = clientIp(request);
  const limit = rateLimit(`login:${ip}`, MAX_ATTEMPTS, WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Demasiados intentos. Probá de nuevo en ${limit.retryAfter}s.` },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const providedPassword = typeof body?.password === "string" ? body.password : "";
  const providedCode = typeof body?.code === "string" ? body.code : "";

  const passwordOk = providedPassword.length > 0 && safeEqual(providedPassword, password);
  const codeOk = totpSecret ? await verifyTotp(providedCode, totpSecret) : true;

  if (!passwordOk || !codeOk) {
    // Retardo constante + mensaje genérico (no revelamos cuál factor falló).
    await new Promise((resolve) => setTimeout(resolve, FAIL_DELAY_MS));
    return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
  }

  const token = await createSessionToken(secret);
  const response = NextResponse.json({ ok: true });

  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL
  });

  return response;
}
