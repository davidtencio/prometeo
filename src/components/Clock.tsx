"use client";

import { CalendarClock } from "lucide-react";
import { useEffect, useState } from "react";

// timeZone fijo a Costa Rica para que la hora sea correcta sin importar
// la zona horaria del dispositivo desde donde se abra la app.
const dateFormat = new Intl.DateTimeFormat("es-CR", {
  timeZone: "America/Costa_Rica",
  weekday: "short",
  day: "2-digit",
  month: "short"
});

const timeFormat = new Intl.DateTimeFormat("es-CR", {
  timeZone: "America/Costa_Rica",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});

export function Clock() {
  // Se inicializa en null para evitar desajustes de hidratación (SSR vs cliente).
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Inicialización solo-cliente para evitar desajuste de hidratación.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  return (
    <div className="hidden items-center gap-2 rounded-lg border border-borderSoft px-3 py-2 text-sm text-mutedText md:flex">
      <CalendarClock size={16} className="text-brand" />
      <span className="capitalize">{dateFormat.format(now)}</span>
      <span className="tabular-nums font-medium text-white">
        {timeFormat.format(now)}
      </span>
    </div>
  );
}
