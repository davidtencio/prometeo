function getRequiredEnv(name: string, fallback?: string): string {
  const value = process.env[name] || fallback
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const serverConfig = {
  gatewayUrl: getRequiredEnv('OPENCLAW_GATEWAY_URL', 'http://2.24.212.81:18789'),
  gatewayToken: process.env.OPENCLAW_TOKEN || '',
  proxySecret: process.env.PROXY_SECRET || '',
  allowedOrigins: (process.env.PROXY_ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
  nodeEnv: process.env.NODE_ENV || 'development',
} as const

export function isProduction(): boolean {
  return serverConfig.nodeEnv === 'production'
}
