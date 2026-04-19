import { serverConfig } from '@/lib/server/config'
import { fetchWithTimeout } from '@/lib/server/http'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const HEALTH_PATHS = ['/health', '/api/health', '/']

export async function GET() {
  const startedAt = Date.now()

  for (const path of HEALTH_PATHS) {
    try {
      const res = await fetchWithTimeout(`${serverConfig.gatewayUrl}${path}`, {
        method: 'GET',
        cache: 'no-store',
        timeoutMs: 5_000,
      })

      if (!res.ok) continue

      return NextResponse.json({
        status: 'online',
        gateway: serverConfig.gatewayUrl,
        checkedPath: path,
        latencyMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      })
    } catch {
      // Try next path.
    }
  }

  return NextResponse.json(
    {
      status: 'offline',
      error: 'No se pudo conectar al Gateway de OpenClaw.',
      gateway: serverConfig.gatewayUrl,
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    },
    { status: 502 }
  )
}
