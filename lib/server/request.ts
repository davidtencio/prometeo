import { NextRequest } from 'next/server'

const FALLBACK_IP = 'anonymous'

export function getClientIp(req: NextRequest): string {
  const xForwardedFor = req.headers.get('x-forwarded-for')
  if (xForwardedFor) {
    const first = xForwardedFor.split(',')[0]?.trim()
    if (first) return first
  }

  const xRealIp = req.headers.get('x-real-ip')?.trim()
  if (xRealIp) return xRealIp

  return FALLBACK_IP
}

export function getContentLength(req: NextRequest): number {
  const raw = req.headers.get('content-length')
  if (!raw) return 0
  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  return parsed
}
