export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/15 ring-1 ring-brand/30">
        <span className="text-xl font-black text-brand">C</span>
      </div>
      <div>
        <p className="text-xl font-bold tracking-tight text-brand">Prometeo</p>
        <p className="text-sm text-mutedText">Asistente de Compras</p>
      </div>
    </div>
  );
}
