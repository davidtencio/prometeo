import { Clock3, Menu, Pencil, Share2, Sparkles } from "lucide-react";
import { Clock } from "./Clock";

type TopBarProps = {
  title?: string;
  onOpenSidebar?: () => void;
  onOpenActions?: () => void;
};

export function TopBar({ title, onOpenSidebar, onOpenActions }: TopBarProps) {
  return (
    <header className="flex h-[74px] shrink-0 items-center justify-between border-b border-borderSoft/70 bg-surface/70 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenSidebar}
          className="rounded-lg p-2 text-mutedText hover:bg-panelSoft hover:text-white lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
        <h1 className="truncate text-base font-bold tracking-wide text-white sm:text-lg">
          {title || "Nueva conversación"}
        </h1>
        <button className="hidden rounded-lg p-1.5 text-mutedText hover:bg-panelSoft hover:text-white sm:block">
          <Pencil size={16} />
        </button>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <Clock />
        <button className="hidden items-center gap-2 rounded-lg border border-borderSoft px-4 py-2 text-sm font-medium text-white hover:bg-panelSoft md:flex">
          <Share2 size={16} />
          Compartir
        </button>
        <button className="hidden items-center gap-2 rounded-lg border border-borderSoft px-4 py-2 text-sm font-medium text-white hover:bg-panelSoft md:flex">
          <Clock3 size={16} />
          Historial
        </button>
        <button
          onClick={onOpenActions}
          className="rounded-lg p-2 text-mutedText hover:bg-panelSoft hover:text-white xl:hidden"
          aria-label="Acciones rápidas"
        >
          <Sparkles size={20} />
        </button>
      </div>
    </header>
  );
}
