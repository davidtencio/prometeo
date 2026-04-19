function getGatewayUrl(): string {
  const explicit = process.env.OPENCLAW_GATEWAY_URL?.trim()
  const isProduction = process.env.NODE_ENV === 'production'
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'
  const devFallback = 'http://127.0.0.1:18789'

  if (explicit) return explicit
  if (!isProduction || isBuildPhase) return devFallback

  throw new Error('Missing required environment variable: OPENCLAW_GATEWAY_URL')
}

export const serverConfig = {
  gatewayUrl: getGatewayUrl(),
  gatewayToken: process.env.OPENCLAW_TOKEN || '',
  nodeEnv: process.env.NODE_ENV || 'development',
} as const
