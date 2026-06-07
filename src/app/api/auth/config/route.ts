import { NextResponse } from "next/server";
import { isTwoFactorEnabled } from "@/lib/env";

// Indica al login si debe pedir el código 2FA. No expone secretos.
export async function GET() {
  return NextResponse.json({ twoFactor: isTwoFactorEnabled() });
}
