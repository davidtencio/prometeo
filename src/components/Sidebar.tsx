"use client";

import { FileText, LogOut, Plus, Scale, X } from "lucide-react";
import { Logo } from "./Logo";
import { recentChats, recentFiles } from "@/lib/mock-data";

type SidebarProps = {
  onNewChat?: () => void;
  open?: boolean;
  onClose?: () => void;
};

export function Sidebar({ onNewChat, open = false, onClose }: SidebarProps) {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    window.location.href = "/login";
  }

  function handleNewChat() {
    onNewChat?.();
    onClose?.();
  }

  const content = (
    <>
      <div className="mb-8 flex items-center justify-between">
        <Logo />
      </div>

      <button
        onClick={handleNewChat}
        className="mb-8 flex h-12 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-surface shadow-soft transition hover:bg-brandDark"
      >
        <Plus size={18} />
        Nuevo chat
      </button>

      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-mutedText">
          Chats recientes
        </p>
        <div className="space-y-2">
          {recentChats.map((chat) => (
            <button
              key={`${chat.title}-${chat.subtitle}`}
              onClick={onClose}
              className={`w-full rounded-xl px-4 py-3 text-left transition ${
                chat.active
                  ? "border-l-4 border-brand bg-panelSoft"
                  : "hover:bg-panelSoft/70"
              }`}
            >
              <div className="flex gap-3">
                <Scale className="mt-1 h-5 w-5 shrink-0 text-mutedText" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-medium text-white">{chat.title}</p>
                    <span className="text-xs text-mutedText">{chat.time}</span>
                  </div>
                  <p className="truncate text-sm text-white/80">{chat.subtitle}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        <button className="mt-3 text-sm text-sky-200/80 hover:text-sky-100">
          Ver todos los chats
        </button>
      </section>

      <section className="mt-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-mutedText">
          Expedientes recientes
        </p>
        <div className="space-y-2">
          {recentFiles.map((file) => (
            <button
              key={file.code}
              onClick={onClose}
              className="flex w-full gap-3 rounded-xl px-2 py-3 text-left hover:bg-panelSoft/70"
            >
              <FileText className="mt-1 h-5 w-5 shrink-0 text-mutedText" />
              <div className="min-w-0">
                <p className="truncate text-sm text-white">{file.code}</p>
                <p className="truncate text-sm text-mutedText">{file.name}</p>
              </div>
            </button>
          ))}
        </div>
        <button className="mt-3 text-sm text-sky-200/80 hover:text-sky-100">
          Ver todos los expedientes
        </button>
      </section>

      <div className="mt-auto border-t border-borderSoft pt-5">
        <div className="flex items-center gap-3">
          <button className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2 text-left hover:bg-panelSoft/70">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-sm font-bold text-surface">
              DT
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">Dr. David Tencio A.</p>
            </div>
          </button>
          <button
            onClick={logout}
            className="rounded-xl p-2 text-mutedText hover:bg-panelSoft hover:text-white"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Escritorio */}
      <aside className="hidden w-[320px] shrink-0 overflow-y-auto border-r border-borderSoft/70 bg-surface/95 p-5 lg:flex lg:flex-col">
        {content}
      </aside>

      {/* Móvil: menú deslizable */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          open ? "" : "pointer-events-none"
        }`}
      >
        <div
          onClick={onClose}
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute left-0 top-0 flex h-full w-[300px] max-w-[85%] flex-col overflow-y-auto border-r border-borderSoft/70 bg-surface p-5 shadow-soft transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            onClick={onClose}
            className="mb-4 self-end rounded-xl p-2 text-mutedText hover:bg-panelSoft hover:text-white"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
          {content}
        </aside>
      </div>
    </>
  );
}
