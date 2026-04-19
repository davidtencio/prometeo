import { NextRequest, NextResponse } from 'next/server'
import { isProduction, serverConfig } from '@/lib/server/config'
import { fetchWithTimeout } from '@/lib/server/http'
import { checkRateLimit, getClientKey } from '@/lib/server/rate-limit'
import { getClientIp, getContentLength } from '@/lib/server/request'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ path: string[] }> }

const RATE_LIMIT = { limit: 60, windowMs: 60_000 } as const
const MAX_PROXY_BODY_SIZE = 1024 * 1024

function resolveCorsOrigin(req: NextRequest): string | null {
  const origin = req.headers.get('origin')
  if (!origin) return null
  if (serverConfig.allowedOrigins.length === 0) return req.nextUrl.origin
  return serverConfig.allowedOrigins.includes(origin) ? origin : null
}

function withCors(req: NextRequest, res: NextResponse): NextResponse {
  const origin = resolveCorsOrigin(req)
  if (origin) {
    res.headers.set('Access-Control-Allow-Origin', origin)
    res.headers.set('Access-Control-Allow-Credentials', 'true')
    res.headers.set('Vary', 'Origin')
  }
  return res
}

function isProxyAuthorized(req: NextRequest): boolean {
  if (!serverConfig.proxySecret) return !isProduction()
  return req.headers.get('x-proxy-secret') === serverConfig.proxySecret
}

async function proxyRequest(req: NextRequest, pathSegments: string[], method: string) {
  if (['POST', 'PUT', 'PATCH'].includes(method) && getContentLength(req) > MAX_PROXY_BODY_SIZE) {
    return withCors(req, NextResponse.json({ error: 'Payload demasiado grande.' }, { status: 413 }))
  }

  const clientKey = getClientKey(getClientIp(req))
  const rate = checkRateLimit(`proxy:${clientKey}`, RATE_LIMIT.limit, RATE_LIMIT.windowMs)
  if (!rate.allowed) {
    const retryAfter = Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000)).toString()
    const res = NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 })
    res.headers.set('Retry-After', retryAfter)
    res.headers.set('X-RateLimit-Limit', RATE_LIMIT.limit.toString())
    res.headers.set('X-RateLimit-Remaining', '0')
    return withCors(req, res)
  }

  if (!isProxyAuthorized(req)) {
    return withCors(req, NextResponse.json({ error: 'No autorizado' }, { status: 401 }))
  }

  if (pathSegments.length === 0) {
    return withCors(req, NextResponse.json({ error: 'Ruta de proxy invalida.' }, { status: 400 }))
  }

  const path = pathSegments.join('/')
  const searchParams = req.nextUrl.searchParams.toString()
  const url = `${serverConfig.gatewayUrl}/${path}${searchParams ? `?${searchParams}` : ''}`

  const headers: Record<string, string> = {}
  const reqContentType = req.headers.get('content-type')
  const reqAccept = req.headers.get('accept')
  if (reqContentType) headers['Content-Type'] = reqContentType
  if (reqAccept) headers.Accept = reqAccept
  if (serverConfig.gatewayToken) headers.Authorization = `Bearer ${serverConfig.gatewayToken}`

  const body = ['POST', 'PUT', 'PATCH'].includes(method) ? await req.text() : undefined

  try {
    const response = await fetchWithTimeout(url, {
      method,
      headers,
      body,
      cache: 'no-store',
      timeoutMs: 30_000,
    })

    const contentType = response.headers.get('content-type') || 'application/json'
    const data = await response.text()
    const nextRes = new NextResponse(data, {
      status: response.status,
      headers: { 'Content-Type': contentType, 'Cache-Control': 'no-store' },
    })
    return withCors(req, nextRes)
  } catch {
    return withCors(
      req,
      NextResponse.json(
        { error: 'No se pudo conectar al Gateway de OpenClaw', gateway: serverConfig.gatewayUrl },
        { status: 502 }
      )
    )
  }
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxyRequest(req, path, 'GET')
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxyRequest(req, path, 'POST')
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxyRequest(req, path, 'PUT')
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxyRequest(req, path, 'PATCH')
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxyRequest(req, path, 'DELETE')
}

export async function OPTIONS(req: NextRequest) {
  const res = new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-proxy-secret',
      'Cache-Control': 'no-store',
    },
  })
  return withCors(req, res)
}
