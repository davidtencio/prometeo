import { NextRequest, NextResponse } from 'next/server'

const GATEWAY = process.env.OPENCLAW_GATEWAY_URL || 'http://2.24.212.81:18789'
const TOKEN = process.env.OPENCLAW_TOKEN || ''
const SECRET = process.env.PROXY_SECRET || ''

async function proxyRequest(req: NextRequest, pathSegments: string[], method: string) {
  // Verificar secret si está configurado
  if (SECRET) {
    const clientSecret = req.headers.get('x-proxy-secret')
    if (clientSecret !== SECRET) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
  }

  const path = pathSegments.join('/')
  const searchParams = req.nextUrl.searchParams.toString()
  const url = `${GATEWAY}/${path}${searchParams ? `?${searchParams}` : ''}`

  const headers: Record<string, string> = {
    'Content-Type': req.headers.get('content-type') || 'application/json',
  }

  if (TOKEN) {
    headers['Authorization'] = `Bearer ${TOKEN}`
  }

  const body = ['POST', 'PUT', 'PATCH'].includes(method) ? await req.text() : undefined

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
      signal: AbortSignal.timeout(30000),
      cache: 'no-store',
    })

    const contentType = response.headers.get('content-type') || 'application/json'
    const data = await response.text()

    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'No se pudo conectar al Gateway de OpenClaw', gateway: GATEWAY },
      { status: 502 }
    )
  }
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(req, params.path, 'GET')
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(req, params.path, 'POST')
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(req, params.path, 'PUT')
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(req, params.path, 'DELETE')
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-proxy-secret',
    },
  })
}
