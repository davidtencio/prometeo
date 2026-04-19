'use client'

import { ChevronLeft, ChevronRight, FolderLock, LayoutDashboard, MessageSquare, Settings } from 'lucide-react'

type SidebarProps = {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`relative hidden shrink-0 border-r border-[#d8e0f2] bg-gradient-to-b from-[#0b1733] to-[#0c2149] text-white transition-all duration-300 lg:flex lg:flex-col ${
        collapsed ? 'w-20 p-3' : 'w-72 p-5'
      }`}
    >
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 hidden h-7 w-7 items-center justify-center rounded-full border border-[#d8e0f2] bg-white text-[#0b1733] shadow-sm transition hover:bg-[#f3f7ff] lg:flex"
        aria-label={collapsed ? 'Expandir barra lateral' : 'Minimizar barra lateral'}
        title={collapsed ? 'Expandir' : 'Minimizar'}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={`rounded-2xl border border-white/20 bg-white/10 ${collapsed ? 'p-3' : 'p-4'}`}>
        <p className="text-[11px] uppercase tracking-[0.2em] text-blue-100/70">OpenClaw Node</p>
        {!collapsed && (
          <>
            <p className="mt-1 text-lg font-semibold">Workspace</p>
            <p className="mt-2 text-sm text-blue-100/80">Entorno de trabajo unico</p>
          </>
        )}
      </div>

      <nav className="mt-6 space-y-1">
        <button
          type="button"
          className={`flex items-center rounded-xl bg-white/15 py-2.5 text-sm font-medium ${collapsed ? 'justify-center px-2' : 'px-3'}`}
          title="Dashboard"
        >
          <LayoutDashboard size={18} className={`${collapsed ? '' : 'mr-2.5'} text-cyan-300`} />
          {!collapsed && 'Dashboard'}
        </button>
        <button
          type="button"
          className={`flex items-center rounded-xl py-2.5 text-sm text-white/80 transition hover:bg-white/10 ${collapsed ? 'justify-center px-2' : 'px-3'}`}
          title="Terminal IA"
        >
          <MessageSquare size={18} className={collapsed ? '' : 'mr-2.5'} />
          {!collapsed && 'Terminal IA'}
        </button>
        <button
          type="button"
          className={`flex items-center rounded-xl py-2.5 text-sm text-white/80 transition hover:bg-white/10 ${collapsed ? 'justify-center px-2' : 'px-3'}`}
          title="Boveda segura"
        >
          <FolderLock size={18} className={collapsed ? '' : 'mr-2.5'} />
          {!collapsed && 'Boveda segura'}
        </button>
        <button
          type="button"
          className={`flex items-center rounded-xl py-2.5 text-sm text-white/80 transition hover:bg-white/10 ${collapsed ? 'justify-center px-2' : 'px-3'}`}
          title="Configuracion"
        >
          <Settings size={18} className={collapsed ? '' : 'mr-2.5'} />
          {!collapsed && 'Configuracion'}
        </button>
      </nav>

      <div className={`mt-auto rounded-2xl border border-white/20 bg-white/10 ${collapsed ? 'p-3' : 'p-4'}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
          <div className={`${collapsed ? '' : 'mr-3'} flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 font-semibold`}>T</div>
          {!collapsed && (
            <div>
              <p className="text-sm font-medium">Dr. Tencio</p>
              <p className="text-xs text-blue-100/80">Direccion medica</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
