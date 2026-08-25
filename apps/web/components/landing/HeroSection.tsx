"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="flex flex-col items-center justify-center gap-8 py-20 px-4">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center"
      >
        <h1 className="text-6xl md:text-8xl font-bold font-mono tracking-tighter text-text-bright">
          AURA
        </h1>
        <h1 className="text-6xl md:text-8xl font-bold font-mono tracking-tighter text-aura aura-glow mt-[-0.2em]">
          ARENA
        </h1>
      </motion.div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-sm text-text-secondary text-center max-w-md font-mono"
      >
        1v1 face duels. Measure your aura. Climb the ranks.
      </motion.p>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring", damping: 15 }}
        onClick={() => router.push("/arena")}
        className="relative px-10 py-4 rounded-2xl font-mono font-semibold text-sm uppercase tracking-wider text-void bg-aura hover:bg-aura-bright transition-all duration-200 shadow-[0_0_24px_oklch(0.78_0.15_85_/_0.3)] hover:shadow-[0_0_36px_oklch(0.78_0.15_85_/_0.5)]"
      >
        ENTER THE ARENA
        <div className="absolute inset-0 rounded-2xl border border-aura-bright/30" />
      </motion.button>

      {/* Stats teaser */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex items-center gap-8 mt-4"
      >
        <div className="flex flex-col items-center">
          <span className="text-lg font-mono font-bold text-text-bright">
            0
          </span>
          <span className="text-[9px] font-mono uppercase tracking-wider text-muted">
            Players Online
          </span>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex flex-col items-center">
          <span className="text-lg font-mono font-bold text-text-bright">
            0
          </span>
          <span className="text-[9px] font-mono uppercase tracking-wider text-muted">
            Duels Today
          </span>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex flex-col items-center">
          <span className="text-lg font-mono font-bold text-text-bright">
            1500
          </span>
          <span className="text-[9px] font-mono uppercase tracking-wider text-muted">
            Starting ELO
          </span>
        </div>
      </motion.div>
    </section>
  );
}
