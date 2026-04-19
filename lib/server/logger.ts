type LogMeta = Record<string, unknown>

function sanitize(meta?: LogMeta): LogMeta | undefined {
  if (!meta) return undefined
  const clone = { ...meta }
  if ('message' in clone) delete clone.message
  if ('token' in clone) delete clone.token
  return clone
}

export function logInfo(event: string, meta?: LogMeta) {
  console.info(`[prometeo] ${event}`, sanitize(meta))
}

export function logWarn(event: string, meta?: LogMeta) {
  console.warn(`[prometeo] ${event}`, sanitize(meta))
}

export function logError(event: string, meta?: LogMeta) {
  console.error(`[prometeo] ${event}`, sanitize(meta))
}
