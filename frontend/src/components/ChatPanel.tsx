import type { FormEvent } from "react";
import { CheckCircle2, Loader2, MessageCircle, Send } from "lucide-react";
import type { Conversation } from "@/types/dashboard";

type ChatPanelProps = {
  conversation: Conversation | null;
  testPhone: string;
  message: string;
  sending: boolean;
  onTestPhoneChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onSend: (event: FormEvent) => void;
  onResolve: () => void;
};

export function ChatPanel({
  conversation,
  testPhone,
  message,
  sending,
  onTestPhoneChange,
  onMessageChange,
  onSend,
  onResolve,
}: ChatPanelProps) {
  return (
    <section className="grid min-h-[700px] grid-rows-[auto_1fr_auto] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--lotus)] shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-[var(--border)] p-4">
        <div>
          <p className="text-xs font-bold uppercase text-[var(--leaf)]">
            Simulador
          </p>
          <h2 className="mt-1 font-bold">
            {conversation ? conversation.contact.phone : "Nova conversa"}
          </h2>
        </div>

        {conversation?.status === "needs_human" && (
          <button
            type="button"
            onClick={onResolve}
            title="Resolver atendimento"
            className="flex min-h-10 items-center gap-2 rounded-lg bg-[var(--leaf)] px-3 text-sm font-bold text-white hover:bg-[var(--leaf-dark)]"
          >
            <CheckCircle2 size={17} />
            Resolver
          </button>
        )}
      </header>

      <div className="flex flex-col justify-end gap-3 overflow-y-auto bg-[var(--chat-background)] p-4">
        {!conversation?.messages.length && (
          <div className="m-auto max-w-sm text-center text-sm text-[var(--muted)]">
            <MessageCircle
              className="mx-auto mb-3 text-[var(--leaf)]"
              size={42}
            />
            Envie uma mensagem para testar o atendimento da IA.
          </div>
        )}

        {conversation?.messages.map((item) => (
          <article
            key={item.id}
            className={`max-w-[82%] rounded-lg px-3 py-2 text-sm ${
              item.role === "bot"
                ? "ml-auto bg-[var(--leaf)] text-white"
                : item.role === "system"
                  ? "mx-auto bg-[var(--pollen-light)] text-[var(--pollen-dark)]"
                  : "bg-[var(--lotus)] text-[var(--text)] shadow-sm"
            }`}
          >
            <strong className="mb-1 block text-xs">
              {item.role === "bot"
                ? "Lotus IA"
                : item.role === "system"
                  ? "Sistema"
                  : "Cliente"}
            </strong>
            <p className="whitespace-pre-wrap leading-5">{item.text}</p>
          </article>
        ))}
      </div>

      <form
        onSubmit={onSend}
        className="grid gap-2 border-t border-[var(--border)] p-3 sm:grid-cols-[180px_1fr_auto]"
      >
        <input
          value={testPhone}
          onChange={(event) => onTestPhoneChange(event.target.value)}
          placeholder="Telefone do cliente"
          className="min-h-11 rounded-lg border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--leaf)]"
        />
        <input
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          placeholder="Mensagem recebida do cliente..."
          className="min-h-11 rounded-lg border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--leaf)]"
        />
        <button
          type="submit"
          disabled={sending}
          title="Enviar mensagem"
          className="grid min-h-11 min-w-11 place-items-center rounded-lg bg-[var(--leaf)] px-3 text-white hover:bg-[var(--leaf-dark)]"
        >
          {sending ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
    </section>
  );
}
