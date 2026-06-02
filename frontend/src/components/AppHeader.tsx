import { Flower2 } from "lucide-react";

type AppHeaderProps = {
  active: boolean;
};

export function AppHeader({ active }: AppHeaderProps) {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--lotus)] shadow-[0_4px_16px_var(--lotus-shadow)]">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-lg bg-[var(--leaf)] text-white">
            <Flower2 size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text)]">Lotus</h1>
            <p className="text-xs text-[var(--muted)]">
              Atendimento inteligente
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            active
              ? "bg-[var(--leaf-light)] text-[var(--leaf-dark)]"
              : "bg-[var(--surface-soft)] text-[var(--muted)]"
          }`}
        >
          {active ? "Bot ativo" : "Bot pausado"}
        </span>
      </div>
    </header>
  );
}
