# OpenClaw Web App

Interfaz web (Next.js + TypeScript + Tailwind CSS) para conversar con un agente
**OpenClaw** sin depender de Telegram/WhatsApp.

## Arquitectura prevista

```
   TRABAJO (filtro web)          NUBE (Vercel)              CASA (mini PC)
  Navegador  ──── 443 ────►  Web app + /api/chat  ────►  OpenClaw + cloudflared
                              (proxy con token)          (túnel saliente)
```

- La cara (web app) y la ruta `/api/chat` se despliegan en **Vercel** (pasa el
  cortafuegos corporativo donde `*.pages.dev` no pasa).
- `/api/chat` actúa como **proxy seguro**: el token de OpenClaw vive en el
  servidor y nunca llega al navegador.
- OpenClaw correrá en una **mini PC** en casa, expuesta por un túnel (p. ej.
  Cloudflare Tunnel). Solo Vercel la alcanza; el navegador del trabajo nunca ve
  ese dominio.

Mientras no exista OpenClaw, `/api/chat` devuelve una **respuesta simulada**, así
la cara es totalmente funcional.

## Requisitos

- Node.js 20 o superior.
- npm.

## Desarrollo

```bash
npm install
cp .env.example .env.local   # opcional, ver variables abajo
npm run dev
```

Abrir http://localhost:3000

> Sin `APP_PASSWORD`/`AUTH_SECRET` definidos, la app queda **abierta** (cómodo
> para desarrollo). Defínelas para probar el login localmente.

## Variables de entorno

| Variable           | Descripción                                                            |
| ------------------ | --------------------------------------------------------------------- |
| `OPENCLAW_API_URL` | Endpoint de OpenClaw. Vacío = modo simulado.                          |
| `OPENCLAW_API_KEY` | Token enviado como `Authorization: Bearer ...` hacia OpenClaw.        |
| `APP_PASSWORD`     | Contraseña de acceso a la web app.                                    |
| `AUTH_SECRET`      | Secreto para firmar la cookie de sesión (largo y aleatorio).          |

Generar `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Seguridad incluida

- **Login** con cookie de sesión `HttpOnly` + `Secure` (prod) + `SameSite=Lax`,
  firmada con HMAC-SHA256. Middleware protege todas las rutas excepto `/login`.
- **Cabeceras de seguridad** (HSTS, CSP, `X-Frame-Options`, `nosniff`,
  `Referrer-Policy`, `Permissions-Policy`) en `next.config.mjs`.
- **HTTPS** automático en Vercel; el token de OpenClaw nunca se expone al cliente.

Pendiente al conectar la mini PC: proteger el túnel (token / Cloudflare Access) y
cifrar el disco de la mini PC.

## Despliegue en Vercel

1. Subir el repo a GitHub e importarlo en [vercel.com](https://vercel.com).
2. Vercel detecta Next.js automáticamente (sin configuración).
3. En **Project Settings → Environment Variables**, definir al menos
   `APP_PASSWORD` y `AUTH_SECRET` (y luego `OPENCLAW_API_URL`/`OPENCLAW_API_KEY`
   cuando la mini PC esté lista).
4. Deploy.

## Conexión futura con OpenClaw

Cuando la mini PC esté lista, definir `OPENCLAW_API_URL` (URL del túnel) y
`OPENCLAW_API_KEY` en Vercel. La ruta [`/api/chat`](src/app/api/chat/route.ts) ya
hace el proxy; no hay que tocar el frontend.
