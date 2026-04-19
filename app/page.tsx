'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  BriefcaseMedical,
  Home as HomeIcon,
  LayoutDashboard,
  MessageSquare,
  FolderLock,
  Settings,
  Bot,
  Activity,
  AlertTriangle,
  Send,
  CloudRain,
  FileText,
  Search,
  Bell,
  TerminalSquare,
  Wifi,
  WifiOff,
  Loader2,
  RefreshCw,
} from 'lucide-react'

type Workspace = 'hospital' | 'personal'
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

export default function Dashboard() {
  const [workspace, setWorkspace] = useState<Workspace>('hospital')
  const [inputText, setInputText] = useState('')
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus>('checking')
  const [isSending, setIsSending] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const theme = {
    hospital: {
      bg: 'bg-slate-50',
      primary: 'bg-blue-700',
      primaryHover: 'hover:bg-blue-800',
      textPrimary: 'text-blue-700',
      sidebar: 'bg-slate-900',
      sidebarHover: 'hover:bg-slate-800',
      icon: 'text-blue-400',
      badge: 'bg-blue-100 text-blue-700',
      activeNav: 'bg-blue-600',
    },
    personal: {
      bg: 'bg-stone-50',
      primary: 'bg-emerald-700',
      primaryHover: 'hover:bg-emerald-800',
      textPrimary: 'text-emerald-700',
      sidebar: 'bg-emerald-950',
      sidebarHover: 'hover:bg-emerald-900',
      icon: 'text-emerald-400',
      badge: 'bg-emerald-100 text-emerald-700',
      activeNav: 'bg-emerald-600',
    },
  }

  const currentTheme = theme[workspace]

  const dailyBriefing = {
    hospital: 'Dr. Tencio, el inventario de la farmacia tiene 2 discrepancias detectadas esta madrugada. He preparado un borrador de justificación para la CCSS basado en la LGCP. Hay 1 mensaje nuevo de un proveedor en SICOP.',
    personal: 'Buen día. Hoy no hay pronóstico de lluvia (0% prob.), es un momento óptimo para aplicar el herbicida en el muro sur. Tu pedido de maceteros llega hoy por la tarde.',
  }

  const agentActivity: Record<Workspace, ActivityItem[]> = {
    hospital: [
      { id: 1, time: '09:58 AM', text: 'Analizando reporte mensual SAP ERP...', status: 'loading' },
      { id: 2, time: '08:30 AM', text: 'Extracción de datos SICOP completada.', status: 'success' },
      { id: 3, time: '06:15 AM', text: 'Alerta: Discrepancia en stock de reactivos.', status: 'warning' },
    ],
    personal: [
      { id: 1, time: '10:00 AM', text: 'Monitoreando API Meteorológica (IMN)...', status: 'loading' },
      { id: 2, time: '09:15 AM', text: 'Lectura de recibo de luz (PDF) procesada.', status: 'success' },
      { id: 3, time: 'Ayer', text: 'Recordatorio de riego de plantas guardado.', status: 'success' },
    ],
  }

  const pendingTasks = {
    hospital: [
      { id: 1, title: 'Validar Borrador de Compra', desc: 'Equipos de monitoreo estéril (Art. 14 LGCP)', icon: <FileText size={18} className="text-blue-500" /> },
      { id: 2, title: 'Revisar Alerta de Stock', desc: 'Reactivos de laboratorio por debajo del 10%', icon: <AlertTriangle size={18} className="text-amber-500" /> },
    ],
    personal: [
      { id: 1, title: 'Control de Malezas', desc: 'Aplicar tratamiento en zona del muro (Clima óptimo)', icon: <CloudRain size={18} className="text-emerald-500" /> },
      { id: 2, title: 'Pagar Servicios', desc: 'Recibo eléctrico vence en 2 días', icon: <FileText size={18} className="text-stone-500" /> },
    ],
  }

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Hola, Dr. Tencio. Conectando con el Gateway de OpenClaw...',
      timestamp: new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  // Verificar estado del Gateway al cargar y cada 30 segundos
  const checkGateway = async () => {
    setGatewayStatus('checking')
    try {
      const res = await fetch('/api/health', { cache: 'no-store' })
      const data = await res.json()
      if (data.status === 'online') {
        setGatewayStatus('online')
        // Actualizar mensaje inicial si es la primera vez
        setChatMessages(prev => {
          if (prev.length === 1 && prev[0].text.includes('Conectando')) {
            return [{
              role: 'assistant',
              text: 'Hola, Dr. Tencio. OpenClaw está en línea y conectado al VPS. ¿En qué te puedo asistir hoy?',
              timestamp: new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
            }]
          }
          return prev
        })
      } else {
        setGatewayStatus('offline')
        setChatMessages(prev => {
          if (prev.length === 1 && prev[0].text.includes('Conectando')) {
            return [{
              role: 'error',
              text: '⚠️ No se pudo conectar con el Gateway de OpenClaw en el VPS. Verifica que el servicio esté corriendo.',
              timestamp: new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
            }]
          }
          return prev
        })
      }
    } catch {
      setGatewayStatus('offline')
    }
  }

  useEffect(() => {
    checkGateway()
    const interval = setInterval(checkGateway, 30000)
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll chat
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

    setChatMessages(prev => [...prev, userMsg])
    setInputText('')
    setIsSending(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText, workspace }),
      })

      const data = await res.json()

      const assistantMsg: ChatMessage = {
        role: data.success ? 'assistant' : 'error',
        text: data.success
          ? data.response
          : `⚠️ ${data.error || 'Error al comunicarse con OpenClaw'}`,
        timestamp: new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
      }

      setChatMessages(prev => [...prev, assistantMsg])
    } catch {
      setChatMessages(prev => [...prev, {
        role: 'error',
        text: '⚠️ Error de red al contactar el servidor.',
        timestamp: new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
      }])
    } finally {
      setIsSending(false)
    }
  }

  const StatusBadge = () => {
    if (gatewayStatus === 'checking') return (
      <span className="flex items-center text-xs text-yellow-400">
        <Loader2 size={10} className="mr-1 animate-spin" /> Verificando...
      </span>
    )
    if (gatewayStatus === 'online') return (
      <span className="flex items-center text-xs text-green-400">
        <span className="w-2 h-2 rounded-full bg-green-400 mr-1.5 animate-pulse" />
        VPS Conectado
      </span>
    )
    return (
      <span className="flex items-center text-xs text-red-400">
        <span className="w-2 h-2 rounded-full bg-red-400 mr-1.5" />
        VPS Desconectado
      </span>
    )
  }

  return (
    <div className={`flex h-screen w-full font-sans ${currentTheme.bg} transition-colors duration-500`}>

      {/* Sidebar */}
      <aside className={`w-64 flex flex-col ${currentTheme.sidebar} text-white transition-colors duration-500`}>
        {/* Selector de Workspace */}
        <div className="p-4 border-b border-white/10">
          <p className="text-xs text-white/50 mb-2 uppercase tracking-wider font-semibold">Entorno Activo</p>
          <div className="flex bg-black/20 rounded-lg p-1">
            <button
              onClick={() => setWorkspace('hospital')}
              className={`flex-1 flex items-center justify-center py-2 rounded-md text-sm transition-all ${workspace === 'hospital' ? 'bg-blue-600 shadow-md' : 'hover:bg-white/10'}`}
            >
              <BriefcaseMedical size={16} className="mr-2" />
              Gestión
            </button>
            <button
              onClick={() => setWorkspace('personal')}
              className={`flex-1 flex items-center justify-center py-2 rounded-md text-sm transition-all ${workspace === 'personal' ? 'bg-emerald-600 shadow-md' : 'hover:bg-white/10'}`}
            >
              <HomeIcon size={16} className="mr-2" />
              Personal
            </button>
          </div>
        </div>

        {/* Menú */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          <a href="#" className={`flex items-center px-3 py-2.5 rounded-lg bg-white/10 ${currentTheme.icon} font-medium`}>
            <LayoutDashboard size={20} className="mr-3" /> Dashboard
          </a>
          <a href="#" className={`flex items-center px-3 py-2.5 rounded-lg ${currentTheme.sidebarHover} text-white/80 transition-colors`}>
            <MessageSquare size={20} className="mr-3" /> Terminal IA
          </a>
          <a href="#" className={`flex items-center px-3 py-2.5 rounded-lg ${currentTheme.sidebarHover} text-white/80 transition-colors`}>
            <FolderLock size={20} className="mr-3" /> Bóveda Segura
          </a>
          <a href="#" className={`flex items-center px-3 py-2.5 rounded-lg ${currentTheme.sidebarHover} text-white/80 transition-colors`}>
            <TerminalSquare size={20} className="mr-3" /> Reglas y Skills
          </a>
        </nav>

        {/* Perfil */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={checkGateway}
            className={`w-full flex items-center px-3 py-2 rounded-lg ${currentTheme.sidebarHover} text-white/80 transition-colors mb-2`}
          >
            {gatewayStatus === 'online' ? <Wifi size={20} className="mr-3 text-green-400" /> : <WifiOff size={20} className="mr-3 text-red-400" />}
            Reconectar VPS
          </button>
          <a href="#" className={`flex items-center px-3 py-2 rounded-lg ${currentTheme.sidebarHover} text-white/80 transition-colors`}>
            <Settings size={20} className="mr-3" /> Configuración
          </a>
          <div className="flex items-center mt-4 px-3">
            <div className={`w-8 h-8 rounded-full ${currentTheme.primary} flex items-center justify-center font-bold mr-3`}>
              T
            </div>
            <div>
              <p className="text-sm font-medium">Dr. Tencio</p>
              <StatusBadge />
            </div>
          </div>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <h1 className="text-xl font-semibold text-gray-800">
            {workspace === 'hospital' ? 'Panel de Operaciones CCSS' : 'Panel Personal y Hogar'}
          </h1>
          <div className="flex items-center space-x-4 text-gray-500">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar documentos, oficios..."
                className="pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64 transition-all"
              />
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            {/* Indicador de estado en header */}
            <div className={`flex items-center text-xs px-3 py-1.5 rounded-full font-medium ${
              gatewayStatus === 'online' ? 'bg-green-100 text-green-700' :
              gatewayStatus === 'offline' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {gatewayStatus === 'online' && <><span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />Gateway Online</>}
              {gatewayStatus === 'offline' && <><span className="w-2 h-2 rounded-full bg-red-500 mr-1.5" />Gateway Offline</>}
              {gatewayStatus === 'checking' && <><Loader2 size={10} className="mr-1.5 animate-spin" />Verificando</>}
            </div>
          </div>
        </header>

        {/* Widgets */}
        <div className="flex-1 overflow-auto p-6 flex gap-6">

          {/* Columna Izquierda */}
          <div className="flex-1 flex flex-col space-y-6">

            {/* Daily Briefing */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-2 h-full ${currentTheme.primary}`} />
              <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <Bot size={22} className={`mr-2 ${currentTheme.textPrimary}`} />
                Resumen Matutino OpenClaw
              </h2>
              <p className="text-gray-600 leading-relaxed">{dailyBriefing[workspace]}</p>
            </div>

            {/* Tareas Pendientes */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Acciones Requeridas</h2>
                <button className={`text-sm font-medium ${currentTheme.textPrimary}`}>Ver todas</button>
              </div>
              <div className="space-y-3">
                {pendingTasks[workspace].map(task => (
                  <div key={task.id} className="flex items-start p-3 hover:bg-gray-50 rounded-xl transition-colors border border-gray-50 group cursor-pointer">
                    <div className="mt-0.5 p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                      {task.icon}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-800">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.desc}</p>
                    </div>
                    <button className="text-xs px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-100 font-medium text-gray-600">
                      Revisar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="w-1/3 flex flex-col space-y-6 min-w-[350px]">

            {/* Monitor VPS */}
            <div className="bg-slate-900 text-gray-300 p-5 rounded-2xl shadow-lg border border-slate-800 font-mono text-sm">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700">
                <div className="flex items-center text-slate-100 font-sans font-medium">
                  <Activity size={18} className="mr-2 text-green-400" />
                  Monitor del VPS
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider bg-slate-800 px-2 py-1 rounded text-slate-400">En vivo</span>
                  <button onClick={checkGateway} className="p-1 hover:bg-slate-700 rounded transition-colors">
                    <RefreshCw size={12} className="text-slate-400" />
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {agentActivity[workspace].map(activity => (
                  <div key={activity.id} className="flex items-start">
                    <span className="text-slate-500 mr-3 shrink-0 text-xs">{activity.time}</span>
                    <span className={`flex-1 text-xs ${
                      activity.status === 'success' ? 'text-slate-300' :
                      activity.status === 'warning' ? 'text-amber-400' :
                      'text-blue-300 animate-pulse'
                    }`}>
                      {activity.status === 'loading' ? '> ' : ''}{activity.text}
                    </span>
                  </div>
                ))}
              </div>
              {/* Estado real del gateway */}
              <div className={`mt-4 pt-3 border-t border-slate-700 text-xs flex items-center ${
                gatewayStatus === 'online' ? 'text-green-400' :
                gatewayStatus === 'offline' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {gatewayStatus === 'online' && <><span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />2.24.212.81:18789 — Conectado</>}
                {gatewayStatus === 'offline' && <><span className="w-2 h-2 rounded-full bg-red-400 mr-2" />2.24.212.81:18789 — Sin conexión</>}
                {gatewayStatus === 'checking' && <><Loader2 size={10} className="mr-2 animate-spin" />Verificando conexión...</>}
              </div>
            </div>

            {/* Chat IA */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <TerminalSquare size={18} className={`mr-2 ${currentTheme.textPrimary}`} />
                  Asistente IA
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ${currentTheme.badge}`}>
                  Modo: {workspace === 'hospital' ? 'Institucional' : 'Personal'}
                </span>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === 'user'
                        ? `${currentTheme.primary} text-white rounded-tr-sm`
                        : msg.role === 'error'
                        ? 'bg-red-50 border border-red-200 text-red-700 rounded-tl-sm'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))}
                {isSending && (
                  <div className="flex items-start">
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                      <div className="flex space-x-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="relative flex items-center">
                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder="Pídele a OpenClaw que ejecute una tarea..."
                    disabled={isSending}
                    className="w-full pl-4 pr-12 py-3 bg-gray-100 border-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-all disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !inputText.trim()}
                    className={`absolute right-2 p-2 rounded-lg ${currentTheme.primary} ${currentTheme.primaryHover} text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
