# OpenClaw Dashboard - Next.js

Panel de control para interactuar con tu OpenClaw Gateway desde Vercel.

## Arquitectura

```text
Navegador (red org) -> Next.js (Vercel) -> VPS 2.24.212.81:18789 (OpenClaw)
```

## Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Crear variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus valores

# 3. Correr en desarrollo
npm run dev
```

## Deploy en Vercel

### Opcion A - Vercel CLI

```bash
npm i -g vercel
vercel deploy
```

### Opcion B - GitHub + Vercel Dashboard

1. Sube este proyecto a un repositorio de GitHub.
2. Ve a https://vercel.com y conecta el repositorio.
3. En `Environment Variables` agrega:
   - `OPENCLAW_GATEWAY_URL` = `http://2.24.212.81:18789`
   - `OPENCLAW_TOKEN` = tu token si aplica

## Variables de entorno

| Variable | Descripcion | Ejemplo |
|---|---|---|
| `OPENCLAW_GATEWAY_URL` | URL base del Gateway | `http://2.24.212.81:18789` |
| `OPENCLAW_TOKEN` | Token de auth (opcional) | `mi_token` |

## Rutas API

| Ruta | Metodo | Descripcion |
|---|---|---|
| `/api/gateway/status` | `GET` | Endpoint canonico para estado del Gateway |
| `/api/health` | `GET` | Endpoint legado de compatibilidad (deprecated) |
| `/api/chat` | `POST` | Envia mensajes al agente OpenClaw |

## Notas de seguridad

- No expongas `OPENCLAW_TOKEN` en frontend.
- El acceso al Gateway ocurre por endpoints de producto (`/api/gateway/status`, `/api/chat`), no por proxy universal.

## Buenas practicas aplicadas

- Seguridad de cabeceras globales en `next.config.js`:
  - `Content-Security-Policy`
  - `Strict-Transport-Security`
  - `X-Frame-Options`
  - `X-Content-Type-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
- `poweredByHeader: false`.
- Rutas API declaradas como dinamicas (`dynamic = 'force-dynamic'`) y `Cache-Control: no-store`.
- Validacion de entrada para chat (`message` obligatorio, longitud maxima).
- Rate limiting en memoria para `/api/chat`.
- Limite de tamano de request:
  - `/api/chat`: 16KB
- Manejo de errores consistente y sin filtrar detalles sensibles en produccion.
- Configuracion centralizada de entorno y utilidades server compartidas (`lib/server/*`) para facilitar mantenimiento.
- Cliente interno unificado de integracion OpenClaw (`lib/server/openclaw-client.ts`).
