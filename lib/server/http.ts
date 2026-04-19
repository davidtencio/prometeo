export async function fetchWithTimeout(
  input: URL | RequestInfo,
  init: RequestInit & { timeoutMs?: number } = {}
) {
  const { timeoutMs = 30000, ...rest } = init
  return fetch(input, {
    ...rest,
    signal: AbortSignal.timeout(timeoutMs),
  })
}

export function sanitizeMessage(value: unknown, maxLen = 2000): string | null {
  if (typeof value !== 'string') return null
  const text = value.trim()
  if (!text) return null
  return text.slice(0, maxLen)
}
