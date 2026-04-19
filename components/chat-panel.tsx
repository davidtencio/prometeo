'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Loader2, Send, TerminalSquare } from 'lucide-react'
import { ChatMessage } from './dashboard-types'

type ChatPanelProps = {
  initialMessages: ChatMessage[]
}

export function ChatPanel({ initialMessages }: ChatPanelProps) {
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || isSending) return

    const userMsg: ChatMessage = {
      role: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputText('')
    setIsSending(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText }),
      })
      const data = await res.json()

      const assistantMsg: ChatMessage = {
        role: data.success ? 'assistant' : 'error',
        text: data.success ? data.response : `${data.error || 'Error al comunicarse con OpenClaw'}`,
        timestamp: new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'error',
          text: 'Error de red al contactar el servidor.',
          timestamp: new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <article className="flex min-h-[360px] flex-col overflow-hidden rounded-2xl border border-[#d8e0f2] bg-white shadow-sm md:min-h-[420px]">
      <div className="flex items-center justify-between border-b border-[#e6ecfa] bg-[#f7f9ff] px-4 py-3">
        <h2 className="flex items-center text-sm font-semibold text-[#182845]">
          <TerminalSquare size={17} className="mr-2 text-[#2058ff]" /> Asistente IA
        </h2>
        <span className="rounded-full border border-[#d8e0f2] bg-white px-2.5 py-1 text-xs text-[#3f5375]">Conectado a OpenClaw</span>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,#f7faff_0%,#f9fbff_100%)] p-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === 'user'
                  ? 'rounded-tr-sm bg-[#2058ff] text-white'
                  : msg.role === 'error'
                    ? 'rounded-tl-sm border border-[#f5c7c7] bg-[#fff4f4] text-[#9f3e3e]'
                    : 'rounded-tl-sm border border-[#dde6f8] bg-white text-[#223354] shadow-sm'
              }`}
            >
              {msg.text}
            </div>
            <span className="mt-1 px-1 text-[10px] text-[#7b8dab]">{msg.timestamp}</span>
          </div>
        ))}

        {isSending && (
          <div className="flex items-start">
            <div className="rounded-2xl rounded-tl-sm border border-[#dde6f8] bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <Loader2 size={14} className="animate-spin text-[#2058ff]" />
                <span className="text-xs text-[#4f6285]">Procesando respuesta...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-[#e6ecfa] bg-white p-3">
        <form onSubmit={handleSendMessage} className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Solicita una accion al asistente..."
            disabled={isSending}
            className="w-full rounded-xl border border-[#d8e0f2] bg-[#f8fbff] py-3 pl-3.5 pr-12 text-sm outline-none transition focus:border-[#2058ff] focus:bg-white disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isSending || !inputText.trim()}
            className="absolute right-2 rounded-lg bg-[#2058ff] p-2 text-white transition hover:bg-[#1a4ad4] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
      </div>
    </article>
  )
}
