import { NextResponse } from 'next/server'
import { serverConfig } from '@/lib/server/config'
import { getGatewayHealth } from '@/lib/server/openclaw-client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const result = await getGatewayHealth()
  if (result.online) {
    return NextResponse.json({
      status: 'online',
      gateway: serverConfig.gatewayUrl,
      checkedPath: result.checkedPath,
      latencyMs: result.latencyMs,
      timestamp: new Date().toISOString(),
    })
  }

  return NextResponse.json(
    {
      status: 'offline',
      error: 'No se pudo conectar al Gateway de OpenClaw.',
      gateway: serverConfig.gatewayUrl,
      latencyMs: result.latencyMs,
      timestamp: new Date().toISOString(),
    },
    { status: 502 }
  )
}
