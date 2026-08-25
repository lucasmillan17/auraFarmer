"use client";

export function SponsorBar() {
  return (
    <div className="w-full border-y border-border bg-surface/50 py-3 overflow-hidden">
      <div className="flex items-center justify-center gap-8 animate-pulse">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-border-strong">
          SPONSORS
        </span>
        <span className="text-[10px] font-mono text-border-strong">
          {"\u2022"}
        </span>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-border-strong">
          YOUR AD HERE
        </span>
        <span className="text-[10px] font-mono text-border-strong">
          {"\u2022"}
        </span>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-border-strong">
          CONTACT
        </span>
      </div>
    </div>
  );
}
