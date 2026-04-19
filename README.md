# OpenClaw Dashboard — Next.js

Panel de control para interactuar con tu OpenClaw Gateway desde Vercel.

## Arquitectura

```
Tu navegador (red org) → Vercel (proxy) → VPS 2.24.212.81:18789 (OpenClaw)
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

### Opción A — Vercel CLI
```bash
npm i -g vercel
vercel deploy
```

### Opción B — GitHub + Vercel Dashboard
1. Sube este proyecto a un repositorio de GitHub
2. Ve a https://vercel.com y conecta el repositorio
3. En "Environment Variables" agrega:
   - `OPENCLAW_GATEWAY_URL` = `http://2.24.212.81:18789`
   - `OPENCLAW_TOKEN` = (tu token si lo tienes)
   - `PROXY_SECRET` = (una clave secreta aleatoria)
4. Deploy 🚀

## Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `OPENCLAW_GATEWAY_URL` | URL del Gateway | `http://2.24.212.81:18789` |
| `OPENCLAW_TOKEN` | Token de auth (opcional) | `mi_token_secreto` |
| `PROXY_SECRET` | Protege el proxy de Vercel | `clave_aleatoria_larga` |

## Rutas API

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/health` | GET | Verifica si el Gateway está online |
| `/api/chat` | POST | Envía mensajes al agente OpenClaw |
| `/api/proxy/[...path]` | GET/POST/PUT/DELETE | Proxy universal al Gateway |

## Notas de seguridad

- El `PROXY_SECRET` protege las rutas `/api/proxy/*` para que solo tu app pueda usarlas
- Nunca expongas el `OPENCLAW_TOKEN` en el frontend
- Considera agregar autenticación (NextAuth.js) si otros podrían acceder a tu URL de Vercel
