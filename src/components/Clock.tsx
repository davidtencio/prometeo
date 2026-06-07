"use client";

import { CalendarClock } from "lucide-react";
import { useEffect, useState } from "react";

const dateFormat = new Intl.DateTimeFormat("es-CR", {
  weekday: "short",
  day: "2-digit",
  month: "short"
});

const timeFormat = new Intl.DateTimeFormat("es-CR", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});

export function Clock() {
  // Se inicializa en null para evitar desajustes de hidratación (SSR vs cliente).
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
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
