import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const password = process.env.APP_PASSWORD;
  const secret = process.env.AUTH_SECRET;

  // Si la autenticación no está configurada, la app queda abierta.
  // Esto facilita el desarrollo local; en producción SIEMPRE definir
  // APP_PASSWORD y AUTH_SECRET (ver .env.example).
  if (!password || !secret) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const valid = await verifySessionToken(token, secret);

  if (!valid) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Protege todo menos la pantalla de login, las rutas de auth y los estáticos.
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)"]
};
