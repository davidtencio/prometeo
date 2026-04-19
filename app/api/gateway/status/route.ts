import { NextResponse } from 'next/server'
import { getGatewayHealth } from '@/lib/server/openclaw-client'
import { logWarn } from '@/lib/server/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const result = await getGatewayHealth()
  if (result.online) {
    return NextResponse.json({
      status: 'online',
      checkedPath: result.checkedPath,
      latencyMs: result.latencyMs,
      timestamp: new Date().toISOString(),
    })
  }

  logWarn('api.gateway.status.offline', { latencyMs: result.latencyMs })

  return NextResponse.json(
    {
      status: 'offline',
      error: 'No se pudo conectar al Gateway de OpenClaw.',
      latencyMs: result.latencyMs,
      timestamp: new Date().toISOString(),
    },
    { status: 502 }
  )
}
