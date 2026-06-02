"use client";

import { Loader2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { ChatPanel } from "@/components/ChatPanel";
import { ConversationList } from "@/components/ConversationList";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useDashboard } from "@/hooks/useDashboard";

export default function Home() {
  const dashboard = useDashboard();

  if (dashboard.loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--background)]">
        <Loader2 className="animate-spin text-[var(--leaf)]" size={30} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <AppHeader active={dashboard.config.active} />

      <div className="mx-auto grid max-w-[1600px] gap-4 p-4 lg:grid-cols-[340px_minmax(0,1fr)_360px]">
        <ConversationList
          conversations={dashboard.conversations}
          selectedConversationId={dashboard.selectedConversation?.id}
          onSelect={dashboard.openConversation}
        />
        <ChatPanel
          conversation={dashboard.selectedConversation}
          testPhone={dashboard.testPhone}
          message={dashboard.message}
          sending={dashboard.sending}
          onTestPhoneChange={dashboard.setTestPhone}
          onMessageChange={dashboard.setMessage}
          onSend={dashboard.sendMessage}
          onResolve={dashboard.resolveConversation}
        />
        <SettingsPanel
          config={dashboard.config}
          notice={dashboard.notice}
          onConfigChange={dashboard.setConfig}
          onSave={dashboard.saveConfig}
          onToggle={dashboard.toggleBot}
          onDismissNotice={() => dashboard.setNotice("")}
        />
      </div>
    </main>
  );
}
