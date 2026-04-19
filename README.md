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
   - `PROXY_SECRET` = una clave secreta aleatoria
   - `PROXY_ALLOWED_ORIGINS` = lista de origenes permitidos separada por comas (opcional)

## Variables de entorno

| Variable | Descripcion | Ejemplo |
|---|---|---|
| `OPENCLAW_GATEWAY_URL` | URL base del Gateway | `http://2.24.212.81:18789` |
| `OPENCLAW_TOKEN` | Token de auth (opcional) | `mi_token` |
| `PROXY_SECRET` | Protege `/api/proxy/*` | `clave_larga_aleatoria` |
| `PROXY_ALLOWED_ORIGINS` | Origenes CORS permitidos (opcional) | `https://mi-app.vercel.app` |

## Rutas API

| Ruta | Metodo | Descripcion |
|---|---|---|
| `/api/health` | `GET` | Verifica conectividad del Gateway |
| `/api/chat` | `POST` | Envia mensajes al agente OpenClaw |
| `/api/proxy/[...path]` | `GET/POST/PUT/PATCH/DELETE/OPTIONS` | Proxy universal al Gateway |

## Notas de seguridad

- No expongas `OPENCLAW_TOKEN` en frontend.
- En produccion, define `PROXY_SECRET` para bloquear uso anonimo del proxy.
- Si usaras llamadas cross-origin, define `PROXY_ALLOWED_ORIGINS` de forma explicita.

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
- Rate limiting en memoria para `/api/chat` y `/api/proxy/*`.
- Limite de tamano de request:
  - `/api/chat`: 16KB
  - `/api/proxy/*` (POST/PUT/PATCH): 1MB
- Manejo de errores consistente y sin filtrar detalles sensibles en produccion.
- Configuracion centralizada de entorno y utilidades server compartidas (`lib/server/*`) para facilitar mantenimiento.
