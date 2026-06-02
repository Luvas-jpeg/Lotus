import { History } from "lucide-react";
import type { Conversation } from "@/types/dashboard";

type ConversationListProps = {
  conversations: Conversation[];
  selectedConversationId?: number;
  onSelect: (id: number) => void;
};

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelect,
}: ConversationListProps) {
  return (
    <aside className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--lotus)] shadow-sm">
      <div className="flex items-center gap-2 border-b border-[var(--border)] p-4">
        <History size={18} className="text-[var(--leaf)]" />
        <h2 className="font-bold">Conversas</h2>
      </div>

      <div className="max-h-[calc(100vh-150px)] overflow-y-auto">
        {conversations.length === 0 && (
          <p className="p-5 text-sm text-[var(--muted)]">
            Nenhuma conversa registrada.
          </p>
        )}

        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            onClick={() => onSelect(conversation.id)}
            className={`w-full border-b border-[var(--border)] p-4 text-left transition hover:bg-[var(--surface-hover)] ${
              selectedConversationId === conversation.id
                ? "bg-[var(--surface-soft)]"
                : "bg-[var(--lotus)]"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <strong className="text-sm">
                {conversation.contact.name || conversation.contact.phone}
              </strong>
              {conversation.status === "needs_human" && (
                <span className="rounded-full bg-[var(--pollen-light)] px-2 py-1 text-[10px] font-bold text-[var(--pollen-dark)]">
                  Humano
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-xs text-[var(--muted)]">
              {conversation.messages[0]?.text || "Sem mensagens"}
            </p>
          </button>
        ))}
      </div>
    </aside>
  );
}
