'use client'

import { useEffect, useState } from 'react'
import { GatewayStatus } from '@/components/dashboard-types'

export function useGatewayStatus(pollMs = 30000) {
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus>('checking')

  const checkGateway = async () => {
    setGatewayStatus('checking')
    try {
      const res = await fetch('/api/gateway/status', { cache: 'no-store' })
      const data = await res.json()
      setGatewayStatus(data.status === 'online' ? 'online' : 'offline')
    } catch {
      setGatewayStatus('offline')
    }
  }

  useEffect(() => {
    const runHealthCheck = () => {
      void checkGateway()
    }
    const initial = setTimeout(runHealthCheck, 0)
    const interval = setInterval(runHealthCheck, pollMs)
    return () => {
      clearTimeout(initial)
      clearInterval(interval)
    }
  }, [pollMs])

  return { gatewayStatus, checkGateway }
}
