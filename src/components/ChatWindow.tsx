"use client";

import { Paperclip, SendHorizonal, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "./MessageBubble";
import type { ChartPayload } from "@/lib/chat-types";

type ChatWindowProps = {
  pendingPrompt?: string;
  onClearPendingPrompt?: () => void;
};

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
  time: string;
  error?: boolean;
  chart?: ChartPayload;
};

function currentTime() {
  return new Intl.DateTimeFormat("es-CR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date());
}

export function ChatWindow({ pendingPrompt, onClearPendingPrompt }: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [awaitingReply, setAwaitingReply] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const draft = pendingPrompt || message;

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, awaitingReply]);

  // Autoajuste de altura del textarea.
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  }, [draft]);

  async function sendMessage() {
    const clean = draft.trim();
    if (!clean || isSending) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text: clean,
      time: currentTime()
    };

    const history = messages.slice(-10).map(({ role, text }) => ({ role, text }));

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    onClearPendingPrompt?.();
    setIsSending(true);
    setAwaitingReply(true);

    let assistantId: number | null = null;
    let acc = "";

    function upsertAssistant(update: Partial<Message>) {
      if (assistantId === null) {
        assistantId = Date.now() + 1;
        const id = assistantId;
        setMessages((prev) => [
          ...prev,
          { id, role: "assistant", text: "", time: currentTime(), ...update }
        ]);
        setAwaitingReply(false);
      } else {
        const id = assistantId;
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, ...update } : m))
        );
      }
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: clean, context: { history } })
      });

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "No se pudo obtener respuesta.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newline: number;
        while ((newline = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, newline).trim();
          buffer = buffer.slice(newline + 1);
          if (!line) continue;

          const event = JSON.parse(line) as
            | { type: "text"; value: string }
            | { type: "chart"; value: ChartPayload };

          if (event.type === "text") {
            acc += event.value;
            upsertAssistant({ text: acc });
          } else if (event.type === "chart") {
            upsertAssistant({ chart: event.value });
          }
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          text:
            error instanceof Error
              ? error.message
              : "Ocurrió un error al contactar al asistente.",
          time: currentTime(),
          error: true
        }
      ]);
    } finally {
      setIsSending(false);
      setAwaitingReply(false);
    }
  }

  const hasMessages = messages.length > 0;

  return (
    <main className="grid-bg flex min-w-0 flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden px-5 py-5">
        <section
          ref={scrollRef}
          className="glass-panel flex-1 overflow-y-auto rounded-2xl p-5"
        >
          {!hasMessages && !awaitingReply ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/15 ring-1 ring-brand/30">
                <Sparkles className="h-8 w-8 text-brand" />
              </div>
              <h2 className="text-lg font-semibold text-white">
                ¿En qué te ayudo hoy, David?
              </h2>
              <p className="mt-2 max-w-md text-sm text-mutedText">
                Escribe una instrucción o usa una de las acciones rápidas del panel
                derecho para empezar.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((item) => (
                <MessageBubble
                  key={item.id}
                  role={item.role}
                  time={item.time}
                  error={item.error}
                  chart={item.chart}
                >
                  {item.text}
                </MessageBubble>
              ))}

              {awaitingReply && <TypingIndicator />}
            </div>
          )}
        </section>

        <div className="mt-5 flex items-end gap-3 rounded-xl border border-borderSoft bg-surface/85 px-4 py-3">
          <button className="rounded-lg p-2 text-mutedText hover:bg-panelSoft hover:text-white">
            <Paperclip size={22} />
          </button>
          <textarea
            ref={textareaRef}
            value={draft}
            rows={1}
            onChange={(event) => {
              onClearPendingPrompt?.();
              setMessage(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
            className="min-w-0 flex-1 resize-none bg-transparent py-1.5 text-sm text-white outline-none placeholder:text-mutedText"
            placeholder="Escribe tu mensaje... (Shift+Enter para salto de línea)"
          />
          <button
            onClick={sendMessage}
            disabled={isSending || !draft.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-surface transition hover:bg-brandDark disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Enviar mensaje"
          >
            <SendHorizonal size={20} />
          </button>
        </div>

        <p className="pt-4 text-center text-xs text-mutedText">
          Prometeo v1.0.0 - Asistente local ejecutándose en tu servidor
        </p>
      </div>
    </main>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start gap-4">
      <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/30">
        <span className="text-2xl font-black text-brand">C</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-xl bg-panelSoft px-5 py-4 shadow-soft">
        <span className="h-2 w-2 animate-bounce rounded-full bg-mutedText [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-mutedText [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-mutedText" />
      </div>
    </div>
  );
}
