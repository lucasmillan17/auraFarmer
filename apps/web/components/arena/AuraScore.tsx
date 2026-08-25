"use client";

import { cn } from "@/lib/utils";

interface AuraScoreProps {
  score: number;
  label?: string;
  className?: string;
}

export function AuraScore({ score, label = "AURA", className }: AuraScoreProps) {
  const clamped = Math.max(0, Math.min(10, score));
  const percentage = (clamped / 10) * 100;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Score number */}
      <div className="relative">
        <span
          className={cn(
            "text-5xl font-mono font-bold tracking-tighter transition-all duration-300",
            score >= 8
              ? "text-aura-bright aura-glow"
              : score >= 5
                ? "text-aura"
                : "text-muted"
          )}
        >
          {clamped.toFixed(1)}
        </span>
      </div>

      {/* Label */}
      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
        {label}
      </span>

      {/* Vertical energy bar */}
      <div className="relative h-32 w-2 rounded-full bg-border overflow-hidden">
        <div
          className="absolute bottom-0 left-0 w-full rounded-full transition-all duration-500 ease-out"
          style={{
            height: `${percentage}%`,
            background:
              clamped >= 8
                ? "linear-gradient(to top, oklch(0.78 0.15 85), oklch(0.88 0.18 85))"
                : clamped >= 5
                  ? "linear-gradient(to top, oklch(0.55 0.10 85), oklch(0.78 0.15 85))"
                  : "linear-gradient(to top, #3A3A3A, #555555)",
            boxShadow:
              clamped >= 8
                ? "0 0 12px oklch(0.78 0.15 85 / 0.4)"
                : "none",
          }}
        />
      </div>
    </div>
  );
}
