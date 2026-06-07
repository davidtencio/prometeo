import { describe, expect, it } from "vitest";
import { createSessionToken, safeEqual, verifySessionToken } from "./auth";

const SECRET = "test-secret-1234567890";

describe("safeEqual", () => {
  it("es true para strings iguales", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
  });

  it("es false para strings distintos del mismo largo", () => {
    expect(safeEqual("abc", "abd")).toBe(false);
  });

  it("es false para largos distintos", () => {
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});

describe("tokens de sesión", () => {
  it("verifica un token recién creado", async () => {
    const token = await createSessionToken(SECRET);
    expect(await verifySessionToken(token, SECRET)).toBe(true);
  });

  it("rechaza un token firmado con otro secreto", async () => {
    const token = await createSessionToken(SECRET);
    expect(await verifySessionToken(token, "otro-secreto")).toBe(false);
  });

  it("rechaza un token manipulado", async () => {
    const token = await createSessionToken(SECRET);
    const tampered = `${token.slice(0, -2)}${token.endsWith("a") ? "bb" : "aa"}`;
    expect(await verifySessionToken(tampered, SECRET)).toBe(false);
  });

  it("rechaza un token expirado", async () => {
    const expired = await createSessionToken(SECRET, -10);
    expect(await verifySessionToken(expired, SECRET)).toBe(false);
  });

  it("rechaza tokens vacíos o malformados", async () => {
    expect(await verifySessionToken(undefined, SECRET)).toBe(false);
    expect(await verifySessionToken("sin-punto", SECRET)).toBe(false);
  });
});
