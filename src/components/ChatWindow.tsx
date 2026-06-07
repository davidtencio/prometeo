"use client";

import {
  ArrowDown,
  FileText,
  Paperclip,
  RefreshCw,
  SendHorizonal,
  Sparkles,
  Square,
  UploadCloud,
  X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { MessageBubble } from "./MessageBubble";
import { formatFileSize } from "@/lib/format";
import type { Attachment, ChartPayload, ChatMessage } from "@/lib/chat-types";

type ChatWindowProps = {
  messages: ChatMessage[];
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  pendingPrompt?: string;
  onClearPendingPrompt?: () => void;
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const SUGGESTIONS = [
  "Buscar en SICOP concursos recientes de un medicamento",
  "Generar un estudio de mercado con promedio y mediana",
  "Comparar precios contra expedientes similares",
  "Redactar un oficio institucional formal"
];

function currentTime() {
  return new Intl.DateTimeFormat("es-CR", {
    timeZone: "America/Costa_Rica",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date());
}

export function ChatWindow({
  messages,
  setMessages,
  pendingPrompt,
  onClearPendingPrompt
}: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [awaitingReply, setAwaitingReply] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const draft = pendingPrompt || message;
  const canSend = (draft.trim().length > 0 || attachments.length > 0) && !isSending;

  function scrollToBottom(behavior: ScrollBehavior = "smooth") {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior
    });
  }

  useEffect(() => {
    if (atBottom) scrollToBottom();
  }, [messages, awaitingReply, atBottom]);

  // Autoajuste de altura del textarea.
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  }, [draft]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAtBottom(distance < 80);
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const incoming = Array.from(fileList)
      .filter((file) => file.size <= MAX_FILE_SIZE)
      .map((file) => ({ name: file.name, size: file.size, type: file.type }));
    if (incoming.length) {
      setAttachments((prev) => [...prev, ...incoming]);
    }
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function stopGeneration() {
    abortRef.current?.abort();
  }

  async function streamAssistant(
    promptText: string,
    history: { role: string; text: string }[],
    files: Attachment[]
  ) {
    setIsSending(true);
    setAwaitingReply(true);
    setAtBottom(true);

    const controller = new AbortController();
    abortRef.current = controller;

    let assistantId: number | null = null;
    let acc = "";

    function upsertAssistant(update: Partial<ChatMessage>) {
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
        body: JSON.stringify({ message: promptText, context: { history }, files }),
        signal: controller.signal
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
      // El abort del usuario no es un error: conservamos lo recibido.
      if (error instanceof DOMException && error.name === "AbortError") {
        if (assistantId === null) setAwaitingReply(false);
      } else {
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
      }
    } finally {
      setIsSending(false);
      setAwaitingReply(false);
      abortRef.current = null;
    }
  }

  async function sendMessage() {
    const clean = draft.trim();
    if ((!clean && attachments.length === 0) || isSending) return;

    const files = attachments;
    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      text: clean,
      time: currentTime(),
      ...(files.length ? { files } : {})
    };

    const history = messages.slice(-10).map(({ role, text }) => ({ role, text }));

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setAttachments([]);
    onClearPendingPrompt?.();

    await streamAssistant(clean, history, files);
  }

  function submitPrompt(text: string) {
    const clean = text.trim();
    if (!clean || isSending) return;
    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      text: clean,
      time: currentTime()
    };
    const history = messages.slice(-10).map(({ role, text }) => ({ role, text }));
    setMessages((prev) => [...prev, userMessage]);
    void streamAssistant(clean, history, []);
  }

  function regenerate() {
    if (isSending) return;
    // Último mensaje del usuario.
    let idx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        idx = i;
        break;
      }
    }
    if (idx === -1) return;

    const lastUser = messages[idx];
    const base = messages.slice(0, idx + 1); // descarta la respuesta anterior
    setMessages(base);

    const history = base
      .slice(0, -1)
      .slice(-10)
      .map(({ role, text }) => ({ role, text }));

    void streamAssistant(lastUser.text, history, lastUser.files ?? []);
  }

  const hasMessages = messages.length > 0;
  const lastMessage = messages[messages.length - 1];
  const canRegenerate =
    !isSending && hasMessages && lastMessage?.role === "assistant" && !lastMessage.error;

  return (
    <main
      className="grid-bg relative flex min-w-0 flex-1 flex-col"
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        addFiles(event.dataTransfer.files);
      }}
    >
      {isDragging && (
        <div className="pointer-events-none absolute inset-3 z-20 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand bg-surface/80">
          <UploadCloud className="mb-3 h-10 w-10 text-brand" />
          <p className="text-sm font-medium text-white">Suelta los archivos aquí</p>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden px-5 py-5">
        <section
          ref={scrollRef}
          onScroll={handleScroll}
          className="glass-panel relative flex-1 overflow-y-auto rounded-2xl p-5"
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
                Escribe una instrucción, arrastra un archivo o usa una de las acciones
                rápidas del panel derecho para empezar.
              </p>
              <div className="mt-6 flex max-w-2xl flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => submitPrompt(suggestion)}
                    className="rounded-full border border-borderSoft bg-panel/60 px-4 py-2 text-xs text-mutedText transition hover:border-brand/60 hover:text-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
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
                  files={item.files}
                >
                  {item.text}
                </MessageBubble>
              ))}

              {awaitingReply && <TypingIndicator />}

              {canRegenerate && (
                <div className="flex justify-start pl-16">
                  <button
                    onClick={regenerate}
                    className="flex items-center gap-2 rounded-lg border border-borderSoft px-3 py-2 text-xs font-medium text-mutedText transition hover:bg-panelSoft hover:text-white"
                  >
                    <RefreshCw size={14} />
                    Regenerar respuesta
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        <div className="relative">
          {!atBottom && hasMessages && (
            <button
              onClick={() => scrollToBottom()}
              className="absolute -top-12 left-1/2 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-borderSoft bg-panel text-white shadow-soft transition hover:bg-panelSoft"
              aria-label="Bajar al último mensaje"
            >
              <ArrowDown size={18} />
            </button>
          )}

          <div className="mt-5 rounded-xl border border-borderSoft bg-surface/85 px-4 py-3">
            {attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-2 rounded-lg border border-borderSoft bg-panel/70 px-3 py-2 text-xs"
                  >
                    <FileText size={14} className="text-brand" />
                    <span className="max-w-[160px] truncate text-white">{file.name}</span>
                    <span className="text-mutedText">{formatFileSize(file.size)}</span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-mutedText hover:text-red-400"
                      aria-label={`Quitar ${file.name}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => {
                  addFiles(event.target.files);
                  event.target.value = "";
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg p-2 text-mutedText hover:bg-panelSoft hover:text-white"
                aria-label="Adjuntar archivo"
                title="Adjuntar archivo"
              >
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
              {isSending ? (
                <button
                  onClick={stopGeneration}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-panelSoft text-white transition hover:bg-panel"
                  aria-label="Detener generación"
                  title="Detener generación"
                >
                  <Square size={18} className="fill-current" />
                </button>
              ) : (
                <button
                  onClick={sendMessage}
                  disabled={!canSend}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-surface transition hover:bg-brandDark disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Enviar mensaje"
                >
                  <SendHorizonal size={20} />
                </button>
              )}
            </div>
          </div>
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
