import { serverConfig } from '@/lib/server/config'
import { fetchWithTimeout } from '@/lib/server/http'

const CHAT_ENDPOINTS = ['/api/v1/chat', '/api/chat', '/chat'] as const
const HEALTH_PATHS = ['/health', '/api/health', '/'] as const

function gatewayHeaders(extra: Record<string, string> = {}) {
  const headers: Record<string, string> = { ...extra }
  if (serverConfig.gatewayToken) {
    headers.Authorization = `Bearer ${serverConfig.gatewayToken}`
  }
  return headers
}

export async function getGatewayHealth() {
  const startedAt = Date.now()

  for (const path of HEALTH_PATHS) {
    try {
      const res = await fetchWithTimeout(`${serverConfig.gatewayUrl}${path}`, {
        method: 'GET',
        headers: gatewayHeaders(),
        cache: 'no-store',
        timeoutMs: 5_000,
      })

      if (!res.ok) continue

      return {
        online: true as const,
        checkedPath: path,
        latencyMs: Date.now() - startedAt,
      }
    } catch {
      // Try next path.
    }
  }

  return {
    online: false as const,
    latencyMs: Date.now() - startedAt,
  }
}

export async function sendGatewayMessage(message: string, workspace: string) {
  let lastError: unknown = null

  for (const endpoint of CHAT_ENDPOINTS) {
    try {
      const res = await fetchWithTimeout(`${serverConfig.gatewayUrl}${endpoint}`, {
        method: 'POST',
        headers: gatewayHeaders({ 'Content-Type': 'application/json' }),
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

      return {
        ok: true as const,
        endpoint,
        responseText,
      }
    } catch (error) {
      lastError = error
    }
  }

  return {
    ok: false as const,
    lastError,
  }
}

export async function callGateway(params: {
  method: string
  path: string
  searchParams?: string
  body?: string
  contentType?: string
  accept?: string
}) {
  const { method, path, searchParams, body, contentType, accept } = params
  const url = `${serverConfig.gatewayUrl}/${path}${searchParams ? `?${searchParams}` : ''}`

  const headers: Record<string, string> = gatewayHeaders()
  if (contentType) headers['Content-Type'] = contentType
  if (accept) headers.Accept = accept

  const response = await fetchWithTimeout(url, {
    method,
    headers,
    body,
    cache: 'no-store',
    timeoutMs: 30_000,
  })

  return response
}
