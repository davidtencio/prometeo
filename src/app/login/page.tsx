"use client";

import { Lock } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? "No se pudo iniciar sesión.");
      }

      const from = new URL(window.location.href).searchParams.get("from") || "/";
      window.location.href = from;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error.");
      setLoading(false);
    }
  }

  return (
    <main className="grid-bg flex min-h-screen items-center justify-center bg-surface px-5 text-white">
      <div className="glass-panel w-full max-w-sm rounded-2xl p-8">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <h1 className="text-center text-xl font-bold text-white">¡Hola David!!</h1>
        <p className="mt-1 text-center text-sm text-mutedText">
          Bienvenido. Iniciá sesión para acceder al asistente.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-borderSoft bg-surface/85 px-4 py-3">
            <Lock size={18} className="text-mutedText" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoFocus
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-mutedText"
              placeholder="Contraseña"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || !password}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-brand text-sm font-semibold text-surface transition hover:bg-brandDark disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
