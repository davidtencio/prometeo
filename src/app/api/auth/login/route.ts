import { NextResponse } from "next/server";
import {
  createSessionToken,
  safeEqual,
  SESSION_COOKIE,
  SESSION_TTL
} from "@/lib/auth";

export async function POST(request: Request) {
  const password = process.env.APP_PASSWORD;
  const secret = process.env.AUTH_SECRET;

  if (!password || !secret) {
    return NextResponse.json(
      { error: "La autenticación no está configurada en el servidor." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const provided = typeof body?.password === "string" ? body.password : "";

  if (!provided || !safeEqual(provided, password)) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
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
