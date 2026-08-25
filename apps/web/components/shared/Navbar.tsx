"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  return (
    <nav
      className={cn(
        "flex items-center justify-between px-6 py-4",
        "border-b border-border bg-void/80 backdrop-blur-md",
        className
      )}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-aura/20 border border-aura/30 flex items-center justify-center">
          <span className="text-aura font-mono font-bold text-sm">A</span>
        </div>
        <span className="text-text-bright font-mono font-semibold tracking-tight text-sm">
          AURA
        </span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-6">
        <Link
          href="/leaderboard"
          className="text-xs font-mono uppercase tracking-wider text-muted hover:text-text-secondary transition-colors"
        >
          Leaderboard
        </Link>
        <a
          href="https://discord.gg/aura-arena"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono uppercase tracking-wider text-muted hover:text-text-secondary transition-colors"
        >
          Discord
        </a>
      </div>
    </nav>
  );
}
