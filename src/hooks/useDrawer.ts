"use client";

import { useEffect, useRef } from "react";

/**
 * Accesibilidad básica para drawers móviles:
 * - Cierra con la tecla Escape.
 * - Mueve el foco al panel al abrir (para teclado/lectores de pantalla).
 */
export function useDrawer(open: boolean, onClose?: () => void) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose?.();
    }

    document.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return panelRef;
}
