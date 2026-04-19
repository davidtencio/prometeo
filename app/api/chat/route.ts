import { NextRequest, NextResponse } from 'next/server'

const GATEWAY = process.env.OPENCLAW_GATEWAY_URL || 'http://2.24.212.81:18789'
const TOKEN = process.env.OPENCLAW_TOKEN || ''

export async function POST(req: NextRequest) {
  const { message, workspace } = await req.json()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`

  try {
    // Intenta enviar el mensaje al Gateway de OpenClaw
    // OpenClaw acepta mensajes en /api/v1/chat o similar
    const endpoints = [
      '/api/v1/chat',
      '/api/chat',
      '/chat',
    ]

    let lastError = null

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(`${GATEWAY}${endpoint}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ 
            message, 
            context: workspace,
            role: 'user'
          }),
          signal: AbortSignal.timeout(30000),
          cache: 'no-store',
        })

        if (res.ok) {
          const data = await res.json()
          return NextResponse.json({ 
            success: true, 
            response: data.response || data.message || data.text || JSON.stringify(data),
            endpoint
          })
        }
      } catch (err) {
        lastError = err
        continue
      }
    }

    // Si ningún endpoint funcionó, devuelve un error descriptivo
    return NextResponse.json({ 
      success: false,
      error: 'No se encontró el endpoint de chat en el Gateway. Verifica la versión de OpenClaw.',
      gateway: GATEWAY,
      lastError: String(lastError)
    }, { status: 502 })

  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: 'Error de conexión con el VPS',
      details: String(error)
    }, { status: 500 })
  }
}
