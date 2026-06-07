"use client";

import { UploadCloud, Trash2, X } from "lucide-react";
import { useDrawer } from "@/hooks/useDrawer";
import { quickActions } from "@/lib/mock-data";

type RightPanelProps = {
  onQuickPrompt: (prompt: string) => void;
  open?: boolean;
  onClose?: () => void;
};

export function RightPanel({ onQuickPrompt, open = false, onClose }: RightPanelProps) {
  const panelRef = useDrawer(open, onClose);

  function handleQuickPrompt(prompt: string) {
    onQuickPrompt(prompt);
    onClose?.();
  }

  const content = (
    <>
      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-mutedText">
          Acciones rápidas
        </p>
        <div className="space-y-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => handleQuickPrompt(action.prompt)}
                className="flex w-full items-center gap-4 rounded-xl border border-borderSoft bg-panel/70 px-4 py-3 text-left text-sm font-medium text-white transition hover:border-brand/60 hover:bg-panelSoft"
              >
                <Icon className="h-5 w-5 text-mutedText" />
                {action.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-mutedText">
          Documentos
        </p>
        <div className="flex h-52 flex-col items-center justify-center rounded-xl border border-dashed border-mutedText/50 bg-panel/50 p-6 text-center">
          <UploadCloud className="mb-3 h-10 w-10 text-mutedText" />
          <p className="text-sm text-white/80">Arrastra archivos aquí</p>
          <p className="text-sm text-white/80">o haz clic para cargar</p>
          <p className="mt-3 text-xs text-mutedText">PDF, Excel, Word · Máx. 50MB</p>
        </div>
      </section>

      <section className="mt-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-mutedText">
          Memoria del agente
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-borderSoft">
          <div className="h-full w-[42%] rounded-full bg-brand" />
        </div>
        <p className="mt-3 text-sm text-mutedText">Uso actual: 42% (6.7 GB / 16 GB)</p>
        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-borderSoft px-4 py-3 text-sm font-medium hover:bg-panelSoft">
          <Trash2 size={17} />
          Limpiar memoria
        </button>
      </section>
    </>
  );

  return (
    <>
      {/* Escritorio */}
      <aside className="hidden w-[340px] shrink-0 overflow-y-auto border-l border-borderSoft/70 bg-surface/95 p-5 xl:flex xl:flex-col">
        {content}
      </aside>

      {/* Móvil/tablet: panel deslizable */}
      <div
        className={`fixed inset-0 z-40 xl:hidden ${
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
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Acciones rápidas"
          tabIndex={-1}
          className={`absolute right-0 top-0 flex h-full w-[340px] max-w-[85%] flex-col overflow-y-auto border-l border-borderSoft/70 bg-surface p-5 shadow-soft outline-none transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <button
            onClick={onClose}
            className="mb-4 self-start rounded-xl p-2 text-mutedText hover:bg-panelSoft hover:text-white"
            aria-label="Cerrar acciones"
          >
            <X size={20} />
          </button>
          {content}
        </aside>
      </div>
    </>
  );
}
