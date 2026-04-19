import { NextRequest } from 'next/server'
import { serverConfig } from '@/lib/server/config'
import { fetchWithTimeout, sanitizeMessage } from '@/lib/server/http'
import { checkRateLimit, getClientKey } from '@/lib/server/rate-limit'
import { jsonError, jsonSuccess } from '@/lib/server/response'
import { getClientIp, getContentLength } from '@/lib/server/request'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CHAT_ENDPOINTS = ['/api/v1/chat', '/api/chat', '/chat']
const MAX_MESSAGE_LENGTH = 2000
const MAX_REQUEST_SIZE = 16 * 1024
const RATE_LIMIT = { limit: 20, windowMs: 60_000 } as const

export async function POST(req: NextRequest) {
  if (getContentLength(req) > MAX_REQUEST_SIZE) {
    return jsonError('Request demasiado grande.', 413)
  }

  const clientKey = getClientKey(getClientIp(req))
  const rate = checkRateLimit(`chat:${clientKey}`, RATE_LIMIT.limit, RATE_LIMIT.windowMs)
  if (!rate.allowed) {
    const retryAfter = Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000)).toString()
    const res = jsonError('Demasiadas solicitudes. Intenta de nuevo en unos segundos.', 429)
    res.headers.set('Retry-After', retryAfter)
    res.headers.set('X-RateLimit-Limit', RATE_LIMIT.limit.toString())
    res.headers.set('X-RateLimit-Remaining', '0')
    return res
  }

  let payload: { message?: unknown; workspace?: unknown }
  try {
    payload = await req.json()
  } catch {
    return jsonError('Body invalido. Debe ser JSON.', 400)
  }

  const message = sanitizeMessage(payload.message, MAX_MESSAGE_LENGTH)
  if (!message) {
    return jsonError('El mensaje es obligatorio.', 400)
  }

  const workspace = typeof payload.workspace === 'string' && payload.workspace.trim()
    ? payload.workspace.trim()
    : 'workspace'

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (serverConfig.gatewayToken) headers.Authorization = `Bearer ${serverConfig.gatewayToken}`

  let lastError: unknown = null
  for (const endpoint of CHAT_ENDPOINTS) {
    try {
      const res = await fetchWithTimeout(`${serverConfig.gatewayUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message, context: workspace, role: 'user' }),
        cache: 'no-store',
        timeoutMs: 30_000,
      })

      if (!res.ok) continue

      const raw = await res.text()
      let data: Record<string, unknown> = {}
      try {
        data = JSON.parse(raw)
      } catch {
        data = { text: raw }
      }

      const responseText =
        (typeof data.response === 'string' && data.response) ||
        (typeof data.message === 'string' && data.message) ||
        (typeof data.text === 'string' && data.text) ||
        raw

      return jsonSuccess({ response: responseText, endpoint })
    } catch (error) {
      lastError = error
    }
  }

  return jsonError(
    'No se encontro un endpoint de chat compatible en el Gateway.',
    502,
    process.env.NODE_ENV === 'production' ? undefined : String(lastError)
  )
}
