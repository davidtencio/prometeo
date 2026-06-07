/**
 * Lectura y validación de las variables de entorno de autenticación.
 */

export type AuthConfig = {
  /** true solo si APP_PASSWORD y AUTH_SECRET están configurados. */
  enabled: boolean;
  password?: string;
  secret?: string;
  totpSecret?: string;
};

export function getAuthConfig(): AuthConfig {
  const password = process.env.APP_PASSWORD;
  const secret = process.env.AUTH_SECRET;
  const totpSecret = process.env.TOTP_SECRET;
  const enabled = Boolean(password && secret);

  if (process.env.NODE_ENV === "production" && !enabled) {
    console.error(
      "[auth] APP_PASSWORD/AUTH_SECRET no configurados: la app está ABIERTA en producción."
    );
  }
  if (secret && secret.length < 16) {
    console.warn(
      "[auth] AUTH_SECRET es demasiado corto; usá al menos 32 caracteres aleatorios."
    );
  }

  return { enabled, password, secret, totpSecret };
}

export function isTwoFactorEnabled(): boolean {
  return Boolean(process.env.TOTP_SECRET);
}
