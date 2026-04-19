import { NextRequest } from 'next/server'
import { sanitizeMessage } from '@/lib/server/http'
import { checkRateLimit, getClientKey } from '@/lib/server/rate-limit'
import { jsonError, jsonSuccess } from '@/lib/server/response'
import { getClientIp, getContentLength } from '@/lib/server/request'
import { sendGatewayMessage } from '@/lib/server/openclaw-client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_MESSAGE_LENGTH = 2000
const MAX_REQUEST_SIZE = 16 * 1024
const RATE_LIMIT = { limit: 20, windowMs: 60_000 } as const
const WORKSPACE_CONTEXT = 'workspace'

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

  let payload: { message?: unknown }
  try {
    payload = await req.json()
  } catch {
    return jsonError('Body invalido. Debe ser JSON.', 400)
  }

  const message = sanitizeMessage(payload.message, MAX_MESSAGE_LENGTH)
  if (!message) {
    return jsonError('El mensaje es obligatorio.', 400)
  }

  const result = await sendGatewayMessage(message, WORKSPACE_CONTEXT)
  if (result.ok) {
    return jsonSuccess({ response: result.responseText, endpoint: result.endpoint })
  }

  return jsonError(
    'No se encontro un endpoint de chat compatible en el Gateway.',
    502,
    process.env.NODE_ENV === 'production' ? undefined : String(result.lastError)
  )
}
