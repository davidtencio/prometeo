'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Bell,
  Bot,
  CheckCircle2,
  FileText,
  FolderLock,
  LayoutDashboard,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  TerminalSquare,
  Wifi,
  WifiOff,
} from 'lucide-react'

type GatewayStatus = 'checking' | 'online' | 'offline'

interface ChatMessage {
  role: 'user' | 'assistant' | 'error'
  text: string
  timestamp: string
}

interface ActivityItem {
  id: number
  time: string
  text: string
  status: 'loading' | 'success' | 'warning'
}

const activityFeed: ActivityItem[] = [
  { id: 1, time: '09:58', text: 'Analizando reporte mensual SAP ERP', status: 'loading' },
  { id: 2, time: '08:30', text: 'Extraccion de datos SICOP completada', status: 'success' },
  { id: 3, time: '06:15', text: 'Alerta: discrepancia en stock de reactivos', status: 'warning' },
]

const pendingTasks = [
  {
    id: 1,
    title: 'Validar borrador de compra',
    desc: 'Equipos de monitoreo esteril (Art. 14 LGCP)',
    icon: <FileText size={17} className="text-blue-600" />,
  },
  {
    id: 2,
    title: 'Revisar alerta de stock',
    desc: 'Reactivos de laboratorio por debajo del 10%',
    icon: <AlertTriangle size={17} className="text-amber-600" />,
  },
]

export default function Dashboard() {
  const [inputText, setInputText] = useState('')
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus>('checking')
  const [isSending, setIsSending] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Hola, Dr. Tencio. Conectando con el Gateway de OpenClaw...',
      timestamp: new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  const checkGateway = async () => {
    setGatewayStatus('checking')
    try {
      const res = await fetch('/api/health', { cache: 'no-store' })
      const data = await res.json()

      if (data.status === 'online') {
        setGatewayStatus('online')
        setChatMessages((prev) => {
          if (prev.length === 1 && prev[0].text.includes('Conectando')) {
            return [
              {
                role: 'assistant',
                text: 'Gateway en linea. Sistema operativo y listo para ejecutar tareas.',
                timestamp: new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
              },
            ]
          }
          return prev
        })
        return
      }

      setGatewayStatus('offline')
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || isSending) return

    const userMsg: ChatMessage = {
      role: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
    }

    setChatMessages((prev) => [...prev, userMsg])
    setInputText('')
    setIsSending(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText, workspace: 'workspace' }),
      })

      const data = await res.json()

      const assistantMsg: ChatMessage = {
        role: data.success ? 'assistant' : 'error',
        text: data.success ? data.response : `${data.error || 'Error al comunicarse con OpenClaw'}`,
        timestamp: new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
      }

      setChatMessages((prev) => [...prev, assistantMsg])
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'error',
          text: 'Error de red al contactar el servidor.',
          timestamp: new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen p-2 sm:p-3 md:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-1rem)] max-w-[1500px] overflow-hidden rounded-2xl border border-[#d8e0f2] bg-white/80 shadow-[0_20px_60px_-28px_rgba(19,35,74,0.45)] backdrop-blur md:min-h-[calc(100vh-2rem)] md:rounded-[28px]">
        <aside className="hidden w-72 shrink-0 border-r border-[#d8e0f2] bg-gradient-to-b from-[#0b1733] to-[#0c2149] p-5 text-white lg:flex lg:flex-col">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-blue-100/70">OpenClaw Node</p>
            <p className="mt-1 text-lg font-semibold">Workspace</p>
            <p className="mt-2 text-sm text-blue-100/80">Entorno de trabajo unico</p>
          </div>

          <nav className="mt-6 space-y-1">
            <a href="#" className="flex items-center rounded-xl bg-white/15 px-3 py-2.5 text-sm font-medium">
              <LayoutDashboard size={18} className="mr-2.5 text-cyan-300" /> Dashboard
            </a>
            <a href="#" className="flex items-center rounded-xl px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/10">
              <MessageSquare size={18} className="mr-2.5" /> Terminal IA
            </a>
            <a href="#" className="flex items-center rounded-xl px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/10">
              <FolderLock size={18} className="mr-2.5" /> Boveda segura
            </a>
            <a href="#" className="flex items-center rounded-xl px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/10">
              <Settings size={18} className="mr-2.5" /> Configuracion
            </a>
          </nav>

          <div className="mt-auto rounded-2xl border border-white/20 bg-white/10 p-4">
            <div className="flex items-center">
              <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 font-semibold">T</div>
              <div>
                <p className="text-sm font-medium">Dr. Tencio</p>
                <p className="text-xs text-blue-100/80">Direccion medica</p>
              </div>
            </div>
          </div>
        </aside>

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
            <a href="#" className="whitespace-nowrap rounded-lg border border-transparent px-2.5 py-1.5">
              Terminal IA
            </a>
            <a href="#" className="whitespace-nowrap rounded-lg border border-transparent px-2.5 py-1.5">
              Boveda
            </a>
            <a href="#" className="whitespace-nowrap rounded-lg border border-transparent px-2.5 py-1.5">
              Configuracion
            </a>
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

              <article className="rounded-2xl border border-[#d8e0f2] bg-white p-5 shadow-sm md:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#071226]">Acciones requeridas</h2>
                  <button className="text-sm font-medium text-[#2058ff]">Ver todas</button>
                </div>
                <div className="space-y-3">
                  {pendingTasks.map((task) => (
                    <div key={task.id} className="group flex items-start rounded-xl border border-[#ebf0fa] bg-[#fbfdff] p-3 transition hover:border-[#d3def3] hover:bg-white">
                      <div className="mt-0.5 rounded-lg border border-[#d8e0f2] bg-white p-2">{task.icon}</div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-[#182845]">{task.title}</p>
                        <p className="text-xs text-[#56698b]">{task.desc}</p>
                      </div>
                      <button className="rounded-full border border-[#d8e0f2] px-3 py-1 text-xs font-medium text-[#3f5375] transition group-hover:border-[#b8c5df]">
                        Revisar
                      </button>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-[#d8e0f2] bg-white p-5 shadow-sm md:p-6">
                <h2 className="mb-4 flex items-center text-lg font-semibold text-[#071226]">
                  <ShieldCheck size={19} className="mr-2 text-[#2058ff]" /> Estado de seguridad
                </h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-[#d8e0f2] bg-[#f9fbff] p-3">
                    <p className="text-xs uppercase tracking-wide text-[#5d7091]">Gateway</p>
                    <p className="mt-1 text-sm font-semibold text-[#182845]">{gatewayStatus === 'online' ? 'Conectado' : gatewayStatus === 'offline' ? 'Sin conexion' : 'Verificando'}</p>
                  </div>
                  <div className="rounded-xl border border-[#d8e0f2] bg-[#f9fbff] p-3">
                    <p className="text-xs uppercase tracking-wide text-[#5d7091]">Proxy</p>
                    <p className="mt-1 text-sm font-semibold text-[#182845]">Protegido por secret</p>
                  </div>
                  <div className="rounded-xl border border-[#d8e0f2] bg-[#f9fbff] p-3">
                    <p className="text-xs uppercase tracking-wide text-[#5d7091]">Contexto</p>
                    <p className="mt-1 text-sm font-semibold text-[#182845]">Workspace unico</p>
                  </div>
                </div>
              </article>
            </div>

            <div className="min-h-0 space-y-4 md:space-y-6">
              <article className="rounded-2xl border border-[#1e2f53] bg-[#0b1733] p-5 text-[#d5def2] shadow-[0_20px_45px_-35px_rgba(7,18,38,1)] md:p-6">
                <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
                  <h2 className="flex items-center text-sm font-semibold text-white">
                    <Activity size={16} className="mr-2 text-cyan-300" /> Monitor VPS
                  </h2>
                  <span className="rounded bg-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100">En vivo</span>
                </div>

                <div className="space-y-2.5 font-mono-ui text-xs">
                  {activityFeed.map((item) => (
                    <div key={item.id} className="flex items-start">
                      <span className="mr-3 shrink-0 text-[#8194ba]">{item.time}</span>
                      <span
                        className={
                          item.status === 'success'
                            ? 'text-[#b6c4e2]'
                            : item.status === 'warning'
                              ? 'text-[#f3c27b]'
                              : 'animate-pulse text-[#93bbff]'
                        }
                      >
                        {item.status === 'loading' ? '> ' : ''}
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                <div
                  className={`mt-4 flex flex-wrap items-center border-t border-white/10 pt-3 text-xs ${
                    gatewayStatus === 'online' ? 'text-[#73e6bf]' : gatewayStatus === 'offline' ? 'text-[#ff7f7f]' : 'text-[#f3c27b]'
                  }`}
                >
                  {gatewayStatus === 'online' && (
                    <>
                      <Wifi size={13} className="mr-2" /> 2.24.212.81:18789 - Conectado
                    </>
                  )}
                  {gatewayStatus === 'offline' && (
                    <>
                      <WifiOff size={13} className="mr-2" /> 2.24.212.81:18789 - Sin conexion
                    </>
                  )}
                  {gatewayStatus === 'checking' && (
                    <>
                      <Loader2 size={13} className="mr-2 animate-spin" /> Verificando conexion
                    </>
                  )}
                </div>
              </article>

              <article className="flex min-h-[360px] flex-col overflow-hidden rounded-2xl border border-[#d8e0f2] bg-white shadow-sm md:min-h-[420px]">
                <div className="flex items-center justify-between border-b border-[#e6ecfa] bg-[#f7f9ff] px-4 py-3">
                  <h2 className="flex items-center text-sm font-semibold text-[#182845]">
                    <TerminalSquare size={17} className="mr-2 text-[#2058ff]" /> Asistente IA
                  </h2>
                  <span className="rounded-full border border-[#d8e0f2] bg-white px-2.5 py-1 text-xs text-[#3f5375]">Conectado a OpenClaw</span>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,#f7faff_0%,#f9fbff_100%)] p-4">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm ${
                          msg.role === 'user'
                            ? 'rounded-tr-sm bg-[#2058ff] text-white'
                            : msg.role === 'error'
                              ? 'rounded-tl-sm border border-[#f5c7c7] bg-[#fff4f4] text-[#9f3e3e]'
                              : 'rounded-tl-sm border border-[#dde6f8] bg-white text-[#223354] shadow-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="mt-1 px-1 text-[10px] text-[#7b8dab]">{msg.timestamp}</span>
                    </div>
                  ))}

                  {isSending && (
                    <div className="flex items-start">
                      <div className="rounded-2xl rounded-tl-sm border border-[#dde6f8] bg-white px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-1.5">
                          <Loader2 size={14} className="animate-spin text-[#2058ff]" />
                          <span className="text-xs text-[#4f6285]">Procesando respuesta...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="border-t border-[#e6ecfa] bg-white p-3">
                  <form onSubmit={handleSendMessage} className="relative flex items-center">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Solicita una accion al asistente..."
                      disabled={isSending}
                      className="w-full rounded-xl border border-[#d8e0f2] bg-[#f8fbff] py-3 pl-3.5 pr-12 text-sm outline-none transition focus:border-[#2058ff] focus:bg-white disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={isSending || !inputText.trim()}
                      className="absolute right-2 rounded-lg bg-[#2058ff] p-2 text-white transition hover:bg-[#1a4ad4] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </form>
                </div>
              </article>
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
