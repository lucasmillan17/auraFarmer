"use client";

import { GlassCard } from "@/components/shared/GlassCard";
import { RANKS } from "@/lib/ranks";

export function RankShowcase() {
  return (
    <section className="w-full max-w-2xl mx-auto px-4">
      <h2 className="text-center text-xs font-mono uppercase tracking-[0.2em] text-muted mb-6">
        RANK PROGRESSION
      </h2>
      <div className="flex flex-wrap justify-center gap-3">
        {RANKS.map((rank) => (
          <GlassCard key={rank.name} className="px-4 py-3 flex items-center gap-3">
            <span className="text-xl">{rank.icon}</span>
            <div className="flex flex-col">
              <span
                className="text-xs font-mono font-medium"
                style={{
                  color: rank.mono === "aura" ? "var(--color-aura)" : rank.mono,
                }}
              >
                {rank.name}
              </span>
              <span className="text-[9px] font-mono text-muted">
                {rank.minElo}+ ELO
              </span>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
