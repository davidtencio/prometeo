import { afterEach, describe, expect, it, vi } from "vitest";
import { verifyTotp } from "./totp";

// Vector RFC 6238 (SHA-1): secreto ASCII "12345678901234567890" en base32.
const RFC_SECRET = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

afterEach(() => {
  vi.useRealTimers();
});

describe("verifyTotp", () => {
  it("valida un código conocido (RFC 6238, T=59s → 287082)", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(59 * 1000));
    expect(await verifyTotp("287082", RFC_SECRET)).toBe(true);
  });

  it("rechaza un código incorrecto", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(59 * 1000));
    expect(await verifyTotp("000000", RFC_SECRET)).toBe(false);
  });

  it("rechaza formatos inválidos", async () => {
    expect(await verifyTotp("12345", RFC_SECRET)).toBe(false);
    expect(await verifyTotp("abcdef", RFC_SECRET)).toBe(false);
    expect(await verifyTotp("", RFC_SECRET)).toBe(false);
  });
});
