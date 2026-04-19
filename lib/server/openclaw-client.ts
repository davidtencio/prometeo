import { serverConfig } from '@/lib/server/config'
import { fetchWithTimeout } from '@/lib/server/http'
import { logWarn } from '@/lib/server/logger'

const CHAT_ENDPOINTS = ['/api/v1/chat', '/api/chat', '/chat'] as const
const HEALTH_PATHS = ['/health', '/api/health', '/'] as const
const DEFAULT_WORKSPACE = 'workspace'

export type GatewayHealthResult =
  | { online: true; checkedPath: (typeof HEALTH_PATHS)[number]; latencyMs: number }
  | { online: false; latencyMs: number }

export type GatewayMessageResult =
  | { ok: true; endpoint: (typeof CHAT_ENDPOINTS)[number]; responseText: string }
  | { ok: false; lastError: unknown }

function gatewayHeaders(extra: Record<string, string> = {}) {
  const headers: Record<string, string> = { ...extra }
  if (serverConfig.gatewayToken) {
    headers.Authorization = `Bearer ${serverConfig.gatewayToken}`
  }
  return headers
}

export async function getGatewayHealth(): Promise<GatewayHealthResult> {
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
      logWarn('gateway.health.request_failed', { path })
    }
  }

  return {
    online: false as const,
    latencyMs: Date.now() - startedAt,
  }
}

export async function sendGatewayMessage(message: string): Promise<GatewayMessageResult> {
  let lastError: unknown = null

  for (const endpoint of CHAT_ENDPOINTS) {
    try {
      const res = await fetchWithTimeout(`${serverConfig.gatewayUrl}${endpoint}`, {
        method: 'POST',
        headers: gatewayHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ message, context: DEFAULT_WORKSPACE, role: 'user' }),
        cache: 'no-store',
        timeoutMs: 30_000,
      })

      if (!res.ok) {
        logWarn('gateway.chat.upstream_non_ok', { endpoint, status: res.status })
        continue
      }

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
      logWarn('gateway.chat.request_failed', { endpoint })
    }
  }

  return {
    ok: false as const,
    lastError,
  }
}
