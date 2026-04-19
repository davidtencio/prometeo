import { NextResponse } from 'next/server'

const GATEWAY = process.env.OPENCLAW_GATEWAY_URL || 'http://2.24.212.81:18789'

export async function GET() {
  try {
    const res = await fetch(`${GATEWAY}/`, {
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    })
    
    if (res.ok) {
      return NextResponse.json({ 
        status: 'online', 
        gateway: GATEWAY,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({ 
        status: 'error', 
        code: res.status 
      }, { status: 502 })
    }
  } catch (error) {
    return NextResponse.json({ 
      status: 'offline',
      error: 'No se pudo conectar al Gateway de OpenClaw'
    }, { status: 502 })
  }
}
