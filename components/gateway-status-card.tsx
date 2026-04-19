import { Activity, Loader2, Wifi, WifiOff } from 'lucide-react'
import { ActivityFeed } from './activity-feed'
import { ActivityItem, GatewayStatus } from './dashboard-types'

type GatewayStatusCardProps = {
  status: GatewayStatus
  items: ActivityItem[]
}

export function GatewayStatusCard({ status, items }: GatewayStatusCardProps) {
  return (
    <article className="rounded-2xl border border-[#1e2f53] bg-[#0b1733] p-5 text-[#d5def2] shadow-[0_20px_45px_-35px_rgba(7,18,38,1)] md:p-6">
      <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
        <h2 className="flex items-center text-sm font-semibold text-white">
          <Activity size={16} className="mr-2 text-cyan-300" /> Monitor VPS
        </h2>
        <span className="rounded bg-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100">En vivo</span>
      </div>

      <ActivityFeed items={items} />

      <div
        className={`mt-4 flex flex-wrap items-center border-t border-white/10 pt-3 text-xs ${
          status === 'online' ? 'text-[#73e6bf]' : status === 'offline' ? 'text-[#ff7f7f]' : 'text-[#f3c27b]'
        }`}
      >
        {status === 'online' && (
          <>
            <Wifi size={13} className="mr-2" /> Gateway conectado
          </>
        )}
        {status === 'offline' && (
          <>
            <WifiOff size={13} className="mr-2" /> Gateway sin conexion
          </>
        )}
        {status === 'checking' && (
          <>
            <Loader2 size={13} className="mr-2 animate-spin" /> Verificando conexion
          </>
        )}
      </div>
    </article>
  )
}
