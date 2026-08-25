"use client";

import { cn } from "@/lib/utils";

interface PlayerBadgeProps {
  nickname: string;
  elo: number;
  country: string;
  isYou?: boolean;
  className?: string;
}

const FLAG_MAP: Record<string, string> = {
  US: "\uD83C\uDDFA\uD83C\uDDF8",
  MX: "\uD83C\uDDF2\uD83C\uDDFD",
  ES: "\uD83C\uDDEA\uD83C\uDDF8",
  AR: "\uD83C\uDDE6\uD83C\uDDF7",
  CO: "\uD83C\uDDE8\uD83C\uDDF4",
  BR: "\uD83C\uDDE7\uD83C\uDDF7",
  JP: "\uD83C\uDDEF\uD83C\uDDF5",
  KR: "\uD83C\uDDF0\uD83C\uDDF7",
  DE: "\uD83C\uDDE9\uD83C\uDDEA",
  FR: "\uD83C\uDDEB\uD83C\uDDF7",
  GB: "\uD83C\uDDEC\uD83C\uDDE7",
  CL: "\uD83C\uDDE8\uD83C\uDDF1",
  PE: "\uD83C\uDDF5\uD83C\uDDEA",
  VE: "\uD83C\uDDFB\uD83C\uDDEA",
};

export function PlayerBadge({
  nickname,
  elo,
  country,
  isYou = false,
  className,
}: PlayerBadgeProps) {
  const flag = FLAG_MAP[country] || "\uD83C\uDDF3\uD83C\uDDF1";

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full glass",
        "border border-border",
        className
      )}
    >
      <span className="text-sm">{flag}</span>
      <span className="text-xs font-medium text-text-bright truncate max-w-[80px]">
        {isYou ? "YOU" : nickname}
      </span>
      <span className="text-[10px] font-mono text-muted">
        {elo}
      </span>
    </div>
  );
}
