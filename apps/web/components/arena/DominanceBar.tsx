"use client";

import { cn } from "@/lib/utils";

interface DominanceBarProps {
  player1Score: number;
  player2Score: number;
  player1Label?: string;
  player2Label?: string;
  className?: string;
}

export function DominanceBar({
  player1Score,
  player2Score,
  player1Label = "CRINGE",
  player2Label = "SIGMA",
  className,
}: DominanceBarProps) {
  const total = player1Score + player2Score || 1;
  const p1Pct = (player1Score / total) * 100;
  const isP1Dominating = p1Pct > 55;
  const isP2Dominating = p1Pct < 45;

  return (
    <div className={cn("w-full px-4", className)}>
      {/* Labels */}
      <div className="flex justify-between mb-1.5">
        <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted">
          {player1Label}
        </span>
        <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted">
          {player2Label}
        </span>
      </div>

      {/* Bar */}
      <div className="relative h-2 w-full rounded-full bg-border overflow-hidden">
        {/* Player 1 side (left) */}
        <div
          className="absolute left-0 top-0 h-full rounded-l-full transition-all duration-500 ease-out"
          style={{
            width: `${p1Pct}%`,
            background: isP1Dominating
              ? "linear-gradient(to right, #3A3A3A, oklch(0.78 0.15 85))"
              : "linear-gradient(to right, #3A3A3A, #555555)",
            boxShadow: isP1Dominating
              ? "0 0 8px oklch(0.78 0.15 85 / 0.3)"
              : undefined,
          }}
        />
        {/* Center marker */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-0.5 bg-text-bright/50 rounded-full" />
      </div>

      {/* Score comparison */}
      <div className="flex justify-between mt-1">
        <span
          className={cn(
            "text-[10px] font-mono tabular-nums",
            isP1Dominating ? "text-aura" : "text-muted"
          )}
        >
          {player1Score.toFixed(1)}
        </span>
        <span
          className={cn(
            "text-[10px] font-mono tabular-nums",
            isP2Dominating ? "text-aura" : "text-muted"
          )}
        >
          {player2Score.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
