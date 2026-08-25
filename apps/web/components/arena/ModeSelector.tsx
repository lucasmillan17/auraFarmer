"use client";

import { cn } from "@/lib/utils";
import { useMatchStore, type DuelMode } from "@/stores/matchStore";

interface ModeSelectorProps {
  onSelect: (mode: DuelMode) => void;
  className?: string;
}

export function ModeSelector({ onSelect, className }: ModeSelectorProps) {
  const mode = useMatchStore((s) => s.mode);
  const setMode = useMatchStore((s) => s.setMode);

  return (
    <div className={cn("flex gap-2", className)}>
      <button
        onClick={() => {
          setMode("face");
          onSelect("face");
        }}
        className={cn(
          "flex flex-col items-center gap-1 px-6 py-3 rounded-2xl border transition-all duration-200",
          mode === "face"
            ? "border-aura/40 bg-surface-elevated text-text-bright shadow-[0_0_16px_oklch(0.78_0.15_85_/_0.1)]"
            : "border-border bg-surface text-muted hover:border-border-strong hover:text-text-secondary"
        )}
      >
        <span className="text-2xl">{"\uD83D\uDC64"}</span>
        <span className="text-xs font-mono uppercase tracking-wider">
          FACE
        </span>
        <span className="text-[9px] text-muted">10-15s</span>
      </button>

      <button
        onClick={() => {
          setMode("body");
          onSelect("body");
        }}
        className={cn(
          "flex flex-col items-center gap-1 px-6 py-3 rounded-2xl border transition-all duration-200",
          mode === "body"
            ? "border-aura/40 bg-surface-elevated text-text-bright shadow-[0_0_16px_oklch(0.78_0.15_85_/_0.1)]"
            : "border-border bg-surface text-muted hover:border-border-strong hover:text-text-secondary"
        )}
      >
        <span className="text-2xl">{"\uD83C\uDFC5"}</span>
        <span className="text-xs font-mono uppercase tracking-wider">
          BODY
        </span>
        <span className="text-[9px] text-muted">12-15s</span>
      </button>
    </div>
  );
}
