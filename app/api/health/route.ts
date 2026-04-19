import { serverConfig } from '@/lib/server/config'
import { getGatewayHealth } from '@/lib/server/openclaw-client'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const result = await getGatewayHealth()
  const deprecationHeaders = {
    Deprecation: 'true',
    Sunset: 'Wed, 31 Dec 2026 23:59:59 GMT',
    Link: '</api/gateway/status>; rel="successor-version"',
  }

  if (result.online) {
    return NextResponse.json(
      {
        status: 'online',
        gateway: serverConfig.gatewayUrl,
        checkedPath: result.checkedPath,
        latencyMs: result.latencyMs,
        timestamp: new Date().toISOString(),
      },
      { headers: deprecationHeaders }
    )
  }

  return NextResponse.json(
    {
      status: 'offline',
      error: 'No se pudo conectar al Gateway de OpenClaw.',
      gateway: serverConfig.gatewayUrl,
      latencyMs: result.latencyMs,
      timestamp: new Date().toISOString(),
    },
    { status: 502, headers: deprecationHeaders }
  )
}
