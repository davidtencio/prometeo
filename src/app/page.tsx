"use client";

import { useState } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { RightPanel } from "@/components/RightPanel";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { useConversations } from "@/hooks/useConversations";

export default function Home() {
  const [pendingPrompt, setPendingPrompt] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  const {
    conversations,
    currentId,
    currentMessages,
    setCurrentMessages,
    newChat,
    selectChat,
    deleteChat
  } = useConversations();

  const currentTitle = conversations.find((c) => c.id === currentId)?.title;

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-white">
      <Sidebar
        conversations={conversations}
        currentId={currentId}
        onSelect={selectChat}
        onDelete={deleteChat}
        onNewChat={newChat}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <section className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title={currentTitle}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenActions={() => setActionsOpen(true)}
        />
        <div className="flex min-h-0 flex-1">
          <ChatWindow
            key={currentId ?? "loading"}
            messages={currentMessages}
            setMessages={setCurrentMessages}
            pendingPrompt={pendingPrompt}
            onClearPendingPrompt={() => setPendingPrompt("")}
          />
          <RightPanel
            onQuickPrompt={setPendingPrompt}
            open={actionsOpen}
            onClose={() => setActionsOpen(false)}
          />
        </div>
      </section>
    </div>
  );
}
