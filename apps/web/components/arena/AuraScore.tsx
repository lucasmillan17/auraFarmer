"use client";

import { cn } from "@/lib/utils";

interface AuraScoreProps {
  score: number;
  label?: string;
  className?: string;
}

export function AuraScore({ score, label = "AURA", className }: AuraScoreProps) {
  const rounded = Math.round(score);
  const isPositive = rounded > 0;
  const isHigh = rounded >= 2000;
  const isLow = rounded < 0;

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <span
        className={cn(
          "text-4xl font-mono font-bold tracking-tighter tabular-nums transition-all duration-300",
          isHigh
            ? "text-aura-bright aura-glow"
            : isPositive
              ? "text-aura"
              : isLow
                ? "text-red-500"
                : "text-muted"
        )}
      >
        {rounded > 0 ? `+${rounded}` : rounded}
      </span>
      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
        {label}
      </span>
    </div>
  );
}
