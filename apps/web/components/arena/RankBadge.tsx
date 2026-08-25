"use client";

import { cn } from "@/lib/utils";

interface RankBadgeProps {
  rank: string;
  isActive?: boolean;
  className?: string;
}

const RANK_CONFIG: Record<string, { icon: string; mono: string }> = {
  "Cringe": { icon: "\uD83D\uDC80", mono: "#3A3A3A" },
  "Mortal": { icon: "\uD83D\uDE10", mono: "#555555" },
  "Normie": { icon: "\uD83D\uDE0E", mono: "#777777" },
  "Chadlite": { icon: "\uD83D\uDCAA", mono: "#999999" },
  "Chad": { icon: "\uD83E\uDD81", mono: "#BBBBBB" },
  "GigaChad": { icon: "\uD83D\uDDFF", mono: "#DDDDDD" },
  "Infinite Aura": { icon: "\uD83D\uDC41\uFE0F", mono: "aura" },
};

export function RankBadge({ rank, isActive = false, className }: RankBadgeProps) {
  const config = RANK_CONFIG[rank] || RANK_CONFIG["Cringe"];
  const isAuraRank = config.mono === "aura";

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full glass",
        "border transition-all duration-300",
        isActive && (isAuraRank || rank !== "Infinite Aura")
          ? "border-aura/30 shadow-[0_0_12px_oklch(0.78_0.15_85_/_0.15)]"
          : "border-border",
        className
      )}
    >
      <span className="text-sm">{config.icon}</span>
      <span
        className="text-xs font-mono font-medium tracking-wide"
        style={{
          color: isAuraRank && isActive ? undefined : config.mono,
          ...(isAuraRank && isActive ? { color: "var(--color-aura)" } : {}),
        }}
      >
        {rank}
      </span>
    </div>
  );
}
