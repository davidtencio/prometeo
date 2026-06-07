"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ChatMessage, Conversation } from "@/lib/chat-types";

const STORAGE_KEY = "prometeo.conversations";
const NEW_TITLE = "Nueva conversación";

function newConversation(): Conversation {
  return {
    id: crypto.randomUUID(),
    title: NEW_TITLE,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

function deriveTitle(current: string, messages: ChatMessage[]): string {
  if (current && current !== NEW_TITLE) return current;
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return current || NEW_TITLE;
  const text = firstUser.text.trim();
  return text.length > 40 ? `${text.slice(0, 40)}…` : text;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Cargar una vez al montar (evita desajuste de hidratación: el server
  // y el primer render del cliente arrancan vacíos). La carga es solo-cliente
  // desde localStorage, así que el setState dentro del efecto es intencional.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          conversations: Conversation[];
          currentId: string | null;
        };
        if (parsed.conversations?.length) {
          setConversations(parsed.conversations);
          const exists = parsed.conversations.some((c) => c.id === parsed.currentId);
          setCurrentId(exists ? parsed.currentId : parsed.conversations[0].id);
          setLoaded(true);
          return;
        }
      }
    } catch {
      // localStorage corrupto o no disponible: arrancamos limpio.
    }
    const first = newConversation();
    setConversations([first]);
    setCurrentId(first.id);
    setLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Persistir ante cualquier cambio.
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ conversations, currentId }));
    } catch {
      // sin persistencia (modo privado, cuota llena): la app sigue funcionando.
    }
  }, [conversations, currentId, loaded]);

  const current = conversations.find((c) => c.id === currentId) ?? null;

  const setCurrentMessages: Dispatch<SetStateAction<ChatMessage[]>> = useCallback(
    (value) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== currentId) return c;
          const messages =
            typeof value === "function"
              ? (value as (p: ChatMessage[]) => ChatMessage[])(c.messages)
              : value;
          return {
            ...c,
            messages,
            title: deriveTitle(c.title, messages),
            updatedAt: Date.now()
          };
        })
      );
    },
    [currentId]
  );

  const newChat = useCallback(() => {
    const cur = conversations.find((c) => c.id === currentId);
    if (cur && cur.messages.length === 0) {
      // Ya estamos en un chat vacío: no creamos duplicados.
      return;
    }
    const conv = newConversation();
    setConversations((prev) => [conv, ...prev]);
    setCurrentId(conv.id);
  }, [conversations, currentId]);

  const selectChat = useCallback((id: string) => {
    setCurrentId(id);
  }, []);

  const deleteChat = useCallback(
    (id: string) => {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length === 0) {
        const conv = newConversation();
        setConversations([conv]);
        setCurrentId(conv.id);
        return;
      }
      setConversations(remaining);
      if (currentId === id) setCurrentId(remaining[0].id);
    },
    [conversations, currentId]
  );

  // Lista ordenada por actividad reciente.
  const ordered = useMemo(
    () => [...conversations].sort((a, b) => b.updatedAt - a.updatedAt),
    [conversations]
  );

  return {
    conversations: ordered,
    currentId,
    currentMessages: current?.messages ?? [],
    setCurrentMessages,
    newChat,
    selectChat,
    deleteChat,
    loaded
  };
}
