"use client";

import { useState } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { RightPanel } from "@/components/RightPanel";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

export default function Home() {
  const [pendingPrompt, setPendingPrompt] = useState("");
  const [chatKey, setChatKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  function handleNewChat() {
    setChatKey((key) => key + 1);
    setPendingPrompt("");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-white">
      <Sidebar
        onNewChat={handleNewChat}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <section className="flex min-w-0 flex-1 flex-col">
        <TopBar
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenActions={() => setActionsOpen(true)}
        />
        <div className="flex min-h-0 flex-1">
          <ChatWindow
            key={chatKey}
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
