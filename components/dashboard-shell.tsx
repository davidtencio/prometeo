'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Bell, Bot, CheckCircle2, RefreshCw, Search, ShieldCheck } from 'lucide-react'
import { Sidebar } from './sidebar'
import { ChatPanel } from './chat-panel'
import { GatewayStatusCard } from './gateway-status-card'
import { PendingTasks } from './pending-tasks'
import { ActivityItem, ChatMessage, GatewayStatus } from './dashboard-types'

const activityFeed: ActivityItem[] = [
  { id: 1, time: '09:58', text: 'Analizando reporte mensual SAP ERP', status: 'loading' },
  { id: 2, time: '08:30', text: 'Extraccion de datos SICOP completada', status: 'success' },
  { id: 3, time: '06:15', text: 'Alerta: discrepancia en stock de reactivos', status: 'warning' },
]

const initialChatMessages: ChatMessage[] = [
  {
    role: 'assistant',
    text: 'Hola, Dr. Tencio. Conectando con el Gateway de OpenClaw...',
    timestamp: new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
  },
]

export function DashboardShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
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
    const interval = setInterval(runHealthCheck, 30000)
    return () => {
      clearTimeout(initial)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="min-h-screen p-2 sm:p-3 md:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-1rem)] max-w-[1500px] overflow-hidden rounded-2xl border border-[#d8e0f2] bg-white/80 shadow-[0_20px_60px_-28px_rgba(19,35,74,0.45)] backdrop-blur md:min-h-[calc(100vh-2rem)] md:rounded-[28px]">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((prev) => !prev)} />

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d8e0f2] px-3 py-3 sm:px-4 md:px-6 md:py-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#4b5f81]">Panel operativo</p>
              <h1 className="text-xl font-semibold text-[#071226] md:text-2xl">Centro de mando OpenClaw</h1>
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
              <div className="relative hidden sm:block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7b8dab]" />
                <input
                  type="text"
                  placeholder="Buscar documentos u oficios"
                  className="w-64 rounded-xl border border-[#d8e0f2] bg-white px-10 py-2.5 text-sm outline-none transition focus:border-[#2058ff]"
                />
              </div>
              <button className="relative rounded-xl border border-[#d8e0f2] bg-white p-2.5 text-[#4b5f81] transition hover:border-[#b8c5df] hover:text-[#071226]">
                <Bell size={16} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#f34343]" />
              </button>
              <button
                onClick={checkGateway}
                className="rounded-xl border border-[#d8e0f2] bg-white p-2.5 text-[#4b5f81] transition hover:border-[#b8c5df] hover:text-[#071226]"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            <div className="relative w-full sm:hidden">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7b8dab]" />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full rounded-xl border border-[#d8e0f2] bg-white px-10 py-2.5 text-sm outline-none transition focus:border-[#2058ff]"
              />
            </div>
          </header>

          <nav className="flex items-center gap-1.5 overflow-x-auto border-b border-[#d8e0f2] bg-[#f9fbff] px-3 py-2 text-xs text-[#3f5375] lg:hidden">
            <a href="#" className="whitespace-nowrap rounded-lg border border-[#d8e0f2] bg-white px-2.5 py-1.5 font-medium text-[#182845]">
              Dashboard
            </a>
            <a href="#" className="whitespace-nowrap rounded-lg border border-transparent px-2.5 py-1.5">Terminal IA</a>
            <a href="#" className="whitespace-nowrap rounded-lg border border-transparent px-2.5 py-1.5">Boveda</a>
            <a href="#" className="whitespace-nowrap rounded-lg border border-transparent px-2.5 py-1.5">Configuracion</a>
          </nav>

          <section className="grid min-h-0 flex-1 gap-4 p-3 sm:p-4 md:grid-cols-[1.1fr_0.9fr] md:gap-6 md:p-6">
            <div className="min-h-0 space-y-4 md:space-y-6">
              <article className="overflow-hidden rounded-2xl border border-[#d8e0f2] bg-gradient-to-br from-[#ffffff] via-[#f2f6ff] to-[#eef4ff] p-5 shadow-sm md:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="flex items-center text-lg font-semibold text-[#071226]">
                    <Bot size={19} className="mr-2 text-[#2058ff]" /> Resumen matutino
                  </h2>
                  <span className="rounded-full border border-[#c6d3ef] bg-white/80 px-2.5 py-1 text-xs text-[#3f5375]">Modo workspace</span>
                </div>
                <p className="max-w-3xl leading-relaxed text-[#334362]">
                  Dr. Tencio, el inventario de farmacia reporta 2 discrepancias detectadas en la madrugada. Hay un borrador de
                  justificacion listo para revision y un mensaje nuevo del proveedor en SICOP.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-lg border border-[#c6d3ef] bg-white px-2.5 py-1 text-xs text-[#3f5375]">LGCP</span>
                  <span className="rounded-lg border border-[#c6d3ef] bg-white px-2.5 py-1 text-xs text-[#3f5375]">SICOP</span>
                  <span className="rounded-lg border border-[#c6d3ef] bg-white px-2.5 py-1 text-xs text-[#3f5375]">SAP ERP</span>
                </div>
              </article>

              <PendingTasks />

              <article className="rounded-2xl border border-[#d8e0f2] bg-white p-5 shadow-sm md:p-6">
                <h2 className="mb-4 flex items-center text-lg font-semibold text-[#071226]">
                  <ShieldCheck size={19} className="mr-2 text-[#2058ff]" /> Estado de seguridad
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#d8e0f2] bg-[#f9fbff] p-3">
                    <p className="text-xs uppercase tracking-wide text-[#5d7091]">Gateway</p>
                    <p className="mt-1 text-sm font-semibold text-[#182845]">
                      {gatewayStatus === 'online' ? 'Conectado' : gatewayStatus === 'offline' ? 'Sin conexion' : 'Verificando'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#d8e0f2] bg-[#f9fbff] p-3">
                    <p className="text-xs uppercase tracking-wide text-[#5d7091]">Contexto</p>
                    <p className="mt-1 text-sm font-semibold text-[#182845]">Workspace unico</p>
                  </div>
                </div>
              </article>
            </div>

            <div className="min-h-0 space-y-4 md:space-y-6">
              <GatewayStatusCard status={gatewayStatus} items={activityFeed} />
              <ChatPanel initialMessages={initialChatMessages} />
            </div>
          </section>

          <footer className="flex flex-col items-start gap-1.5 border-t border-[#d8e0f2] px-3 py-3 text-xs text-[#5d7091] sm:flex-row sm:items-center sm:justify-between sm:px-4 md:px-6">
            <div className="flex items-center gap-2">
              {gatewayStatus === 'online' ? <CheckCircle2 size={14} className="text-[#10976f]" /> : <AlertTriangle size={14} className="text-[#c9861b]" />}
              Estado del sistema supervisado cada 30 segundos
            </div>
            <span className="font-mono-ui">OpenClaw Dashboard</span>
          </footer>
        </main>
      </div>
    </div>
  )
}
