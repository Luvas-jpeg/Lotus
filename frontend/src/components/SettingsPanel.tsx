import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  Bot,
  CirclePause,
  Play,
  Save,
  Settings2,
  UserRound,
} from "lucide-react";
import type { BotConfig } from "@/types/dashboard";

type SettingsPanelProps = {
  config: BotConfig;
  notice: string;
  onConfigChange: Dispatch<SetStateAction<BotConfig>>;
  onSave: (event: FormEvent) => void;
  onToggle: () => void;
  onDismissNotice: () => void;
};

export function SettingsPanel({
  config,
  notice,
  onConfigChange,
  onSave,
  onToggle,
  onDismissNotice,
}: SettingsPanelProps) {
  return (
    <aside className="rounded-lg border border-[var(--border)] bg-[var(--lotus)] p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Settings2 size={18} className="text-[var(--leaf)]" />
        <h2 className="font-bold">Configuracoes</h2>
      </div>

      <form onSubmit={onSave} className="mt-5 grid gap-4">
        <label className="text-xs font-bold text-[var(--muted)]">
          Numero do bot
          <input
            value={config.phone}
            onChange={(event) =>
              onConfigChange({ ...config, phone: event.target.value })
            }
            placeholder="+55 11 99999-9999"
            className="mt-2 min-h-11 w-full rounded-lg border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--leaf)]"
          />
        </label>

        <label className="text-xs font-bold text-[var(--muted)]">
          Numero do gestor
          <input
            value={config.managerPhone}
            onChange={(event) =>
              onConfigChange({ ...config, managerPhone: event.target.value })
            }
            placeholder="+55 11 98888-8888"
            className="mt-2 min-h-11 w-full rounded-lg border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--leaf)]"
          />
        </label>

        <label className="text-xs font-bold text-[var(--muted)]">
          Contexto da IA
          <textarea
            value={config.context}
            onChange={(event) =>
              onConfigChange({ ...config, context: event.target.value })
            }
            rows={7}
            placeholder="Informacoes da empresa, servicos, horarios e regras..."
            className="mt-2 w-full resize-y rounded-lg border border-[var(--border)] p-3 text-sm outline-none focus:border-[var(--leaf)]"
          />
        </label>

        <label className="text-xs font-bold text-[var(--muted)]">
          Intervalo em minutos
          <input
            type="number"
            min={1}
            value={config.intervalMinutes}
            onChange={(event) =>
              onConfigChange({
                ...config,
                intervalMinutes: Number(event.target.value),
              })
            }
            className="mt-2 min-h-11 w-full rounded-lg border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--leaf)]"
          />
        </label>

        <label className="text-xs font-bold text-[var(--muted)]">
          Modo de operacao
          <select
            value={config.mode}
            onChange={(event) =>
              onConfigChange({
                ...config,
                mode: event.target.value as BotConfig["mode"],
              })
            }
            className="mt-2 min-h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--leaf)]"
          >
            <option value="reactive">Responder mensagens</option>
            <option value="proactive">Interagir automaticamente</option>
          </select>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="submit"
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--leaf)] px-3 text-sm font-bold text-white hover:bg-[var(--leaf-dark)]"
          >
            <Save size={17} />
            Salvar
          </button>

          <button
            type="button"
            onClick={onToggle}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold ${
              config.active
                ? "bg-[var(--danger-light)] text-[var(--danger)]"
                : "bg-[var(--leaf-light)] text-[var(--leaf-dark)]"
            }`}
          >
            {config.active ? <CirclePause size={17} /> : <Play size={17} />}
            {config.active ? "Pausar" : "Ativar"}
          </button>
        </div>
      </form>

      {notice && (
        <button
          type="button"
          onClick={onDismissNotice}
          className="mt-4 w-full rounded-lg border border-[var(--pollen)] bg-[var(--pollen-light)] p-3 text-left text-xs text-[var(--pollen-dark)]"
        >
          {notice}
        </button>
      )}

      <div className="mt-5 border-t border-[var(--border)] pt-4">
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <Bot size={15} />
          <span>IA conectada ao backend Lotus</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-[var(--muted)]">
          <UserRound size={15} />
          <span>Encaminhamento humano registrado no painel</span>
        </div>
      </div>
    </aside>
  );
}
